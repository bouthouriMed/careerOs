import { ApplicationStatus } from '@prisma/client';
import { StatusEvidence, StatusResolution } from './types';

const STATUS_RANK: Record<string, number> = {
  Saved: 0,
  Applied: 1,
  Screening: 2,
  Interviewing: 3,
  Offer: 4,
  Rejected: 5,
  Accepted: 6,
  Declined: 7,
  Closed: 8,
};

const CATEGORY_TO_STATUS: Record<string, ApplicationStatus> = {
  application_sent: ApplicationStatus.Applied,
  application_viewed: ApplicationStatus.Screening,
  interview_invite: ApplicationStatus.Interviewing,
  interview_scheduled: ApplicationStatus.Interviewing,
  rejection: ApplicationStatus.Rejected,
  offer: ApplicationStatus.Offer,
  follow_up: ApplicationStatus.Screening,
};

export class TemporalStatusResolver {
  static resolve(
    currentStatus: ApplicationStatus,
    currentSourceDate: Date | null,
    newEvidence: StatusEvidence,
  ): StatusResolution | null {
    const newRank = STATUS_RANK[newEvidence.status] ?? 0;
    const currentRank = STATUS_RANK[currentStatus] ?? 0;

    if (!currentSourceDate) {
      return {
        newStatus: newEvidence.status,
        confidence: newEvidence.confidence,
        reason: 'No previous status evidence, applying new status',
        evidence: newEvidence,
      };
    }

    if (newEvidence.emailDate > currentSourceDate) {
      return {
        newStatus: newEvidence.status,
        confidence: newEvidence.confidence,
        reason: `Newer email (${newEvidence.emailDate.toISOString()}) overrides previous evidence (${currentSourceDate.toISOString()})`,
        evidence: newEvidence,
      };
    }

    if (newEvidence.emailDate.getTime() === currentSourceDate.getTime()) {
      if (newRank > currentRank) {
        return {
          newStatus: newEvidence.status,
          confidence: newEvidence.confidence,
          reason: 'Same date but higher pipeline rank',
          evidence: newEvidence,
        };
      }
      return null;
    }

    if (
      currentStatus === ApplicationStatus.Offer &&
      newEvidence.status === ApplicationStatus.Rejected &&
      newEvidence.emailDate < currentSourceDate
    ) {
      return null;
    }

    return null;
  }

  static statusFromCategory(category: string): ApplicationStatus | null {
    return CATEGORY_TO_STATUS[category] ?? null;
  }

  static wouldDowngrade(
    currentStatus: ApplicationStatus,
    proposedStatus: ApplicationStatus,
  ): boolean {
    const currentRank = STATUS_RANK[currentStatus] ?? 0;
    const proposedRank = STATUS_RANK[proposedStatus] ?? 0;
    return proposedRank < currentRank;
  }
}
