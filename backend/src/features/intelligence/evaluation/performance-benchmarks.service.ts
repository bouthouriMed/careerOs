import { DeterministicExtractor } from '../deterministic-extractor';

export class EvaluationFrameworkService {
  private metrics: any[] = [];

  async runPipelineBenchmarks(userId: string, iterations: number = 10): Promise<BenchmarkResult> {
    const startTime = Date.now();
    const extractedCandidates: any[] = [];
    const aiClassifications: any[] = [];

    for (let i = 0; i < iterations; i++) {
      const testSubjects = this.generateTestSubjects();

      for (const subject of testSubjects) {
        const extractionStart = Date.now();
        const extracted = DeterministicExtractor.extractFromSubject(subject);
        const extractionTime = Date.now() - extractionStart;

        extractedCandidates.push({ subject, extracted, extractionTime });

        if (extracted.confidence >= 0.7 && extracted.category) {
          aiClassifications.push({
            category: extracted.category,
            companyName: extracted.companyName,
            jobTitle: extracted.jobTitle,
          });
        }
      }
    }

    const totalTime = Date.now() - startTime;
    const extractionsPerSecond = (iterations * 5) / (totalTime / 1000);

    const result: BenchmarkResult = {
      iterations,
      subjectsProcessed: iterations * 5,
      deterministicExtractions: extractedCandidates.length,
      aiClassificationsSkipped: aiClassifications.length,
      totalTimeMs: totalTime,
      extractionsPerSecond,
      confidenceDistribution: this.calculateConfidenceDistribution(extractedCandidates),
      categoryAccuracy: this.calculateCategoryAccuracy(aiClassifications),
      performanceBySubjectLength: this.analyzePerformanceBySubjectLength(extractedCandidates),
      memoryUsage: process.memoryUsage(),
      timestamp: new Date(),
    };

    this.metrics.push(result);
    return result;
  }

  private generateTestSubjects(): string[] {
    return [
      'RE: Interview Invitation - Google Software Engineer',
      'Your application to Amazon SDE I position',
      'We are pleased to offer you employment at Meta',
      'Next steps for your application - Microsoft Software Engineer',
      'Referral to Apple Engineer opening',
      'We are excited about your application to Meta - Senior Engineer',
      'Interview schedule: Google Software Engineer interview',
      'Offer letter: Amazon SDE I - $150,000',
      'Status update: Microsoft Software Engineer screening',
      'Welcome to the team! - Apple Engineer',
      'Contract extension - Google Software Engineer',
      'Refer - Recommended for Meta Senior Engineer role',
      'Application confirmed: Amazon SDE I position',
      'We decided not to move forward - Microsoft Software Engineer',
      'Your application has been viewed - Google Software Engineer',
      'Weekly update: Amazon Developer position',
      'Schedule a phone screen - Meta Software Engineer',
      'Technical interview next week - Apple Engineer',
      'Salary review - Microsoft Software Engineer',
      'New posting: Google Software Engineer - Level 4',
    ];
  }

  private calculateConfidenceDistribution(
    extractedCandidates: any[],
  ): { high: number; medium: number; low: number } {
    return extractedCandidates.reduce(
      (dist, { extracted }) => {
        if (extracted.confidence >= 0.7) dist.high++;
        else if (extracted.confidence >= 0.4) dist.medium++;
        else dist.low++;
        return dist;
      },
      { high: 0, medium: 0, low: 0 },
    );
  }

  private calculateCategoryAccuracy(
    classifications: any[],
  ): { correct: number; total: number; accuracy: number } {
    if (classifications.length === 0) return { correct: 0, total: 0, accuracy: 0 };

    const expectedCategories = classifications.map(() => 'correct_category');
    const actualCategories = classifications.map((c) => c.category);

    const correct = actualCategories.filter((cat, idx) => cat === expectedCategories[idx]).length;

    return {
      correct,
      total: actualCategories.length,
      accuracy: correct / actualCategories.length,
    };
  }

  private analyzePerformanceBySubjectLength(
    extractedCandidates: any[],
  ): { [length: number]: { extractions: number; avgTime: number } } {
    const result: { [length: number]: { extractions: number; avgTime: number } } = {};

    for (const { subject, extractionTime } of extractedCandidates) {
      const length = subject.length;
      if (!result[length]) {
        result[length] = { extractions: 0, avgTime: 0 };
      }
      result[length].extractions++;
      result[length].avgTime += extractionTime;
    }

    for (const length in result) {
      if (result[length as any].extractions > 0) {
        result[length as any].avgTime = Math.round(
          result[length as any].avgTime / result[length as any].extractions,
        );
      }
    }

    return result;
  }

  getLatestMetric(): BenchmarkResult | null {
    return this.metrics[this.metrics.length - 1] || null;
  }

  getHistoricalMetrics(limit: number = 10): BenchmarkResult[] {
    return this.metrics.slice(-limit);
  }
}

export interface BenchmarkResult {
  iterations: number;
  subjectsProcessed: number;
  deterministicExtractions: number;
  aiClassificationsSkipped: number;
  totalTimeMs: number;
  extractionsPerSecond: number;
  confidenceDistribution: { high: number; medium: number; low: number };
  categoryAccuracy: { correct: number; total: number; accuracy: number };
  performanceBySubjectLength: { [length: number]: { extractions: number; avgTime: number } };
  memoryUsage: NodeJS.MemoryUsage;
  timestamp: Date;
}
