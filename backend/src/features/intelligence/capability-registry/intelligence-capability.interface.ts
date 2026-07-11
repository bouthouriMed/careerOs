import { EventPayload } from '../../../platform/event-bus/event-bus.interface';
import { CapabilityDefinition } from './types';
import { AssembledContext } from '../context-builder';

export interface CapabilityResult {
  artifacts: Array<{
    type: string;
    objective: string;
    data: Record<string, unknown>;
    confidence: number;
  }>;
}

export interface IntelligenceCapability {
  definition: CapabilityDefinition;
  execute(payload: EventPayload, context?: AssembledContext): Promise<CapabilityResult>;
}
