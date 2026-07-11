import { Injectable, OnModuleInit } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { InProcessEventBus } from '../../../platform/event-bus/event-bus';
import { EventPayload } from '../../../platform/event-bus/event-bus.interface';
import { PrismaService } from '../../../platform/prisma/prisma.service';
import { AiProvider, EmailContent } from '../ai-provider';
import { createAiProvider } from '../ai-provider.factory';
import {
  CapabilityRegistry,
  CapabilityDefinition,
  IntelligenceCapability,
  CapabilityResult,
} from '../capability-registry';
import { IntelligenceOrchestrator } from '../intelligence-orchestrator';
import { AssembledContext } from '../context-builder';

const EMAIL_EXTRACTION_DEFINITION: CapabilityDefinition = {
  id: 'email-extraction',
  name: 'Email Extraction',
  description: 'Extracts structured job application data from hiring-related emails',
  objective: 'Help the user understand the status of their job applications by extracting structured data from hiring emails',
  triggerType: 'event',
  triggerEvent: 'email.hiring.detected',
  executionMode: 'background',
  contextProfile: 'email-extraction',
  outputType: 'intelligence.artifact',
  signalThreshold: 0.7,
  timeout: 30000,
  enabled: true,
};

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
export class EmailExtractionCapability implements IntelligenceCapability, OnModuleInit {
  readonly definition = EMAIL_EXTRACTION_DEFINITION;

  private aiProvider: AiProvider;

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
    private registry: CapabilityRegistry,
    private orchestrator: IntelligenceOrchestrator,
  ) {
    this.aiProvider = createAiProvider();
  }

  onModuleInit(): void {
    this.registry.register(EMAIL_EXTRACTION_DEFINITION);
    this.orchestrator.registerCapability(this);
  }

  async execute(payload: EventPayload, _context?: AssembledContext): Promise<CapabilityResult> {
    const data = payload as unknown as QueuedEmail;
    const artifacts: CapabilityResult['artifacts'] = [];

    const email: EmailContent = {
      subject: data.subject,
      from: data.from,
      fromName: data.fromName,
      body: data.body,
      date: new Date(data.date),
    };

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

    artifacts.push({
      type: 'email_classification',
      objective: 'Classify hiring email',
      data: classification as unknown as Record<string, unknown>,
      confidence: 0.9,
    });

    await this.eventBus.publish('intelligence.application.extracted', {
      userId: data.userId,
      sourceEmailId: data.emailId,
      result: classification,
      emailDate: data.date,
    });

    if (EmailExtractionCapability.DETAIL_CATEGORIES.has(classification.category)) {
      try {
        const details = await this.aiProvider.extractEmail(email, {
          companyName: classification.application.companyName,
          jobTitle: classification.application.jobTitle || undefined,
          category: classification.category,
        });

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

        artifacts.push({
          type: 'email_extraction',
          objective: 'Extract structured data from hiring email',
          data: details as unknown as Record<string, unknown>,
          confidence: 0.9,
        });

        await this.eventBus.publish('intelligence.application.extracted', {
          userId: data.userId,
          sourceEmailId: data.emailId,
          result: details,
          emailDate: data.date,
        });
      } catch (err) {
        console.warn(
          `Phase 2 enrichment failed for email ${data.emailId} (${classification.category}), base app already created:`,
          err,
        );
      }
    }

    return { artifacts };
  }
}
