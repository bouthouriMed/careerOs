import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../../platform/prisma/prisma.service';
import { EventPayload } from '../../../platform/event-bus/event-bus.interface';
import { ContextProfile, AssembledContext } from './types';
import { EMAIL_EXTRACTION_CONTEXT } from './profiles/email-extraction.profile';

@Injectable()
export class ContextBuilder implements OnModuleInit {
  private readonly logger = new Logger(ContextBuilder.name);
  private profiles = new Map<string, ContextProfile>();

  constructor(private prisma: PrismaService) {}

  onModuleInit(): void {
    this.registerProfile(EMAIL_EXTRACTION_CONTEXT);
    this.logger.log(`Registered ${this.profiles.size} context profile(s)`);
  }

  registerProfile(profile: ContextProfile): void {
    this.profiles.set(profile.id, profile);
  }

  getProfile(profileId: string): ContextProfile | undefined {
    return this.profiles.get(profileId);
  }

  async assemble(
    profileId: string,
    eventName: string,
    payload: EventPayload,
  ): Promise<AssembledContext> {
    const profile = this.profiles.get(profileId);
    if (!profile) {
      throw new Error(`Context profile not found: ${profileId}`);
    }

    const userId = payload.userId as string;
    const includedEntities: string[] = [];
    const excludedEntities: string[] = [];

    const [applications, companies, jobs, interviews, memory, artifacts] =
      await Promise.all([
        this.collectApplications(userId, profile, includedEntities, excludedEntities),
        this.collectCompanies(userId, profile, includedEntities, excludedEntities),
        this.collectJobs(userId, profile, includedEntities, excludedEntities),
        this.collectInterviews(userId, profile, includedEntities, excludedEntities),
        this.collectCareerMemory(userId, profile, includedEntities, excludedEntities),
        this.collectArtifacts(userId, profile, includedEntities, excludedEntities),
      ]);

    const context: AssembledContext = {
      profileId,
      trigger: { eventName, payload: payload as Record<string, unknown> },
      businessData: { applications, companies, jobs, interviews },
      careerMemory: memory,
      artifacts,
      metadata: {
        totalTokens: this.estimateTokens(applications, companies, jobs, interviews, memory, artifacts),
        includedEntities,
        excludedEntities,
        assembledAt: new Date(),
      },
    };

    this.logger.log(
      `Assembled context for ${profileId}: ${context.metadata.includedEntities.length} entities, ~${context.metadata.totalTokens} tokens`,
    );

    return context;
  }

  private async collectApplications(
    userId: string,
    profile: ContextProfile,
    included: string[],
    excluded: string[],
  ): Promise<unknown[]> {
    if (!profile.requiredEntities.includes('applications')) {
      excluded.push('applications');
      return [];
    }

    const applications = await this.prisma.application.findMany({
      where: { userId },
      include: { company: true, job: true },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    included.push('applications');
    return applications;
  }

  private async collectCompanies(
    userId: string,
    profile: ContextProfile,
    included: string[],
    excluded: string[],
  ): Promise<unknown[]> {
    if (!profile.requiredEntities.includes('companies')) {
      excluded.push('companies');
      return [];
    }

    const companies = await this.prisma.company.findMany({
      where: { applications: { some: { userId } } },
      take: 10,
    });

    included.push('companies');
    return companies;
  }

  private async collectJobs(
    userId: string,
    profile: ContextProfile,
    included: string[],
    excluded: string[],
  ): Promise<unknown[]> {
    if (!profile.requiredEntities.includes('jobs')) {
      excluded.push('jobs');
      return [];
    }

    const jobs = await this.prisma.job.findMany({
      where: { applications: { some: { userId } } },
      take: 10,
    });

    included.push('jobs');
    return jobs;
  }

  private async collectInterviews(
    userId: string,
    profile: ContextProfile,
    included: string[],
    excluded: string[],
  ): Promise<unknown[]> {
    if (!profile.requiredEntities.includes('interviews')) {
      excluded.push('interviews');
      return [];
    }

    const interviews = await this.prisma.interview.findMany({
      where: { application: { userId } },
      orderBy: { scheduledAt: 'desc' },
      take: 10,
    });

    included.push('interviews');
    return interviews;
  }

  private async collectCareerMemory(
    userId: string,
    profile: ContextProfile,
    included: string[],
    excluded: string[],
  ): Promise<unknown[]> {
    if (profile.memoryCategories.length === 0) {
      excluded.push('career_memory');
      return [];
    }

    const memory = await this.prisma.careerMemory.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      take: 20,
    });

    included.push('career_memory');
    return memory;
  }

  private async collectArtifacts(
    userId: string,
    profile: ContextProfile,
    included: string[],
    excluded: string[],
  ): Promise<unknown[]> {
    if (profile.artifactTypes.length === 0) {
      excluded.push('artifacts');
      return [];
    }

    const artifacts = await this.prisma.intelligenceArtifact.findMany({
      where: {
        userId,
        type: { in: profile.artifactTypes },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    included.push('artifacts');
    return artifacts;
  }

  private estimateTokens(...arrays: unknown[][]): number {
    const totalItems = arrays.reduce((sum, arr) => sum + arr.length, 0);
    return totalItems * 150;
  }
}
