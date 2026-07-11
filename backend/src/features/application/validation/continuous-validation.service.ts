import { Injectable, Logger } from '@nestjs/common';
import { ApplicationStatus, InterviewStatus } from '@prisma/client';
import { PrismaService } from '../../../platform/prisma/prisma.service';
import { TemporalStatusResolver } from '../rules/temporal-status-resolver';
import {
  ValidationIssue,
  ValidationReport,
  ValidationRule,
} from './types';

const VALIDATION_RULES: ValidationRule[] = [
  {
    id: 'status_inconsistency',
    type: 'status_inconsistency',
    severity: 'high',
    autoFixable: true,
    description: 'Application status does not match email evidence dates',
  },
  {
    id: 'missing_status_source',
    type: 'missing_status_source',
    severity: 'medium',
    autoFixable: false,
    description: 'Application has no status source email reference',
  },
  {
    id: 'offer_without_status',
    type: 'offer_without_status',
    severity: 'critical',
    autoFixable: true,
    description: 'Application has offer data but status is not Offer',
  },
  {
    id: 'interview_in_past_not_completed',
    type: 'interview_in_past_not_completed',
    severity: 'high',
    autoFixable: true,
    description: 'Interview is in the past but not marked as Completed',
  },
  {
    id: 'interview_scheduled_after_offer',
    type: 'interview_scheduled_after_offer',
    severity: 'medium',
    autoFixable: false,
    description: 'Interview scheduled after offer was received',
  },
  {
    id: 'low_confidence_application',
    type: 'low_confidence_application',
    severity: 'low',
    autoFixable: false,
    description: 'Application has low confidence score',
  },
  {
    id: 'email_evidence_missing',
    type: 'email_evidence_missing',
    severity: 'medium',
    autoFixable: false,
    description: 'Application created from email but has no email evidence',
  },
  {
    id: 'timeline_anomaly',
    type: 'timeline_anomaly',
    severity: 'medium',
    autoFixable: false,
    description: 'Application timeline has anomalous dates',
  },
];

@Injectable()
export class ContinuousValidationService {
  private readonly logger = new Logger(ContinuousValidationService.name);

  constructor(private prisma: PrismaService) {}

  async validateUser(userId: string): Promise<ValidationReport> {
    const applications = await this.prisma.application.findMany({
      where: { userId },
      include: {
        company: true,
        job: true,
        interviews: true,
        evidence: true,
        recruiterApplications: {
          include: { recruiter: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const issues: ValidationIssue[] = [];

    for (const app of applications) {
      const appIssues = await this.validateApplication(app);
      issues.push(...appIssues);
    }

    const companyIssues = await this.validateCompanyDomains(userId, applications);
    issues.push(...companyIssues);

    const autoFixableCount = issues.filter((i) => i.autoFixable).length;
    const criticalCount = issues.filter((i) => i.severity === 'critical').length;
    const validationScore = this.calculateValidationScore(applications.length, issues);

    this.logger.log(
      `Validation for ${userId}: ${issues.length} issues ` +
      `(${criticalCount} critical, ${autoFixableCount} auto-fixable), ` +
      `score: ${validationScore.toFixed(2)}`,
    );

    return {
      userId,
      totalApplications: applications.length,
      issues,
      autoFixableCount,
      criticalCount,
      validationScore,
      validatedAt: new Date(),
    };
  }

  async autoFix(userId: string, issueIds?: string[]): Promise<ValidationReport> {
    const report = await this.validateUser(userId);

    const fixableIssues = issueIds
      ? report.issues.filter((i) => i.autoFixable && issueIds.includes(i.id))
      : report.issues.filter((i) => i.autoFixable);

    let fixedCount = 0;

    for (const issue of fixableIssues) {
      try {
        const fixed = await this.applyFix(issue);
        if (fixed) {
          fixedCount++;
          this.logger.log(`Fixed issue ${issue.id} (${issue.type})`);
        }
      } catch (error) {
        this.logger.error(`Failed to fix issue ${issue.id}: ${error}`);
      }
    }

    this.logger.log(`Auto-fix completed: ${fixedCount}/${fixableIssues.length} issues fixed`);

    return this.validateUser(userId);
  }

  private async validateApplication(app: {
    id: string;
    status: ApplicationStatus;
    statusSourceDate: Date | null;
    statusSourceEmailId: string | null;
    confidence: number;
    createdAt: Date;
    offerSalary: string | null;
    offerReceivedAt: Date | null;
    appliedAt: Date | null;
    company: { id: string; name: string; domain: string | null };
    interviews: Array<{ scheduledAt: Date; status: InterviewStatus }>;
    evidence: Array<{ emailDate: Date; category: string | null }>;
  }): Promise<ValidationIssue[]> {
    const issues: ValidationIssue[] = [];

    if (app.statusSourceEmailId && app.statusSourceDate) {
      const latestEvidence = app.evidence.sort(
        (a, b) => b.emailDate.getTime() - a.emailDate.getTime(),
      )[0];

      if (latestEvidence && latestEvidence.emailDate > app.statusSourceDate) {
        const categoryStatus = TemporalStatusResolver.statusFromCategory(
          latestEvidence.category || '',
        );

        if (categoryStatus && categoryStatus !== app.status) {
          issues.push({
            id: `${app.id}_status_inconsistency`,
            type: 'status_inconsistency',
            severity: 'high',
            entityType: 'application',
            entityId: app.id,
            description: `Application status is ${app.status} but latest email evidence suggests ${categoryStatus}`,
            suggestedFix: `Update status to ${categoryStatus}`,
            autoFixable: true,
            detectedAt: new Date(),
            evidence: {
              currentStatus: app.status,
              suggestedStatus: categoryStatus,
              latestEvidenceDate: latestEvidence.emailDate,
              statusSourceDate: app.statusSourceDate,
            },
          });
        }
      }
    }

    if (!app.statusSourceEmailId && !app.statusSourceDate) {
      issues.push({
        id: `${app.id}_missing_status_source`,
        type: 'missing_status_source',
        severity: 'medium',
        entityType: 'application',
        entityId: app.id,
        description: 'Application has no status source email reference',
        suggestedFix: null,
        autoFixable: false,
        detectedAt: new Date(),
        evidence: {},
      });
    }

    if (app.offerSalary && app.status !== ApplicationStatus.Offer) {
      issues.push({
        id: `${app.id}_offer_without_status`,
        type: 'offer_without_status',
        severity: 'critical',
        entityType: 'application',
        entityId: app.id,
        description: `Application has offer salary (${app.offerSalary}) but status is ${app.status}`,
        suggestedFix: 'Update status to Offer',
        autoFixable: true,
        detectedAt: new Date(),
        evidence: {
          offerSalary: app.offerSalary,
          currentStatus: app.status,
        },
      });
    }

    const now = new Date();
    for (const interview of app.interviews) {
      if (interview.scheduledAt < now && interview.status === InterviewStatus.Scheduled) {
        issues.push({
          id: `${app.id}_interview_past_not_completed`,
          type: 'interview_in_past_not_completed',
          severity: 'high',
          entityType: 'interview',
          entityId: app.id,
          description: `Interview scheduled for ${interview.scheduledAt.toISOString()} is in the past but not completed`,
          suggestedFix: 'Mark interview as Completed',
          autoFixable: true,
          detectedAt: new Date(),
          evidence: {
            scheduledAt: interview.scheduledAt,
            currentStatus: interview.status,
          },
        });
      }
    }

    if (app.offerReceivedAt) {
      const interviewsAfterOffer = app.interviews.filter(
        (i) => i.scheduledAt > app.offerReceivedAt!,
      );
      if (interviewsAfterOffer.length > 0) {
        issues.push({
          id: `${app.id}_interview_after_offer`,
          type: 'interview_scheduled_after_offer',
          severity: 'medium',
          entityType: 'interview',
          entityId: app.id,
          description: `${interviewsAfterOffer.length} interview(s) scheduled after offer was received`,
          suggestedFix: null,
          autoFixable: false,
          detectedAt: new Date(),
          evidence: {
            offerReceivedAt: app.offerReceivedAt,
            interviewsAfterOffer: interviewsAfterOffer.map((i) => i.scheduledAt),
          },
        });
      }
    }

    if (app.confidence < 0.5) {
      issues.push({
        id: `${app.id}_low_confidence`,
        type: 'low_confidence_application',
        severity: 'low',
        entityType: 'application',
        entityId: app.id,
        description: `Application has low confidence score (${app.confidence.toFixed(2)})`,
        suggestedFix: null,
        autoFixable: false,
        detectedAt: new Date(),
        evidence: { confidence: app.confidence },
      });
    }

    if (app.evidence.length === 0) {
      issues.push({
        id: `${app.id}_no_email_evidence`,
        type: 'email_evidence_missing',
        severity: 'medium',
        entityType: 'application',
        entityId: app.id,
        description: 'Application has no associated email evidence',
        suggestedFix: null,
        autoFixable: false,
        detectedAt: new Date(),
        evidence: {},
      });
    }

    return issues;
  }

  private async validateCompanyDomains(
    userId: string,
    applications: Array<{
      id: string;
      companyId: string;
      company: { name: string; domain: string | null };
    }>,
  ): Promise<ValidationIssue[]> {
    const issues: ValidationIssue[] = [];

    const domainGroups = new Map<string, typeof applications>();
    for (const app of applications) {
      if (app.company.domain) {
        const existing = domainGroups.get(app.company.domain) || [];
        existing.push(app);
        domainGroups.set(app.company.domain, existing);
      }
    }

    for (const [domain, apps] of domainGroups) {
      const uniqueCompanies = new Set(apps.map((a) => a.company.name));
      if (uniqueCompanies.size > 1) {
        for (const app of apps) {
          issues.push({
            id: `${app.id}_duplicate_company_domain`,
            type: 'duplicate_company_domain',
            severity: 'medium',
            entityType: 'application',
            entityId: app.id,
            description: `Multiple companies share domain ${domain}: ${Array.from(uniqueCompanies).join(', ')}`,
            suggestedFix: 'Merge duplicate companies',
            autoFixable: false,
            detectedAt: new Date(),
            evidence: {
              domain,
              companies: Array.from(uniqueCompanies),
              applicationIds: apps.map((a) => a.id),
            },
          });
        }
      }
    }

    return issues;
  }

  private calculateValidationScore(totalApps: number, issues: ValidationIssue[]): number {
    if (totalApps === 0) return 1;

    const severityWeights: Record<string, number> = {
      critical: 0.4,
      high: 0.3,
      medium: 0.2,
      low: 0.1,
    };

    const totalPenalty = issues.reduce((sum, issue) => {
      return sum + (severityWeights[issue.severity] || 0.1);
    }, 0);

    const normalizedPenalty = Math.min(1, totalPenalty / totalApps);
    return Math.max(0, 1 - normalizedPenalty);
  }

  private async applyFix(issue: ValidationIssue): Promise<boolean> {
    switch (issue.type) {
      case 'status_inconsistency':
        return this.fixStatusInconsistency(issue);
      case 'offer_without_status':
        return this.fixOfferWithoutStatus(issue);
      case 'interview_in_past_not_completed':
        return this.fixPastInterviewNotCompleted(issue);
      default:
        return false;
    }
  }

  private async fixStatusInconsistency(issue: ValidationIssue): Promise<boolean> {
    const suggestedStatus = issue.evidence.suggestedStatus as ApplicationStatus;
    if (!suggestedStatus) return false;

    await this.prisma.application.update({
      where: { id: issue.entityId },
      data: { status: suggestedStatus },
    });

    return true;
  }

  private async fixOfferWithoutStatus(issue: ValidationIssue): Promise<boolean> {
    await this.prisma.application.update({
      where: { id: issue.entityId },
      data: { status: ApplicationStatus.Offer },
    });

    return true;
  }

  private async fixPastInterviewNotCompleted(issue: ValidationIssue): Promise<boolean> {
    await this.prisma.interview.updateMany({
      where: {
        applicationId: issue.entityId,
        status: InterviewStatus.Scheduled,
        scheduledAt: { lt: new Date() },
      },
      data: { status: InterviewStatus.Completed },
    });

    return true;
  }
}
