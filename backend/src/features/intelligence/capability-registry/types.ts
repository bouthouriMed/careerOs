export type TriggerType = 'event' | 'schedule' | 'user';

export type ExecutionMode = 'immediate' | 'background' | 'scheduled';

export interface CapabilityDefinition {
  id: string;
  name: string;
  description: string;
  objective: string;
  triggerType: TriggerType;
  triggerEvent?: string;
  schedule?: string;
  executionMode: ExecutionMode;
  contextProfile: string;
  outputType: string;
  signalThreshold: number;
  timeout: number;
  enabled: boolean;
}

export interface RegistryEntry {
  eventType: string;
  capabilityId: string;
  priority: number;
  conditions?: Record<string, unknown>;
  surfaces: string[];
}
