export interface ContextProfile {
  id: string;
  name: string;
  description: string;
  requiredEntities: string[];
  memoryCategories: string[];
  artifactTypes: string[];
  maxTokens: number;
  priorityOrder: string[];
}

export interface AssembledContext {
  profileId: string;
  trigger: {
    eventName: string;
    payload: Record<string, unknown>;
  };
  businessData: {
    applications: unknown[];
    companies: unknown[];
    jobs: unknown[];
    interviews: unknown[];
  };
  careerMemory: unknown[];
  artifacts: unknown[];
  metadata: {
    totalTokens: number;
    includedEntities: string[];
    excludedEntities: string[];
    assembledAt: Date;
  };
}
