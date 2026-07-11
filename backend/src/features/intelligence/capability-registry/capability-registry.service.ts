import { Injectable } from '@nestjs/common';
import { CapabilityDefinition, RegistryEntry } from './types';

@Injectable()
export class CapabilityRegistry {
  private capabilities = new Map<string, CapabilityDefinition>();
  private eventMapping = new Map<string, RegistryEntry[]>();

  register(definition: CapabilityDefinition): void {
    this.capabilities.set(definition.id, definition);

    if (definition.triggerType === 'event' && definition.triggerEvent) {
      const existing = this.eventMapping.get(definition.triggerEvent) || [];
      existing.push({
        eventType: definition.triggerEvent,
        capabilityId: definition.id,
        priority: existing.length,
        surfaces: ['dashboard'],
      });
      this.eventMapping.set(definition.triggerEvent, existing);
    }
  }

  findByEvent(eventName: string): CapabilityDefinition[] {
    const entries = this.eventMapping.get(eventName) || [];
    return entries
      .filter((entry) => {
        const cap = this.capabilities.get(entry.capabilityId);
        return cap?.enabled;
      })
      .sort((a, b) => a.priority - b.priority)
      .map((entry) => this.capabilities.get(entry.capabilityId)!)
      .filter(Boolean);
  }

  findById(id: string): CapabilityDefinition | undefined {
    return this.capabilities.get(id);
  }

  findEnabled(): CapabilityDefinition[] {
    return Array.from(this.capabilities.values()).filter((cap) => cap.enabled);
  }

  findAll(): CapabilityDefinition[] {
    return Array.from(this.capabilities.values());
  }

  getEventEntries(eventName: string): RegistryEntry[] {
    return this.eventMapping.get(eventName) || [];
  }
}
