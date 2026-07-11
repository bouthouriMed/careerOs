import { IdentityResolutionEngine } from '../identity-resolution.engine';
import { PrismaService } from '../../../platform/prisma/prisma.service';
import {
  EmailSignals,
  ApplicationCandidate,
  ResolutionResult,
} from '../types';

describe('IdentityResolutionEngine', () => {
  let engine: IdentityResolutionEngine;
  let mockPrisma: Partial<PrismaService>;

  beforeEach(() => {
    mockPrisma = {
      application: {
        findMany: jest.fn(),
      },
    };
    engine = new IdentityResolutionEngine(mockPrisma as PrismaService);
  });

  describe('resolve', () => {
    it('should return no_match when no candidates found', async () => {
      (mockPrisma.application.findMany as jest.Mock).mockResolvedValue([]);

      const signals: EmailSignals = {
        threadId: 'thread-1',
        senderEmail: 'test@example.com',
        senderName: 'Test User',
        subject: 'Interview Invitation',
        body: 'We would like to interview you',
        atsProvider: null,
        applicationId: null,
        requisitionId: null,
        companyName: 'Google',
        companyDomain: 'google.com',
        jobTitle: 'Software Engineer',
      };

      const result = await engine.resolve('user-123', signals);

      expect(result.matched).toBe(false);
      expect(result.method).toBe('no_match');
      expect(result.confidence).toBe(0);
    });

    it('should resolve when thread ID matches', async () => {
      const mockApplication = createMockApplication('app-123', 'Test', 'Test', 'test@example.com');
      (mockPrisma.application.findMany as jest.Mock).mockResolvedValue([mockApplication]);

      const signals: EmailSignals = {
        threadId: 'thread-1',
        senderEmail: 'test@example.com',
        senderName: 'Test User',
        subject: 'Interview Invitation',
        body: 'We would like to interview you',
        atsProvider: null,
        applicationId: null,
        requisitionId: null,
        companyName: 'Test',
        companyDomain: 'test.com',
        jobTitle: 'Software Engineer',
      };

      const result = await engine.resolve('user-123', signals);

      expect(result.matched).toBe(true);
      expect(result.applicationId).toBe('app-123');
      expect(result.method).toBe('high_confidence');
      expect(result.confidence).toBeGreaterThanOrEqual(0.7);
    });

    it('should resolve when company domain matches', async () => {
      const mockApplication = createMockApplication('app-456', 'Google', 'google.com', 'test@example.com');
      (mockPrisma.application.findMany as jest.Mock).mockResolvedValue([mockApplication]);

      const signals: EmailSignals = {
        threadId: null,
        senderEmail: 'test@google.com',
        senderName: 'Test User',
        subject: 'Interview Invitation',
        body: 'We would like to interview you',
        atsProvider: null,
        applicationId: null,
        requisitionId: null,
        companyName: 'Google',
        companyDomain: 'google.com',
        jobTitle: 'Software Engineer',
      };

      const result = await engine.resolve('user-123', signals);

      expect(result.matched).toBe(true);
      expect(result.applicationId).toBe('app-456');
      expect(result.method).toBe('high_confidence');
    });

    it('should resolve when ATS provider matches', async () => {
      const mockApplication = createMockApplication('app-789', 'Microsoft', null, 'hr@microsoft.com');
      (mockPrisma.application.findMany as jest.Mock).mockResolvedValue([mockApplication]);

      const signals: EmailSignals = {
        threadId: null,
        senderEmail: 'hr@microsoft.com',
        senderName: 'HR Recruiter',
        subject: 'Offer',
        body: 'We are pleased to offer you employment',
        atsProvider: 'lever',
        applicationId: null,
        requisitionId: null,
        companyName: 'Microsoft',
        companyDomain: 'microsoft.com',
        jobTitle: 'Software Engineer',
      };

      const result = await engine.resolve('user-123', signals);

      expect(result.matched).toBe(true);
      expect(result.applicationId).toBe('app-789');
    });

    it('should handle ambiguous matches', async () => {
      const mockApplication1 = createMockApplication('app-1', 'Test', 'test.com', null);
      const mockApplication2 = createMockApplication('app-2', 'Test', 'test.com', 'other@example.com');
      (mockPrisma.application.findMany as jest.Mock).mockResolvedValue([mockApplication1, mockApplication2]);

      const signals: EmailSignals = {
        threadId: null,
        senderEmail: 'other@example.com',
        senderName: 'Test User',
        subject: 'Job Update',
        body: 'Your application status',
        atsProvider: null,
        applicationId: null,
        requisitionId: null,
        companyName: 'Test',
        companyDomain: 'test.com',
        jobTitle: 'Software Engineer',
      };

      const result = await engine.resolve('user-123', signals);

      expect(result.matched).toBe(true);
      expect(result.method).toBe('ambiguous');
      expect(result.candidateCount).toBe(2);
    });
  });
});

function createMockApplication(
  id: string,
  companyName: string,
  companyDomain: string | null,
  recruiterEmail: string | null,
): ApplicationCandidate {
  return {
    applicationId: id,
    companyId: `company-${id}`,
    companyName,
    jobId: `job-${id}`,
    jobTitle: 'Software Engineer',
    companyDomain,
    recruiterEmail,
    atsProvider: null,
    requisitionId: null,
    threadIds: [],
    totalConfidence: 0.7,
  };
}
