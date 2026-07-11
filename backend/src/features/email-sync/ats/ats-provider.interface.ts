export interface AtsProviderConfig {
  id: string;
  name: string;
  domainPatterns: RegExp[];
  senderPatterns: RegExp[];
  subjectPatterns: RegExp[];
  applicationIdPatterns: RegExp[];
  requisitionIdPatterns: RegExp[];
  categorySignals: Record<string, number>;
}

export interface AtsDetectionResult {
  provider: string | null;
  applicationId: string | null;
  requisitionId: string | null;
  subjectConfidence: number;
  senderConfidence: number;
}

export interface AtsCategorySignal {
  provider: string;
  category: string;
  confidence: number;
}
