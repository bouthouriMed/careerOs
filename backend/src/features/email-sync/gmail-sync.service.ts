import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { google, gmail_v1 } from 'googleapis';
import { PrismaService } from '../../platform/prisma/prisma.service';
import { TokenService } from '../../platform/auth/token.service';
import { InProcessEventBus } from '../../platform/event-bus/event-bus';
import { EmailSyncService } from './email-sync.service';
import { authConfig } from '../../platform/config/auth.config';
import { DeterministicExtractor } from './pre-extraction/deterministic-extractor';
import { AtsRegistry } from './ats/ats-registry';

const HIRING_KEYWORDS = [
  'application', 'interview', 'offer', 'recruiter', 'hiring',
  'your application', 'job opportunity', 'we reviewed', 'next steps',
  'thanks for applying', 'thank you for your interest',
  'phone screen', 'technical screen', 'onsite', 'take home',
  'schedule', 'position', 'role', 'candidate',
];

const NEGATIVE_KEYWORDS = [
  'newsletter', 'digest', 'weekly update', 'unsubscribe',
  'marketing', 'promo', 'advertisement', 'sale',
  'subscription', 'account confirmation', 'password reset',
];

const ATS_DOMAINS = [
  'greenhouse.io', 'lever.co', 'workable.com', 'bamboohr.com',
  'icims.com', 'smartrecruiters.com', 'jobvite.com', 'applytojob.com',
  'ashbyhq.com', 'pinpointhq.com', 'recruitee.com', 'comeet.com',
  'teamtailor.com', 'breezy.hr', 'jazz.co', 'recruit.net',
  'hire.lever.co', 'jobs.lever.co', 'greenhouse-mail.io',
  'myworkdayjobs.com', 'wd5.myworkday.com', 'successfactors.com',
  'ultipro.com', 'adp.com', 'paycom.com', 'paylocity.com',
];

const SENDER_PATTERNS: Array<{ pattern: RegExp; type: string }> = [
  { pattern: /^noreply@|^no-reply@|^donotreply@/i, type: 'ats' },
  { pattern: /recruiting@|talent@|hiring@|jobs@|careers@/i, type: 'company' },
  { pattern: /recruiter|talent|recruiting/i, type: 'recruiter' },
];

const INITIAL_SYNC_DAYS = 365;
const MAX_EMAILS_INITIAL = 2000;
const MAX_EMAILS_INCREMENTAL = 500;

@Injectable()
export class GmailSyncService implements OnModuleInit {
  private readonly config = authConfig();
  private readonly logger = new Logger(GmailSyncService.name);

  constructor(
    private prisma: PrismaService,
    private tokenService: TokenService,
    private eventBus: InProcessEventBus,
    private emailSyncService: EmailSyncService,
  ) {}

  onModuleInit(): void {
    this.eventBus.subscribe('email.sync.started', async (payload) => {
      const { userId } = payload as { userId: string };
      await this.processSync(userId).catch((err) => {
        this.logger.error(`Gmail sync failed for user ${userId}: ${err.message}`);
        this.emailSyncService.failSync(userId, err.message).catch(() => {});
      });
    });
  }

  private async processSync(userId: string): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user?.googleRefreshToken) {
      throw new Error('No Google refresh token found. Re-authentication required.');
    }

    const refreshToken = this.tokenService.decrypt(user.googleRefreshToken);
    const accessToken = user.googleAccessToken
      ? this.tokenService.decrypt(user.googleAccessToken)
      : undefined;

    const oauth2Client = new google.auth.OAuth2(
      this.config.google.clientId,
      this.config.google.clientSecret,
      this.config.google.callbackUrl,
    );

    oauth2Client.setCredentials({
      refresh_token: refreshToken,
      access_token: accessToken,
      expiry_date: user.googleTokenExpiresAt?.getTime(),
    });

    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    const syncState = await this.prisma.emailSyncState.findUnique({ where: { userId } });
    const isIncremental = syncState?.lastSyncedAt != null;
    const query = this.buildQuery(isIncremental ? syncState!.lastSyncedAt! : null);
    const maxEmails = isIncremental ? MAX_EMAILS_INCREMENTAL : MAX_EMAILS_INITIAL;

    const processedEmailIds = new Set<string>();
    let totalScanned = 0;
    let hiringDetected = 0;
    let nextPageToken: string | undefined;

    do {
      const response = await gmail.users.messages.list({
        userId: 'me',
        q: query,
        maxResults: 50,
        pageToken: nextPageToken,
      });

      const messages = response.data.messages || [];
      if (messages.length === 0) break;

      for (const msg of messages) {
        if (!msg.id) continue;
        if (processedEmailIds.has(msg.id)) continue;

        try {
          const detail = await gmail.users.messages.get({
            userId: 'me',
            id: msg.id,
            format: 'full',
          });

          const headers = detail.data.payload?.headers || [];
          const subject = headers.find((h) => h.name === 'Subject')?.value || '';
          const from = headers.find((h) => h.name === 'From')?.value || '';
          const date = headers.find((h) => h.name === 'Date')?.value || '';
          const fromName = this.parseFromName(from);
          const body = this.getEmailBody(detail.data.payload);
          const threadId = detail.data.threadId || null;

          const detection = this.detectHiringRelated(subject, from, body);

          if (detection.isHiringRelated) {
            const alreadyProcessed = await this.isEmailAlreadyProcessed(msg.id);
            if (!alreadyProcessed) {
              const preExtracted = DeterministicExtractor.extractFromSubject(subject);
              const senderPreExtract = DeterministicExtractor.extractFromSender(
                this.parseEmail(from),
                fromName,
              );
              const atsDetection = AtsRegistry.detect(
                this.parseEmail(from),
                subject,
                body,
              );

              await this.storeEmailEvidence(userId, msg.id, threadId, {
                subject,
                from: this.parseEmail(from),
                fromName,
                body,
                date: new Date(date),
                senderType: detection.senderType,
                atsProvider: detection.atsProvider,
              });

              await this.eventBus.publish('email.hiring.detected', {
                userId,
                emailId: msg.id,
                threadId,
                subject,
                from: this.parseEmail(from),
                fromName,
                body,
                date,
                detectionConfidence: detection.confidence,
                senderType: detection.senderType,
                atsProvider: detection.atsProvider,
                senderEmail: this.parseEmail(from),
                preExtracted: {
                  companyName: preExtracted.companyName || senderPreExtract.companyName,
                  jobTitle: preExtracted.jobTitle,
                  category: preExtracted.category,
                  confidence: preExtracted.confidence,
                  extractedFields: preExtracted.extractedFields,
                  atsProvider: atsDetection.provider,
                  applicationId: atsDetection.applicationId,
                  requisitionId: atsDetection.requisitionId,
                },
              });
              hiringDetected++;
            }
          }

          processedEmailIds.add(msg.id);
          totalScanned++;
        } catch {
          this.logger.warn(`Failed to process email ${msg.id}`);
        }
      }

      await this.emailSyncService.updateProgress(userId, {
        emailsScanned: totalScanned,
        applicationsDetected: hiringDetected,
      });

      nextPageToken = response.data.nextPageToken ?? undefined;
    } while (nextPageToken && totalScanned < maxEmails);

    await this.emailSyncService.completeSync(userId);
  }

  private detectHiringRelated(
    subject: string,
    from: string,
    body: string,
  ): {
    isHiringRelated: boolean;
    confidence: number;
    senderType: string;
    atsProvider: string | null;
  } {
    const lowerSubject = subject.toLowerCase();
    const lowerFrom = from.toLowerCase();
    const lowerBody = body.toLowerCase();

    const hasNegative = NEGATIVE_KEYWORDS.some((kw) => lowerSubject.includes(kw));
    if (hasNegative) {
      return { isHiringRelated: false, confidence: 0, senderType: 'unknown', atsProvider: null };
    }

    const atsDomain = ATS_DOMAINS.find((d) => lowerFrom.includes(d));
    if (atsDomain) {
      return {
        isHiringRelated: true,
        confidence: 0.95,
        senderType: 'ats',
        atsProvider: atsDomain,
      };
    }

    let senderType = 'unknown';
    for (const { pattern, type } of SENDER_PATTERNS) {
      if (pattern.test(lowerFrom)) {
        senderType = type;
        break;
      }
    }

    const keywordMatches = HIRING_KEYWORDS.filter((kw) => lowerSubject.includes(kw)).length;
    const bodyKeywordMatches = HIRING_KEYWORDS.filter((kw) => lowerBody.includes(kw)).length;

    let confidence = 0;

    if (keywordMatches >= 2) {
      confidence = 0.8;
    } else if (keywordMatches === 1) {
      confidence = 0.6;
    }

    if (senderType === 'recruiter') {
      confidence = Math.min(0.9, confidence + 0.2);
    } else if (senderType === 'company') {
      confidence = Math.min(0.85, confidence + 0.15);
    }

    if (bodyKeywordMatches >= 3) {
      confidence = Math.min(0.85, confidence + 0.1);
    }

    return {
      isHiringRelated: confidence >= 0.5,
      confidence,
      senderType,
      atsProvider: null,
    };
  }

  private async storeEmailEvidence(
    userId: string,
    emailId: string,
    threadId: string | null,
    data: {
      subject: string;
      from: string;
      fromName: string | undefined;
      body: string;
      date: Date;
      senderType: string;
      atsProvider: string | null;
    },
  ): Promise<void> {
    await this.prisma.emailEvidence.upsert({
      where: { emailId },
      create: {
        userId,
        emailId,
        threadId,
        subject: data.subject,
        from: data.from,
        fromName: data.fromName,
        body: data.body,
        emailDate: data.date,
        senderType: data.senderType,
        atsProvider: data.atsProvider,
      },
      update: {},
    });
  }

  private async isEmailAlreadyProcessed(emailId: string): Promise<boolean> {
    const existing = await this.prisma.processedEmail.findUnique({
      where: { emailId },
      select: { id: true },
    });
    return existing != null;
  }

  private buildQuery(sinceDate: Date | null): string {
    let dateStr: string;

    if (sinceDate) {
      dateStr = sinceDate.toISOString().split('T')[0];
    } else {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - INITIAL_SYNC_DAYS);
      dateStr = cutoff.toISOString().split('T')[0];
    }

    const keywordQueries = HIRING_KEYWORDS.map((kw) => `subject:(${kw})`).join(' OR ');
    return `(${keywordQueries}) after:${dateStr}`;
  }

  private parseEmail(from: string): string {
    const match = from.match(/<(.+?)>/);
    return match ? match[1] : from.trim();
  }

  private parseFromName(from: string): string | undefined {
    const match = from.match(/^(.+?)\s*</);
    return match ? match[1].trim().replace(/^"|"$/g, '') : undefined;
  }

  private getEmailBody(payload: gmail_v1.Schema$MessagePart | undefined): string {
    if (!payload) return '';

    if (payload.body?.data) {
      return Buffer.from(payload.body.data, 'base64url').toString('utf-8');
    }

    if (payload.parts) {
      for (const part of payload.parts) {
        const mimeType = part.mimeType || '';
        if (mimeType === 'text/plain' && part.body?.data) {
          return Buffer.from(part.body.data, 'base64url').toString('utf-8');
        }
        if (mimeType === 'text/html' && part.body?.data && !payload.parts.some((p) => p.mimeType === 'text/plain')) {
          const html = Buffer.from(part.body.data, 'base64url').toString('utf-8');
          return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
        }
        if (part.parts) {
          const nested = this.getEmailBody(part);
          if (nested) return nested;
        }
      }
    }

    return '';
  }
}
