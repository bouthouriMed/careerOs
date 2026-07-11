import { ApplicationStatus } from '@prisma/client';
import { OfferDetector } from './offer-detector';

describe('OfferDetector', () => {
  describe('extract', () => {
    it('should detect offer when category is offer', () => {
      const result = OfferDetector.extract('', 'offer');

      expect(result.hasOffer).toBe(true);
      expect(result.confidence).toBeGreaterThanOrEqual(0.6);
    });

    it('should not detect offer for non-offer category', () => {
      const result = OfferDetector.extract('', 'application_sent');

      expect(result.hasOffer).toBe(false);
      expect(result.confidence).toBe(0);
    });

    it('should extract salary from body', () => {
      const result = OfferDetector.extract(
        'We are pleased to offer you a salary of $120,000 per year.',
        'offer',
      );

      expect(result.hasOffer).toBe(true);
      expect(result.salary).toBe('120000');
      expect(result.currency).toBe('USD');
    });

    it('should extract deadline from body', () => {
      const result = OfferDetector.extract(
        'Please respond by January 31, 2024.',
        'offer',
      );

      expect(result.deadline).not.toBeNull();
    });
  });

  describe('shouldTransitionToOffer', () => {
    it('should return true for offer category', () => {
      expect(OfferDetector.shouldTransitionToOffer('', 'offer')).toBe(true);
    });

    it('should return true for multiple offer keywords', () => {
      const body = 'We are pleased to offer you the position. Congratulations and welcome to the team.';
      expect(OfferDetector.shouldTransitionToOffer(body, '')).toBe(true);
    });

    it('should return false for unrelated content', () => {
      expect(OfferDetector.shouldTransitionToOffer('Hello, how are you?', '')).toBe(false);
    });
  });
});
