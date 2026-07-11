import { ApplicationStatus } from '@prisma/client';
import { TemporalStatusResolver } from './temporal-status-resolver';
import { StatusEvidence } from './types';

describe('TemporalStatusResolver', () => {
  describe('resolve', () => {
    it('should apply new status when no previous evidence exists', () => {
      const result = TemporalStatusResolver.resolve(
        ApplicationStatus.Saved,
        null,
        {
          status: ApplicationStatus.Applied,
          emailId: 'email-1',
          emailDate: new Date('2024-01-15'),
          confidence: 0.8,
        },
      );

      expect(result).not.toBeNull();
      expect(result!.newStatus).toBe(ApplicationStatus.Applied);
      expect(result!.reason).toContain('No previous status evidence');
    });

    it('should override with newer email evidence', () => {
      const result = TemporalStatusResolver.resolve(
        ApplicationStatus.Applied,
        new Date('2024-01-10'),
        {
          status: ApplicationStatus.Interviewing,
          emailId: 'email-2',
          emailDate: new Date('2024-01-15'),
          confidence: 0.9,
        },
      );

      expect(result).not.toBeNull();
      expect(result!.newStatus).toBe(ApplicationStatus.Interviewing);
      expect(result!.reason).toContain('Newer email');
    });

    it('should not override with older evidence', () => {
      const result = TemporalStatusResolver.resolve(
        ApplicationStatus.Interviewing,
        new Date('2024-01-15'),
        {
          status: ApplicationStatus.Applied,
          emailId: 'email-3',
          emailDate: new Date('2024-01-10'),
          confidence: 0.8,
        },
      );

      expect(result).toBeNull();
    });

    it('should prefer higher rank on same date', () => {
      const result = TemporalStatusResolver.resolve(
        ApplicationStatus.Applied,
        new Date('2024-01-15'),
        {
          status: ApplicationStatus.Interviewing,
          emailId: 'email-4',
          emailDate: new Date('2024-01-15'),
          confidence: 0.9,
        },
      );

      expect(result).not.toBeNull();
      expect(result!.newStatus).toBe(ApplicationStatus.Interviewing);
      expect(result!.reason).toContain('Same date but higher pipeline rank');
    });

    it('should not downgrade from Offer to Rejected with older evidence', () => {
      const result = TemporalStatusResolver.resolve(
        ApplicationStatus.Offer,
        new Date('2024-01-20'),
        {
          status: ApplicationStatus.Rejected,
          emailId: 'email-5',
          emailDate: new Date('2024-01-10'),
          confidence: 0.9,
        },
      );

      expect(result).toBeNull();
    });
  });

  describe('statusFromCategory', () => {
    it('should map application_sent to Applied', () => {
      expect(TemporalStatusResolver.statusFromCategory('application_sent')).toBe(ApplicationStatus.Applied);
    });

    it('should map interview_invite to Interviewing', () => {
      expect(TemporalStatusResolver.statusFromCategory('interview_invite')).toBe(ApplicationStatus.Interviewing);
    });

    it('should map rejection to Rejected', () => {
      expect(TemporalStatusResolver.statusFromCategory('rejection')).toBe(ApplicationStatus.Rejected);
    });

    it('should map offer to Offer', () => {
      expect(TemporalStatusResolver.statusFromCategory('offer')).toBe(ApplicationStatus.Offer);
    });

    it('should return null for unknown category', () => {
      expect(TemporalStatusResolver.statusFromCategory('unknown')).toBeNull();
    });
  });

  describe('wouldDowngrade', () => {
    it('should return true for downgrade', () => {
      expect(TemporalStatusResolver.wouldDowngrade(ApplicationStatus.Offer, ApplicationStatus.Applied)).toBe(true);
    });

    it('should return false for upgrade', () => {
      expect(TemporalStatusResolver.wouldDowngrade(ApplicationStatus.Applied, ApplicationStatus.Offer)).toBe(false);
    });

    it('should return false for same status', () => {
      expect(TemporalStatusResolver.wouldDowngrade(ApplicationStatus.Applied, ApplicationStatus.Applied)).toBe(false);
    });
  });
});
