import { InterviewStatus } from '@prisma/client';
import { InterviewDecision } from './types';

const CANCELLATION_KEYWORDS = [
  'cancel', 'cancelled', 'canceled', 'reschedule', 'rescheduled',
  'won\'t be able', 'unable to attend', 'need to postpone',
  'postpone', 'delayed', 'put on hold',
];

const COMPLETION_KEYWORDS = [
  'thank you for', 'thanks for attending', 'great speaking',
  'enjoyed our conversation', 'follow up', 'next steps',
  'we\'ll be in touch', 'decision will', 'within the week',
];

const MAX_PAST_DAYS = 7;

export class InterviewGuard {
  static decide(
    scheduledAt: Date,
    emailBody: string,
    emailDate: Date,
  ): InterviewDecision {
    const now = new Date();
    const bodyLower = emailBody.toLowerCase();

    const isCancellation = CANCELLATION_KEYWORDS.some((kw) => bodyLower.includes(kw));
    if (isCancellation) {
      return {
        shouldCreate: false,
        status: 'Cancelled',
        reason: 'Cancellation language detected in email',
        confidence: 0.85,
      };
    }

    const isReschedule = bodyLower.includes('reschedul');
    if (isReschedule) {
      return {
        shouldCreate: true,
        status: 'Scheduled',
        reason: 'Reschedule detected - new interview date expected',
        confidence: 0.8,
      };
    }

    const isPast = scheduledAt < now;
    if (isPast) {
      const daysSince = Math.floor(
        (now.getTime() - scheduledAt.getTime()) / (1000 * 60 * 60 * 24),
      );

      if (daysSince > MAX_PAST_DAYS) {
        return {
          shouldCreate: false,
          status: 'Completed',
          reason: `Interview date is ${daysSince} days in the past - too old to track`,
          confidence: 0.9,
        };
      }

      const isCompletionEmail = COMPLETION_KEYWORDS.some((kw) => bodyLower.includes(kw));
      if (isCompletionEmail) {
        return {
          shouldCreate: true,
          status: 'Completed',
          reason: 'Past interview with completion language',
          confidence: 0.85,
        };
      }

      return {
        shouldCreate: true,
        status: 'Completed',
        reason: 'Interview date is in the past',
        confidence: 0.9,
      };
    }

    if (scheduledAt.getTime() - now.getTime() > 90 * 24 * 60 * 60 * 1000) {
      return {
        shouldCreate: true,
        status: 'Scheduled',
        reason: 'Interview is more than 90 days in the future - may be inaccurate',
        confidence: 0.4,
      };
    }

    return {
      shouldCreate: true,
      status: 'Scheduled',
      reason: 'Future interview date',
      confidence: 0.9,
    };
  }

  static findDuplicate(
    existingInterviews: Array<{ scheduledAt: Date; type: string; status: string }>,
    newScheduledAt: Date,
    newType: string,
  ): boolean {
    return existingInterviews.some((existing) => {
      const sameType = existing.type === newType;
      const sameDay =
        existing.scheduledAt.toISOString().split('T')[0] ===
        newScheduledAt.toISOString().split('T')[0];
      const timeDiff = Math.abs(
        existing.scheduledAt.getTime() - newScheduledAt.getTime(),
      );
      const withinOneHour = timeDiff < 60 * 60 * 1000;
      const notCancelled = existing.status !== 'Cancelled';

      return sameType && (sameDay || withinOneHour) && notCancelled;
    });
  }
}
