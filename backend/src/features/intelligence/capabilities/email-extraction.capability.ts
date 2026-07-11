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
import { DeterministicExtractor } from '../../email-sync/pre-extraction/deterministic-extractor';

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
  threadId?: string;
  subject: string;
  from: string;
  fromName?: string;
  body: string;
  date: string;
  preExtracted?: {
    companyName: string | null;
    jobTitle: string | null;
    category: string | null;
    confidence: number;
    extractedFields: string[];
    atsProvider: string | null;
    applicationId: string | null;
    requisitionId: string | null;
  };
}

@Injectable()
export class EmailExtractionCapability implements IntelligenceCapability, OnModuleInit {
  readonly definition = EMAIL_EXTRACTION_DEFINITION;

  private aiProvider: AiProvider;

  private static readonly SIMPLE_CATEGORIES = new Set([
    'application_sent',
    'application_viewed',
    'rejection',
    'follow_up',
  ]);

  private static readonly EXTRACTION_CATEGORIES = new Set([
    'interview_invite',
    'interview_scheduled',
    'offer',
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

    let classification;
    const preExtracted = data.preExtracted;

    if (preExtracted && preExtracted.confidence >= 0.7 && preExtracted.category) {
      classification = {
        category: preExtracted.category,
        application: {
          companyName: preExtracted.companyName || this.extractCompanyFromEmail(data.from),
          jobTitle: preExtracted.jobTitle,
        },
        recruiter: {
          name: data.fromName || null,
          email: data.from,
        },
        confidence: preExtracted.confidence,
      };
    } else {
      classification = await this.aiProvider.classifyEmail(email);
    }

    await this.prisma.intelligenceArtifact.create({
      data: {
        userId: data.userId,
        type: 'email_classification',
        objective: 'Classify hiring email',
        data: classification as unknown as Prisma.InputJsonValue,
        confidence: preExtracted?.confidence || 0.9,
        sourceEvent: 'email.hiring.detected',
        sourceEmailId: data.emailId,
      },
    });

    artifacts.push({
      type: 'email_classification',
      objective: 'Classify hiring email',
      data: classification as unknown as Record<string, unknown>,
      confidence: preExtracted?.confidence || 0.9,
    });

    let mergedResult = { ...classification };

    // Only call LLM extraction for complex categories that need detailed extraction
    // Simple categories (application_sent, application_viewed, rejection, follow_up) have all needed info from classification
    const needsExtraction = EmailExtractionCapability.EXTRACTION_CATEGORIES.has(classification.category);

    if (needsExtraction) {
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

        if (preExtracted) {
          if (preExtracted.requisitionId && !details.application.notes) {
            details.application.notes = `Requisition ID: ${preExtracted.requisitionId}`;
          }
          if (preExtracted.atsProvider && !details.application.notes) {
            details.application.notes = `ATS: ${preExtracted.atsProvider}`;
          } else if (preExtracted.atsProvider && details.application.notes) {
            details.application.notes += ` | ATS: ${preExtracted.atsProvider}`;
          }
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

        mergedResult = this.mergeResults(classification, details);
      } catch (err) {
        console.warn(
          `Phase 2 enrichment failed for email ${data.emailId} (${classification.category}), base app already created:`,
          err,
        );
      }
    }

    await this.eventBus.publish('intelligence.application.extracted', {
      userId: data.userId,
      sourceEmailId: data.emailId,
      result: mergedResult,
      emailDate: data.date,
      threadId: data.threadId || null,
      senderEmail: data.from,
      senderName: data.fromName || null,
      subject: data.subject,
      body: data.body,
    });

    return { artifacts };
  }

  private mergeResults(classification: Record<string, unknown>, details: Record<string, unknown>): Record<string, unknown> {
    const merged = { ...classification };

    if (details.application) {
      merged.application = { ...(classification.application as object), ...(details.application as object) };
    }
    if (details.recruiter) {
      merged.recruiter = { ...(classification.recruiter as object), ...(details.recruiter as object) };
    }
    if (details.interview) {
      merged.interview = details.interview;
    }
    if (details.offer) {
      merged.offer = details.offer;
    }

    return merged;
  }

  private extractCompanyFromEmail(fromEmail: string): string | null {
    const domain = fromEmail.match(/@(.+)$/)?.[1];
    if (!domain) return null;

    const cleanDomain = domain
      .replace(/^(mail|app|noreply|no-reply|donotreply|jobs|careers|recruiting)\./, '')
      .replace(/\.(com|io|co|org|net)$/, '');

    if (cleanDomain.length < 2) return null;

    return cleanDomain.charAt(0).toUpperCase() + cleanDomain.slice(1);
  }
}