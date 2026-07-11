import { Injectable, Logger } from '@nestjs/common';
import { ApplicationStatus } from '@prisma/client';
import { PrismaService } from '../../../platform/prisma/prisma.service';
import {
  PipelineMetrics,
  MetricsPeriod,
  IdentityResolutionMetrics,
  ExtractionAccuracyMetrics,
  StatusDistribution,
  ConfidenceDistribution,
  EvaluationResult,
  EvaluationIssue,
} from './types';

@Injectable()
export class EvaluationFrameworkService {
  private readonly logger = new Logger(EvaluationFrameworkService.name);

  constructor(private prisma: PrismaService) {}

  async evaluate(userId: string, period: MetricsPeriod = 'all_time'): Promise<EvaluationResult> {
    const metrics = await this.calculateMetrics(userId, period);
    const issues = this.identifyIssues(metrics);
    const recommendations = this.generateRecommendations(metrics, issues);
    const overallScore = this.calculateOverallScore(metrics, issues);

    this.logger.log(
      `Evaluation for ${userId} (${period}): score=${overallScore.toFixed(2)}, ` +
      `${issues.length} issues, ${recommendations.length} recommendations`,
    );

    return {
      overallScore,
      metrics,
      recommendations,
      issues,
    };
  }

  private async calculateMetrics(userId: string, period: MetricsPeriod): Promise<PipelineMetrics> {
    const dateFilter = this.getDateFilter(period);

    const [
      totalEmails,
      applications,
      artifacts,
      evidence,
    ] = await Promise.all([
      this.prisma.processedEmail.count({
        where: { userId, ...(dateFilter ? { processedAt: dateFilter } : {}) },
      }),
      this.prisma.application.findMany({
        where: { userId, ...(dateFilter ? { createdAt: dateFilter } : {}) },
        include: {
          company: true,
          evidence: true,
        },
      }),
      this.prisma.intelligenceArtifact.findMany({
        where: { userId, ...(dateFilter ? { createdAt: dateFilter } : {}) },
      }),
      this.prisma.emailEvidence.findMany({
        where: { userId, ...(dateFilter ? { createdAt: dateFilter } : {}) },
      }),
    ]);

    const hiringDetected = evidence.filter((e) => e.category !== null).length;

    const identityMetrics = this.calculateIdentityMetrics(applications, artifacts);
    const extractionMetrics = this.calculateExtractionMetrics(artifacts, evidence);
    const statusDist = this.calculateStatusDistribution(applications);
    const confidenceDist = this.calculateConfidenceDistribution(applications);
    const atsBreakdown = this.calculateAtsBreakdown(evidence);

    return {
      userId,
      period,
      totalEmailsProcessed: totalEmails,
      hiringEmailsDetected: hiringDetected,
      applicationsCreated: applications.length,
      applicationsUpdated: 0,
      identityResolutions: identityMetrics,
      extractionAccuracy: extractionMetrics,
      statusDistribution: statusDist,
      confidenceDistribution: confidenceDist,
      atsProviderBreakdown: atsBreakdown,
      calculatedAt: new Date(),
    };
  }

  private calculateIdentityMetrics(
    applications: Array<{ id: string; confidence: number }>,
    artifacts: Array<{ type: string; data: unknown }>,
  ): IdentityResolutionMetrics {
    const totalAttempts = applications.length;
    const highConfidence = applications.filter((a) => a.confidence >= 0.7).length;
    const mediumConfidence = applications.filter((a) => a.confidence >= 0.4 && a.confidence < 0.7).length;
    const lowConfidence = applications.filter((a) => a.confidence < 0.4).length;

    const averageConfidence = totalAttempts > 0
      ? applications.reduce((sum, a) => sum + a.confidence, 0) / totalAttempts
      : 0;

    return {
      totalAttempts,
      exactMatches: highConfidence,
      highConfidenceMatches: highConfidence,
      ambiguousMatches: mediumConfidence,
      noMatches: lowConfidence,
      averageConfidence,
      matchRate: totalAttempts > 0 ? highConfidence / totalAttempts : 0,
    };
  }

  private calculateExtractionMetrics(
    artifacts: Array<{ type: string; confidence: number }>,
    evidence: Array<{ category: string | null }>,
  ): ExtractionAccuracyMetrics {
    const classifications = artifacts.filter((a) => a.type === 'email_classification');
    const extractions = artifacts.filter((a) => a.type === 'email_extraction');

    const deterministicCount = classifications.filter((a) => a.confidence >= 0.9).length;
    const llmCount = classifications.filter((a) => a.confidence < 0.9).length;

    const avgDetConf = deterministicCount > 0
      ? classifications.filter((a) => a.confidence >= 0.9).reduce((s, a) => s + a.confidence, 0) / deterministicCount
      : 0;
    const avgLlmConf = llmCount > 0
      ? classifications.filter((a) => a.confidence < 0.9).reduce((s, a) => s + a.confidence, 0) / llmCount
      : 0;

    const categorized = evidence.filter((e) => e.category !== null).length;
    const categoryAccuracy = evidence.length > 0 ? categorized / evidence.length : 0;

    return {
      deterministicExtractions: deterministicCount,
      llmExtractions: llmCount,
      deterministicConfidence: avgDetConf,
      llmConfidence: avgLlmConf,
      categoryAccuracy,
      companyExtractionRate: 0.8,
      titleExtractionRate: 0.7,
    };
  }

  private calculateStatusDistribution(
    applications: Array<{ status: ApplicationStatus }>,
  ): StatusDistribution {
    const dist: StatusDistribution = {
      Saved: 0, Applied: 0, Screening: 0, Interviewing: 0,
      Offer: 0, Accepted: 0, Declined: 0, Rejected: 0, Closed: 0,
    };

    for (const app of applications) {
      if (dist[app.status] !== undefined) {
        dist[app.status]++;
      }
    }

    return dist;
  }

  private calculateConfidenceDistribution(
    applications: Array<{ confidence: number }>,
  ): ConfidenceDistribution {
    const high = applications.filter((a) => a.confidence >= 0.7).length;
    const medium = applications.filter((a) => a.confidence >= 0.4 && a.confidence < 0.7).length;
    const low = applications.filter((a) => a.confidence < 0.4).length;
    const average = applications.length > 0
      ? applications.reduce((s, a) => s + a.confidence, 0) / applications.length
      : 0;

    return { high, medium, low, average };
  }

  private calculateAtsBreakdown(
    evidence: Array<{ atsProvider: string | null }>,
  ): Record<string, number> {
    const breakdown: Record<string, number> = {};

    for (const e of evidence) {
      const provider = e.atsProvider || 'unknown';
      breakdown[provider] = (breakdown[provider] || 0) + 1;
    }

    return breakdown;
  }

  private identifyIssues(metrics: PipelineMetrics): EvaluationIssue[] {
    const issues: EvaluationIssue[] = [];

    if (metrics.identityResolutions.matchRate < 0.5) {
      issues.push({
        category: 'identity_resolution',
        severity: 'high',
        message: `Low match rate: ${(metrics.identityResolutions.matchRate * 100).toFixed(1)}%`,
        suggestion: 'Review identity resolution thresholds or add more company aliases',
      });
    }

    if (metrics.identityResolutions.averageConfidence < 0.5) {
      issues.push({
        category: 'identity_resolution',
        severity: 'medium',
        message: `Low average confidence: ${metrics.identityResolutions.averageConfidence.toFixed(2)}`,
        suggestion: 'Consider adding more signal types or adjusting weights',
      });
    }

    if (metrics.extractionAccuracy.categoryAccuracy < 0.7) {
      issues.push({
        category: 'extraction',
        severity: 'high',
        message: `Low category accuracy: ${(metrics.extractionAccuracy.categoryAccuracy * 100).toFixed(1)}%`,
        suggestion: 'Review category patterns and ATS provider configurations',
      });
    }

    if (metrics.confidenceDistribution.low > metrics.confidenceDistribution.high) {
      issues.push({
        category: 'confidence',
        severity: 'medium',
        message: 'More low-confidence applications than high-confidence',
        suggestion: 'Review identity resolution and extraction pipelines',
      });
    }

    if (metrics.applicationsCreated === 0 && metrics.totalEmailsProcessed > 0) {
      issues.push({
        category: 'pipeline',
        severity: 'high',
        message: 'No applications created despite emails processed',
        suggestion: 'Check email detection and extraction pipelines',
      });
    }

    return issues;
  }

  private generateRecommendations(
    metrics: PipelineMetrics,
    issues: EvaluationIssue[],
  ): string[] {
    const recommendations: string[] = [];

    if (metrics.identityResolutions.noMatches > metrics.identityResolutions.exactMatches) {
      recommendations.push('Consider adding more company aliases to improve identity resolution');
    }

    if (metrics.extractionAccuracy.deterministicExtractions < metrics.extractionAccuracy.llmExtractions) {
      recommendations.push('Improve deterministic extraction patterns to reduce LLM dependency');
    }

    if (metrics.confidenceDistribution.average < 0.6) {
      recommendations.push('Review and tune confidence scoring algorithms');
    }

    if (metrics.statusDistribution.Saved > metrics.statusDistribution.Applied) {
      recommendations.push('Many applications stuck in Saved status - review email detection');
    }

    if (metrics.statusDistribution.Rejected > metrics.statusDistribution.Interviewing) {
      recommendations.push('High rejection rate - consider reviewing application targeting');
    }

    return recommendations;
  }

  private calculateOverallScore(metrics: PipelineMetrics, issues: EvaluationIssue[]): number {
    let score = 0;

    score += metrics.identityResolutions.matchRate * 25;
    score += metrics.identityResolutions.averageConfidence * 25;
    score += metrics.extractionAccuracy.categoryAccuracy * 25;

    const issueDeductions = issues.reduce((sum, issue) => {
      const deduction = issue.severity === 'high' ? 5 : issue.severity === 'medium' ? 2 : 1;
      return sum + deduction;
    }, 0);

    score = Math.max(0, score - issueDeductions);

    return Math.min(100, score);
  }

  private getDateFilter(period: MetricsPeriod): { gte: Date } | null {
    if (period === 'all_time') return null;

    const now = new Date();
    const days = period === 'last_7_days' ? 7 : 30;
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    return { gte: startDate };
  }
}
