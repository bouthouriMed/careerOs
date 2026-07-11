import { Injectable, Logger } from '@nestjs/common';
import { SignalType, SignalPriority } from '@prisma/client';
import { PrismaService } from '../../../platform/prisma/prisma.service';
import { ArtifactForEvaluation, SignalEvaluation } from './types';

@Injectable()
export class SignalGenerator {
  private readonly logger = new Logger(SignalGenerator.name);

  constructor(private prisma: PrismaService) {}

  async linkToApplication(
    signalId: string,
    userId: string,
    companyName?: string,
  ): Promise<void> {
    if (!companyName) return;

    const app = await this.prisma.application.findFirst({
      where: {
        userId,
        company: { name: { equals: companyName, mode: 'insensitive' } },
      },
      select: { id: true, companyId: true },
    });

    if (app) {
      await this.prisma.careerSignal.update({
        where: { id: signalId },
        data: { applicationId: app.id, companyId: app.companyId },
      });
      this.logger.log(`Linked signal ${signalId} to application ${app.id}`);
    }
  }

  evaluate(artifact: ArtifactForEvaluation): SignalEvaluation {
    switch (artifact.type) {
      case 'email_classification':
        return this.evaluateEmailClassification(artifact);
      case 'email_extraction':
        return this.evaluateEmailExtraction(artifact);
      default:
        return { shouldGenerate: false, type: 'Insight', priority: 'Low', title: '', description: '', surfaces: [] };
    }
  }

  async generate(
    userId: string,
    evaluation: SignalEvaluation,
    artifactId?: string,
    applicationId?: string,
    companyId?: string,
  ): Promise<string | null> {
    if (!evaluation.shouldGenerate) return null;

    const existing = await this.prisma.careerSignal.findFirst({
      where: {
        userId,
        title: evaluation.title,
        status: 'Active',
      },
    });

    if (existing) {
      this.logger.debug(`Signal already exists: ${existing.id}`);
      return existing.id;
    }

    const signal = await this.prisma.careerSignal.create({
      data: {
        userId,
        type: evaluation.type,
        priority: evaluation.priority,
        title: evaluation.title,
        description: evaluation.description,
        confidence: 0.9,
        sourceArtifactId: artifactId,
        applicationId,
        companyId,
        surfaces: evaluation.surfaces,
        expiresAt: evaluation.expiresInDays
          ? new Date(Date.now() + evaluation.expiresInDays * 24 * 60 * 60 * 1000)
          : null,
      },
    });

    this.logger.log(`Generated signal: ${signal.id} (${signal.type})`);
    return signal.id;
  }

  private evaluateEmailClassification(artifact: ArtifactForEvaluation): SignalEvaluation {
    const data = artifact.data as { category?: string; application?: { companyName?: string } };
    const category = data.category;
    const company = data.application?.companyName || 'Unknown';

    switch (category) {
      case 'interview_invite':
        return {
          shouldGenerate: true,
          type: 'Action',
          priority: 'High',
          title: `Interview invitation from ${company}`,
          description: `You received an interview invitation from ${company}. Prepare for the interview.`,
          surfaces: ['dashboard', 'extension'],
          expiresInDays: 7,
        };
      case 'interview_scheduled':
        return {
          shouldGenerate: true,
          type: 'Reminder',
          priority: 'High',
          title: `Interview scheduled with ${company}`,
          description: `An interview has been scheduled with ${company}. Review the details.`,
          surfaces: ['dashboard', 'extension'],
          expiresInDays: 3,
        };
      case 'offer':
        return {
          shouldGenerate: true,
          type: 'Alert',
          priority: 'Urgent',
          title: `Offer received from ${company}`,
          description: `You received a job offer from ${company}. Review the terms.`,
          surfaces: ['dashboard', 'extension', 'notifications'],
          expiresInDays: 14,
        };
      case 'rejection':
        return {
          shouldGenerate: true,
          type: 'Insight',
          priority: 'Medium',
          title: `Application update from ${company}`,
          description: `You received an update on your application with ${company}.`,
          surfaces: ['dashboard'],
          expiresInDays: 30,
        };
      default:
        return { shouldGenerate: false, type: 'Insight', priority: 'Low', title: '', description: '', surfaces: [] };
    }
  }

  private evaluateEmailExtraction(artifact: ArtifactForEvaluation): SignalEvaluation {
    const data = artifact.data as { category?: string; application?: { companyName?: string; jobTitle?: string } };
    const category = data.category;
    const company = data.application?.companyName || 'Unknown';
    const job = data.application?.jobTitle || 'position';

    if (category === 'application_sent') {
      return {
        shouldGenerate: true,
        type: 'Insight',
        priority: 'Low',
        title: `Application tracked for ${job} at ${company}`,
        description: `Your application for ${job} at ${company} has been tracked.`,
        surfaces: ['dashboard'],
        expiresInDays: 30,
      };
    }

    return { shouldGenerate: false, type: 'Insight', priority: 'Low', title: '', description: '', surfaces: [] };
  }
}
