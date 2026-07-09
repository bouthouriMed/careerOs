import { Injectable, OnModuleInit } from '@nestjs/common';
import { google, gmail_v1 } from 'googleapis';
import { PrismaService } from '../../platform/prisma/prisma.service';
import { TokenService } from '../../platform/auth/token.service';
import { InProcessEventBus } from '../../platform/event-bus/event-bus';
import { EmailSyncService } from './email-sync.service';
import { authConfig } from '../../platform/config/auth.config';

const HIRING_KEYWORDS = [
  'application', 'interview', 'offer', 'recruiter', 'hiring',
  'your application', 'job opportunity', 'we reviewed', 'next steps',
  'thanks for applying', 'thank you for your interest',
  'phone screen', 'technical screen', 'onsite', 'take home',
];

@Injectable()
export class GmailSyncService implements OnModuleInit {
  private readonly config = authConfig();

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
        console.error(`Gmail sync failed for user ${userId}:`, err);
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

    const query = this.buildQuery();
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

          if (this.isHiringRelated(subject, from)) {
            this.eventBus.publish('email.hiring.detected', {
              userId,
              emailId: msg.id,
              subject,
              from: this.parseEmail(from),
              fromName,
              body,
              date,
            });
            hiringDetected++;
          }

          totalScanned++;
        } catch {
          // skip individual email failures
        }
      }

      await this.emailSyncService.updateProgress(userId, {
        emailsScanned: totalScanned,
        applicationsDetected: hiringDetected,
      });

      nextPageToken = response.data.nextPageToken ?? undefined;
    } while (nextPageToken && totalScanned < 500);

    await this.emailSyncService.completeSync(userId);
  }

  private buildQuery(): string {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const dateStr = thirtyDaysAgo.toISOString().split('T')[0];

    const keywordQueries = HIRING_KEYWORDS.map((kw) => `subject:(${kw})`).join(' OR ');
    return `(${keywordQueries}) after:${dateStr}`;
  }

  private isHiringRelated(subject: string, from: string): boolean {
    const lowerSubject = subject.toLowerCase();
    const lowerFrom = from.toLowerCase();

    const atsDomains = [
      'greenhouse.io', 'lever.co', 'workable.com', 'bamboohr.com',
      'icims.com', 'smartrecruiters.com', 'jobvite.com', 'applytojob.com',
      'ashbyhq.com', 'pinpointhq.com', 'recruitee.com', 'comeet.com',
    ];

    const isFromAts = atsDomains.some((d) => lowerFrom.includes(d));

    if (isFromAts) return true;

    return HIRING_KEYWORDS.some((kw) => lowerSubject.includes(kw));
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
        if (mimeType === 'text/html' && part.body?.data && !payload.parts.some(p => p.mimeType === 'text/plain')) {
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
