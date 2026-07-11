import { Module } from '@nestjs/common';
import { PrismaService } from '../../platform/prisma/prisma.service';
import { EmailExtractionCapability } from './capabilities/email-extraction.capability';
import { CapabilityRegistry } from './capability-registry/capability-registry.service';
import { IntelligenceOrchestrator } from './intelligence-orchestrator';
import { ContextBuilder } from './context-builder/context-builder.service';
import { ArtifactValidator } from './artifact-validator/artifact-validator.service';
import { SignalGenerator } from './signal-generator/signal-generator.service';
import { CareerMemoryService } from './career-memory/career-memory.service';
import { EvaluationFrameworkService } from './evaluation/evaluation-framework.service';

@Module({
  providers: [
    PrismaService,
    CapabilityRegistry,
    IntelligenceOrchestrator,
    ContextBuilder,
    ArtifactValidator,
    SignalGenerator,
    CareerMemoryService,
    EmailExtractionCapability,
    EvaluationFrameworkService,
  ],
  exports: [IntelligenceOrchestrator, CapabilityRegistry, ContextBuilder, ArtifactValidator, SignalGenerator, CareerMemoryService, EvaluationFrameworkService],
})
export class IntelligenceModule {}
