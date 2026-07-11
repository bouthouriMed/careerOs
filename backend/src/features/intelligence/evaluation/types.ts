export interface PipelineMetrics {
  userId: string;
  period: MetricsPeriod;
  totalEmailsProcessed: number;
  hiringEmailsDetected: number;
  applicationsCreated: number;
  applicationsUpdated: number;
  identityResolutions: IdentityResolutionMetrics;
  extractionAccuracy: ExtractionAccuracyMetrics;
  statusDistribution: StatusDistribution;
  confidenceDistribution: ConfidenceDistribution;
  atsProviderBreakdown: Record<string, number>;
  calculatedAt: Date;
}

export type MetricsPeriod = 'all_time' | 'last_30_days' | 'last_7_days';

export interface IdentityResolutionMetrics {
  totalAttempts: number;
  exactMatches: number;
  highConfidenceMatches: number;
  ambiguousMatches: number;
  noMatches: number;
  averageConfidence: number;
  matchRate: number;
}

export interface ExtractionAccuracyMetrics {
  deterministicExtractions: number;
  llmExtractions: number;
  deterministicConfidence: number;
  llmConfidence: number;
  categoryAccuracy: number;
  companyExtractionRate: number;
  titleExtractionRate: number;
}

export interface StatusDistribution {
  Saved: number;
  Applied: number;
  Screening: number;
  Interviewing: number;
  Offer: number;
  Accepted: number;
  Declined: number;
  Rejected: number;
  Closed: number;
}

export interface ConfidenceDistribution {
  high: number;
  medium: number;
  low: number;
  average: number;
}

export interface EvaluationResult {
  overallScore: number;
  metrics: PipelineMetrics;
  recommendations: string[];
  issues: EvaluationIssue[];
}

export interface EvaluationIssue {
  category: string;
  severity: 'low' | 'medium' | 'high';
  message: string;
  suggestion: string;
}
