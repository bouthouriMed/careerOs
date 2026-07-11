import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InProcessEventBus } from '../../platform/event-bus/event-bus';
import { EventPayload } from '../../platform/event-bus/event-bus.interface';
import { CapabilityRegistry } from './capability-registry/capability-registry.service';
import { IntelligenceCapability } from './capability-registry/intelligence-capability.interface';
import { ContextBuilder } from './context-builder/context-builder.service';
import { ArtifactValidator } from './artifact-validator/artifact-validator.service';
import { SignalGenerator } from './signal-generator/signal-generator.service';
import { CareerMemoryService } from './career-memory/career-memory.service';

@Injectable()
export class IntelligenceOrchestrator implements OnModuleInit {
  private readonly logger = new Logger(IntelligenceOrchestrator.name);
  private capabilities = new Map<string, IntelligenceCapability>();
  private subscribedEvents = new Set<string>();

  constructor(
    private eventBus: InProcessEventBus,
    private registry: CapabilityRegistry,
    private contextBuilder: ContextBuilder,
    private artifactValidator: ArtifactValidator,
    private signalGenerator: SignalGenerator,
    private careerMemory: CareerMemoryService,
  ) {}

  onModuleInit(): void {}

  registerCapability(capability: IntelligenceCapability): void {
    this.capabilities.set(capability.definition.id, capability);
    this.ensureSubscribed(capability.definition.id);
    this.logger.log(`Registered capability: ${capability.definition.id}`);
  }

  private ensureSubscribed(capabilityId: string): void {
    const def = this.capabilities.get(capabilityId)?.definition;
    if (!def || def.triggerType !== 'event' || !def.triggerEvent) return;

    if (!this.subscribedEvents.has(def.triggerEvent)) {
      this.subscribedEvents.add(def.triggerEvent);
      this.eventBus.subscribe(def.triggerEvent, async (payload) => {
        await this.routeEvent(def.triggerEvent!, payload);
      });
      this.logger.log(`Orchestrator subscribed to: ${def.triggerEvent}`);
    }
  }

  private async routeEvent(eventName: string, payload: EventPayload): Promise<void> {
    const capDefs = this.registry.findByEvent(eventName);

    if (capDefs.length === 0) {
      this.logger.debug(`No capabilities registered for event: ${eventName}`);
      return;
    }

    this.logger.log(
      `Routing ${eventName} to ${capDefs.length} capability(ies): ${capDefs.map((c) => c.id).join(', ')}`,
    );

    for (const capDef of capDefs) {
      const capability = this.capabilities.get(capDef.id);
      if (!capability) {
        this.logger.warn(`Capability ${capDef.id} registered in registry but not instantiated`);
        continue;
      }

      try {
        let context;
        if (capDef.contextProfile) {
          context = await this.contextBuilder.assemble(
            capDef.contextProfile,
            eventName,
            payload,
          );
        }

        const result = await capability.execute(payload, context);

        const validatedArtifacts = result.artifacts.filter((artifact) => {
          const validation = this.artifactValidator.validate(
            artifact.type,
            artifact.data,
            artifact.confidence,
          );
          if (!validation.valid) {
            this.logger.warn(
              `Artifact ${artifact.type} failed validation: ${validation.errors.join(', ')}`,
            );
          }
          return validation.valid;
        });

        const userId = payload.userId as string;

        for (const artifact of validatedArtifacts) {
          const evaluation = this.signalGenerator.evaluate({
            type: artifact.type,
            data: artifact.data,
            confidence: artifact.confidence,
            sourceEvent: eventName,
          });

          if (evaluation.shouldGenerate) {
            const signalId = await this.signalGenerator.generate(
              userId,
              evaluation,
            );

            if (signalId) {
              const companyName = this.extractCompanyName(artifact);
              await this.signalGenerator.linkToApplication(signalId, userId, companyName);
            }
          }

          await this.updateCareerMemory(userId, artifact, eventName);
        }

        this.logger.log(
          `Capability ${capDef.id} produced ${result.artifacts.length} artifact(s), ${validatedArtifacts.length} validated`,
        );
      } catch (error) {
        this.logger.error(
          `Capability ${capDef.id} failed: ${error instanceof Error ? error.message : error}`,
        );
      }
    }
  }

  private extractCompanyName(artifact: { type: string; data: Record<string, unknown> }): string | undefined {
    const data = artifact.data as { application?: { companyName?: string } };
    return data.application?.companyName;
  }

  private async updateCareerMemory(
    userId: string,
    artifact: { type: string; data: Record<string, unknown>; confidence: number },
    eventName: string,
  ): Promise<void> {
    if (artifact.type === 'email_classification') {
      const data = artifact.data as { category?: string; application?: { companyName?: string } };
      if (data.category && data.application?.companyName) {
        const key = `application_pattern_${data.category}`;
        await this.careerMemory.recordEvidence(userId, key, {
          category: data.category,
          company: data.application.companyName,
        }, {
          event: eventName,
          data: artifact.data,
          sourceReliability: 0.8,
        });
      }
    }

    if (artifact.type === 'email_extraction') {
      const data = artifact.data as { application?: { status?: string } };
      if (data.application?.status) {
        const key = `application_status_${data.application.status}`;
        await this.careerMemory.recordEvidence(userId, key, {
          status: data.application.status,
        }, {
          event: eventName,
          data: artifact.data,
          sourceReliability: 0.9,
        });
      }
    }
  }
}
