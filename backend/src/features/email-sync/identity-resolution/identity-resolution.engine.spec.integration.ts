import { IdentityResolutionEngine } from '../identity-resolution.engine';
import { PrismaService } from '../../../platform/prisma/prisma.service';
import { CompanyNormalizer } from '../company-normalizer';
import {
  EmailSignals,
  ApplicationCandidate,
  ResolutionResult,
  CompanyNormalizationResult,
} from '../types';

describe('IdentityResolutionEngine Integration', () => {
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

  describe('findCandidates - realistic scenario', () => {
    it('should find candidates with matching thread ID, company domain, and ATS provider', async () => {
      const mockApplications: ApplicationCandidate[] = [
        createMockApplication('app-1', 'Google', 'google.com', 'engineer@google.com'),
        createMockApplication('app-2', 'Google', 'google.com', 'jobs@microsoft.com'),
        createMockApplication('app-3', 'Amazon', 'amazon.com', 'hiring@amazon.com'),
        createMockApplication('app-4', 'Google', 'google.com', 'dev@google.com'),
        createMockApplication('app-5', 'Apple', 'apple.com', 'hr@apple.com'),
      ];

      (mockPrisma.application.findMany as jest.Mock).mockResolvedValue(mockApplications);

      const result = await engine.resolve('user-123', {
        threadId: 'thread-123',
        senderEmail: 'dev@google.com',
        senderName: 'John Doe',
        subject: 'Software Engineer Interview',
        body: 'Your application for Software Engineer position',
        atsProvider: 'lever',
        applicationId: null,
        requisitionId: null,
        companyName: 'Google',
        companyDomain: 'google.com',
        jobTitle: 'Software Engineer',
      });

      expect(result.matched).toBe(true);
      expect(result.applicationId).toBe('app-1');
      expect(result.method).toBe('high_confidence');
      expect(result.confidence).toBeGreaterThanOrEqual(0.7);
      expect(result.candidateCount).toBe(mockApplications.length);
    });

    it('should handle duplicate applications with same domain', async () => {
      const mockApplications: ApplicationCandidate[] = [
        createMockApplication('app-1', 'Meta', 'meta.com', 'hr@meta.com'),
        createMockApplication('app-2', 'Meta', 'meta.com', 'jobs@facebook.com'),
        createMockApplication('app-3', 'Meta', 'meta.com', 'recruitment@meta.com'),
      ];

      (mockPrisma.application.findMany as jest.Mock).mockResolvedValue(mockApplications);

      const result = await engine.resolve('user-123', {
        threadId: null,
        senderEmail: 'hr@meta.com',
        senderName: 'HR Team',
        subject: 'Application Update',
        body: 'We are reviewing your application',
        atsProvider: null,
        applicationId: null,
        requisitionId: null,
        companyName: 'Meta',
        companyDomain: 'meta.com',
        jobTitle: 'Software Engineer',
      });

      expect(result.matched).toBe(true);
      expect(result.applicationId).toBe('app-1');
      expect(result.method).toBe('high_confidence');
    });

    it('should resolve through requisition ID match', async () => {
      const mockApplications: ApplicationCandidate[] = [
        createMockApplication('app-1', 'Google', 'google.com', null),
        createMockApplication('app-2', 'Google', 'google.com', null),
      ];
      mockApplications[0].requisitionId = 'REQ-001';
      mockApplications[1].requisitionId = 'REQ-002';

      (mockPrisma.application.findMany as jest.Mock).mockResolvedValue(mockApplications);

      const result = await engine.resolve('user-123', {
        threadId: null,
        senderEmail: 'unknown@google.com',
        senderName: 'Unknown',
        subject: 'Position',
        body: 'Requisition ID: REQ-001',
        atsProvider: null,
        applicationId: null,
        requisitionId: 'REQ-001',
        companyName: 'Google',
        companyDomain: 'google.com',
        jobTitle: 'Software Engineer',
      });

      expect(result.matched).toBe(true);
      expect(result.applicationId).toBe('app-1');
      expect(result.method).toBe('exact_match');
    });
  });

  describe('company domain normalization', () => {
    it('should normalize various domain formats', () => {
      const testCases = [
        { input: 'www.google.com', expected: 'google' },
        { input: 'mail.google.com', expected: 'google' },
        { input: 'app.google.com', expected: 'google' },
        { input: 'google.com', expected: 'google' },
        { input: 'mail.google.io', expected: 'google' },
        { input: 'www.hiring.company.com', expected: 'company' },
      ];

      for (const testCase of testCases) {
        const normalized = engine['normalizeDomain'](testCase.input);
        expect(normalized).toBe(testCase.expected);
      }
    });

    it('should normalize email correctly', () => {
      const testCases = [
        { input: '  TEST@EXAMPLE.COM  ', expected: 'test@example.com' },
        { input: 'NoReply@Company.com', expected: 'noreply@company.com' },
        { input: '', expected: '' },
      ];

      for (const testCase of testCases) {
        const normalized = engine['normalizeEmail'](testCase.input);
        expect(normalized).toBe(testCase.expected);
      }
    });

    it('should calculate title similarity correctly', () => {
      const similarity = engine['calculateTitleSimilarity']('Software Engineer', 'Software Engineer');
      expect(similarity).toBe(1.0);

      const partialSimilarity = engine['calculateTitleSimilarity']('Sr. Software Engineer', 'Software Engineer');
      expect(partialSimilarity).toBeGreaterThan(0.5);

      const noSimilarity = engine['calculateTitleSimilarity']('Software Engineer', 'Data Scientist');
      expect(noSimilarity).toBe(0);
    });

    it('should calculate name similarity correctly', () => {
      const testCases = [
        { input1: 'Google', input2: 'Google', expected: 1.0 },
        { input1: 'Meta', input2: 'Meta Platforms', expected: 0.5 },
        { input1: 'Amazon', input2: 'Amazon.com', expected: 1.0 },
        { input1: 'Apple Inc.', input2: 'Apple', expected: 1.0 },
        { input1: 'Microsoft', input2: 'MicroSoft', expected: 0.4 },
      ];

      for (const testCase of testCases) {
        const similarity = engine['calculateNameSimilarity'](testCase.input1, testCase.input2);
        expect(similarity).toBeCloseTo(testCase.expected, 1);
      }
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
