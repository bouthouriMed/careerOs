import { InterviewGuard } from './interview-guard';

describe('InterviewGuard', () => {
  describe('decide', () => {
    it('should create future interview as Scheduled', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);

      const result = InterviewGuard.decide(futureDate, '', new Date());

      expect(result.shouldCreate).toBe(true);
      expect(result.status).toBe('Scheduled');
      expect(result.confidence).toBeGreaterThanOrEqual(0.8);
    });

    it('should create past interview as Completed', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 3);

      const result = InterviewGuard.decide(pastDate, '', new Date());

      expect(result.shouldCreate).toBe(true);
      expect(result.status).toBe('Completed');
    });

    it('should not create interview for very old dates', () => {
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 30);

      const result = InterviewGuard.decide(oldDate, '', new Date());

      expect(result.shouldCreate).toBe(false);
      expect(result.reason).toContain('too old');
    });

    it('should detect cancellation language', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);

      const result = InterviewGuard.decide(
        futureDate,
        'We need to cancel the interview due to unforeseen circumstances.',
        new Date(),
      );

      expect(result.shouldCreate).toBe(false);
      expect(result.status).toBe('Cancelled');
    });

    it('should detect reschedule language', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);

      const result = InterviewGuard.decide(
        futureDate,
        'We need to reschedule the interview to a later date.',
        new Date(),
      );

      expect(result.shouldCreate).toBe(true);
      expect(result.status).toBe('Scheduled');
      expect(result.reason).toContain('Reschedule');
    });
  });

  describe('findDuplicate', () => {
    const existingInterviews = [
      {
        scheduledAt: new Date('2024-01-15T10:00:00'),
        type: 'Video',
        status: 'Scheduled',
      },
    ];

    it('should find duplicate on same day', () => {
      const newDate = new Date('2024-01-15T14:00:00');

      const result = InterviewGuard.findDuplicate(existingInterviews, newDate, 'Video');

      expect(result).toBe(true);
    });

    it('should not find duplicate on different day', () => {
      const newDate = new Date('2024-01-16T10:00:00');

      const result = InterviewGuard.findDuplicate(existingInterviews, newDate, 'Video');

      expect(result).toBe(false);
    });

    it('should not find duplicate for different type', () => {
      const newDate = new Date('2024-01-15T10:00:00');

      const result = InterviewGuard.findDuplicate(existingInterviews, newDate, 'Phone');

      expect(result).toBe(false);
    });

    it('should not count cancelled interviews as duplicates', () => {
      const cancelledInterviews = [
        {
          scheduledAt: new Date('2024-01-15T10:00:00'),
          type: 'Video',
          status: 'Cancelled',
        },
      ];
      const newDate = new Date('2024-01-15T14:00:00');

      const result = InterviewGuard.findDuplicate(cancelledInterviews, newDate, 'Video');

      expect(result).toBe(false);
    });
  });
});
