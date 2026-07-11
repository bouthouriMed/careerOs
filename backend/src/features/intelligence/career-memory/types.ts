export interface KnowledgeEntry {
  key: string;
  value: Record<string, unknown>;
  confidence: number;
  evidenceCount: number;
  firstObserved: Date;
  lastReinforced: Date;
  sourceEvents: string[];
  status: 'reliable' | 'developing' | 'uncertain' | 'deprecated';
}

export interface Evidence {
  event: string;
  data: Record<string, unknown>;
  sourceReliability: number;
}
