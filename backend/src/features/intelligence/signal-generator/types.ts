import { SignalType, SignalPriority } from '@prisma/client';

export interface SignalEvaluation {
  shouldGenerate: boolean;
  type: SignalType;
  priority: SignalPriority;
  title: string;
  description: string;
  surfaces: string[];
  expiresInDays?: number;
}

export interface ArtifactForEvaluation {
  type: string;
  data: Record<string, unknown>;
  confidence: number;
  sourceEvent: string;
}
