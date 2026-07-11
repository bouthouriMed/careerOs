import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../platform/prisma/prisma.service';
import {
  ApplicationCandidate,
  EmailSignals,
  ResolutionResult,
  ResolutionSignal,
} from './types';

const WEIGHTS = {
  thread_id: 0.30,
  recruiter_email: 0.25,
  ats_provider: 0.15,
  requisition_id: 0.25,
  company_domain: 0.20,
  job_title: 0.15,
  sender_reputation: 0.10,
  historical_relationship: 0.10,
};

const HIGH_CONFIDENCE_THRESHOLD = 0.7;
const AMBIGUOUS_THRESHOLD = 0.4;

@Injectable()
export class IdentityResolutionEngine {
  private readonly logger = new Logger(IdentityResolutionEngine.name);

  constructor(private prisma: PrismaService) {}

  async resolve(userId: string, signals: EmailSignals): Promise<ResolutionResult> {
    const candidates = await this.findCandidates(userId, signals);

    if (candidates.length === 0) {
      return {
        matched: false,
        applicationId: null,
        confidence: 0,
        signals: [],
        method: 'no_match',
        candidateCount: 0,
      };
    }

    const scoredCandidates = candidates.map((candidate) => ({
      candidate,
      score: this.scoreCandidate(candidate, signals),
    }));

    scoredCandidates.sort((a, b) => b.score.total - a.score.total);

    const best = scoredCandidates[0];
    const secondBest = scoredCandidates[1];

    if (!best) {
      return {
        matched: false,
        applicationId: null,
        confidence: 0,
        signals: [],
        method: 'no_match',
        candidateCount: 0,
      };
    }

    const margin = secondBest ? best.score.total - secondBest.score.total : 1;
    const hasRequisitionMatch = signals.requisitionId && best.candidate.requisitionId === signals.requisitionId;

    let method: ResolutionResult['method'];
    if (best.score.total >= HIGH_CONFIDENCE_THRESHOLD && margin > 0.15) {
      method = 'high_confidence';
    } else if (hasRequisitionMatch && best.score.total >= 0.6) {
      method = 'exact_match';
    } else if (best.score.total >= AMBIGUOUS_THRESHOLD) {
      method = 'ambiguous';
    } else {
      method = 'no_match';
    }

    this.logger.log(
      `Resolution for ${signals.senderEmail}: ${method} (score=${best.score.total.toFixed(2)}, ` +
      `margin=${margin.toFixed(2)}, candidates=${candidates.length})`,
    );

    return {
      matched: method !== 'no_match',
      applicationId: method !== 'no_match' ? best.candidate.applicationId : null,
      confidence: best.score.total,
      signals: best.score.signals,
      method,
      candidateCount: candidates.length,
    };
  }

  private async findCandidates(
    userId: string,
    signals: EmailSignals,
  ): Promise<ApplicationCandidate[]> {
    const where: Record<string, unknown>[] = [
      { userId },
    ];

    const applications = await this.prisma.application.findMany({
      where: { AND: where },
      include: {
        company: { select: { id: true, name: true, domain: true } },
        job: { select: { id: true, title: true } },
        emailEvidence: { select: { threadId: true, emailId: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return applications.map((app) => {
      const threadIds = app.emailEvidence
        .map((e) => e.threadId)
        .filter((tid): tid is string => tid != null);

      return {
        applicationId: app.id,
        companyId: app.companyId,
        companyName: app.company.name,
        jobId: app.jobId,
        jobTitle: app.job?.title ?? null,
        companyDomain: app.company.domain,
        recruiterEmail: null,
        atsProvider: null,
        requisitionId: null,
        threadIds,
        totalConfidence: app.confidence,
      };
    });
  }

  private scoreCandidate(
    candidate: ApplicationCandidate,
    signals: EmailSignals,
  ): { total: number; signals: ResolutionSignal[] } {
    const resolvedSignals: ResolutionSignal[] = [];
    let totalScore = 0;
    let totalWeight = 0;

    if (signals.threadId && candidate.threadIds.includes(signals.threadId)) {
      resolvedSignals.push({
        type: 'thread_id',
        value: signals.threadId,
        weight: WEIGHTS.thread_id,
      });
      totalScore += WEIGHTS.thread_id;
    }
    totalWeight += WEIGHTS.thread_id;

    if (signals.companyDomain && candidate.companyDomain) {
      const domainMatch = this.normalizeDomain(signals.companyDomain) ===
        this.normalizeDomain(candidate.companyDomain);
      if (domainMatch) {
        resolvedSignals.push({
          type: 'company_domain',
          value: signals.companyDomain,
          weight: WEIGHTS.company_domain,
        });
        totalScore += WEIGHTS.company_domain;
      }
    }
    totalWeight += WEIGHTS.company_domain;

    if (signals.jobTitle && candidate.jobTitle) {
      const titleSimilarity = this.calculateTitleSimilarity(signals.jobTitle, candidate.jobTitle);
      if (titleSimilarity > 0.6) {
        resolvedSignals.push({
          type: 'job_title',
          value: signals.jobTitle,
          weight: WEIGHTS.job_title * titleSimilarity,
        });
        totalScore += WEIGHTS.job_title * titleSimilarity;
      }
    }
    totalWeight += WEIGHTS.job_title;

    if (signals.atsProvider && candidate.atsProvider) {
      if (signals.atsProvider === candidate.atsProvider) {
        resolvedSignals.push({
          type: 'ats_provider',
          value: signals.atsProvider,
          weight: WEIGHTS.ats_provider,
        });
        totalScore += WEIGHTS.ats_provider;
      }
    }
    totalWeight += WEIGHTS.ats_provider;

    if (signals.requisitionId && candidate.requisitionId) {
      if (signals.requisitionId === candidate.requisitionId) {
        resolvedSignals.push({
          type: 'requisition_id',
          value: signals.requisitionId,
          weight: WEIGHTS.requisition_id,
        });
        totalScore += WEIGHTS.requisition_id;
      }
    }
    totalWeight += WEIGHTS.requisition_id;

    if (signals.senderEmail && candidate.recruiterEmail) {
      if (this.normalizeEmail(signals.senderEmail) === this.normalizeEmail(candidate.recruiterEmail)) {
        resolvedSignals.push({
          type: 'recruiter_email',
          value: signals.senderEmail,
          weight: WEIGHTS.recruiter_email,
        });
        totalScore += WEIGHTS.recruiter_email;
      }
    }
    totalWeight += WEIGHTS.recruiter_email;

    if (signals.companyName && candidate.companyName) {
      const nameSimilarity = this.calculateNameSimilarity(signals.companyName, candidate.companyName);
      if (nameSimilarity > 0.7) {
        resolvedSignals.push({
          type: 'historical_relationship',
          value: signals.companyName,
          weight: WEIGHTS.historical_relationship * nameSimilarity,
        });
        totalScore += WEIGHTS.historical_relationship * nameSimilarity;
      }
    }
    totalWeight += WEIGHTS.historical_relationship;

    const normalizedScore = totalWeight > 0 ? totalScore / totalWeight : 0;

    return {
      total: Math.min(1, normalizedScore),
      signals: resolvedSignals,
    };
  }

  private normalizeDomain(domain: string): string {
    return domain
      .toLowerCase()
      .replace(/^(www\.|mail\.|app\.)/, '')
      .replace(/\.com$|\.io$|\.co$/, '');
  }

  private normalizeEmail(email: string): string {
    return email.toLowerCase().trim();
  }

  private calculateTitleSimilarity(title1: string, title2: string): number {
    const words1 = new Set(title1.toLowerCase().split(/\s+/));
    const words2 = new Set(title2.toLowerCase().split(/\s+/));

    const intersection = new Set([...words1].filter((w) => words2.has(w)));
    const union = new Set([...words1, ...words2]);

    return union.size > 0 ? intersection.size / union.size : 0;
  }

  private calculateNameSimilarity(name1: string, name2: string): number {
    const normalize = (s: string) =>
      s.toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, ' ')
        .trim();

    const n1 = normalize(name1);
    const n2 = normalize(name2);

    if (n1 === n2) return 1;

    const words1 = new Set(n1.split(' '));
    const words2 = new Set(n2.split(' '));

    const intersection = new Set([...words1].filter((w) => words2.has(w)));
    const union = new Set([...words1, ...words2]);

    return union.size > 0 ? intersection.size / union.size : 0;
  }
}
