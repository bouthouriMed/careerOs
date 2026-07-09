import { Injectable, OnModuleInit } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { InProcessEventBus } from '../../../platform/event-bus/event-bus';
import { PrismaService } from '../../../platform/prisma/prisma.service';
import { AiProvider, EmailContent } from '../ai-provider';
import { createAiProvider } from '../ai-provider.factory';

interface QueuedEmail {
  userId: string;
  emailId: string;
  subject: string;
  from: string;
  fromName?: string;
  body: string;
  date: string;
}

@Injectable()
export class EmailExtractionCapability implements OnModuleInit {
  private aiProvider: AiProvider;
  private queue: QueuedEmail[] = [];
  private processing = false;

  private static readonly DETAIL_CATEGORIES = new Set([
    'interview_invite',
    'interview_scheduled',
    'offer',
    'application_sent',
    'application_viewed',
  ]);

  constructor(
    private eventBus: InProcessEventBus,
    private prisma: PrismaService,
  ) {
    this.aiProvider = createAiProvider();
  }

  onModuleInit(): void {
    this.eventBus.subscribe('email.hiring.detected', async (payload) => {
      const data = payload as unknown as QueuedEmail;
      this.queue.push(data);
      this.processQueue();
    });
  }

  private async processQueue(): Promise<void> {
    if (this.processing) return;
    this.processing = true;

    while (this.queue.length > 0) {
      const email = this.queue.shift()!;
      try {
        await this.handleHiringEmail(email);
      } catch (err) {
        console.error(`Email extraction failed for email ${email.emailId}:`, err);
      }
      await this.delay(200);
    }

    this.processing = false;
  }

  private async handleHiringEmail(data: QueuedEmail) {
    const email: EmailContent = {
      subject: data.subject,
      from: data.from,
      fromName: data.fromName,
      body: data.body,
      date: new Date(data.date),
    };

    // Phase 1 — quick classification, creates the application
    const classification = await this.aiProvider.classifyEmail(email);

    await this.prisma.intelligenceArtifact.create({
      data: {
        userId: data.userId,
        type: 'email_classification',
        objective: 'Classify hiring email',
        data: classification as unknown as Prisma.InputJsonValue,
        confidence: 0.9,
        sourceEvent: 'email.hiring.detected',
        sourceEmailId: data.emailId,
      },
    });

    this.eventBus.publish('intelligence.application.extracted', {
      userId: data.userId,
      sourceEmailId: data.emailId,
      result: classification,
    });

    // Phase 2 — enrich with details for emails that need it
    if (EmailExtractionCapability.DETAIL_CATEGORIES.has(classification.category)) {
      try {
        const details = await this.aiProvider.extractEmail(email, {
          companyName: classification.application.companyName,
          jobTitle: classification.application.jobTitle || undefined,
          category: classification.category,
        });

        // Ensure company/job identity so enrichment finds the Phase 1 app
        details.application.companyName = classification.application.companyName;
        if (classification.application.jobTitle) {
          details.application.jobTitle = classification.application.jobTitle;
        }

        await this.prisma.intelligenceArtifact.create({
          data: {
            userId: data.userId,
            type: 'email_extraction',
            objective: 'Extract structured data from hiring email',
            data: details as unknown as Prisma.InputJsonValue,
            confidence: 0.9,
            sourceEvent: 'email.hiring.detected',
            sourceEmailId: data.emailId,
          },
        });

        this.eventBus.publish('intelligence.application.extracted', {
          userId: data.userId,
          sourceEmailId: data.emailId,
          result: details,
        });
      } catch (err) {
        console.warn(`Phase 2 enrichment failed for email ${data.emailId} (${classification.category}), base app already created:`, err);
      }
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
