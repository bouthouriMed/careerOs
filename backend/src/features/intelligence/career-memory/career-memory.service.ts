import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../platform/prisma/prisma.service';
import { KnowledgeEntry, Evidence } from './types';

@Injectable()
export class CareerMemoryService {
  private readonly logger = new Logger(CareerMemoryService.name);

  constructor(private prisma: PrismaService) {}

  async recordEvidence(
    userId: string,
    key: string,
    value: Record<string, unknown>,
    evidence: Evidence,
  ): Promise<void> {
    const existing = await this.prisma.careerMemory.findUnique({
      where: { userId_key: { userId, key } },
    });

    if (existing) {
      await this.reinforce(existing.id, existing.data as Record<string, unknown>, evidence);
    } else {
      await this.create(userId, key, value, evidence);
    }
  }

  async getKnowledge(userId: string, key: string): Promise<KnowledgeEntry | null> {
    const entry = await this.prisma.careerMemory.findUnique({
      where: { userId_key: { userId, key } },
    });

    if (!entry) return null;

    return this.toKnowledgeEntry(entry);
  }

  async getReliableKnowledge(userId: string): Promise<KnowledgeEntry[]> {
    const entries = await this.prisma.careerMemory.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
    });

    return entries
      .map((e) => this.toKnowledgeEntry(e))
      .filter((e) => e.status === 'reliable' || e.status === 'developing');
  }

  private async create(
    userId: string,
    key: string,
    value: Record<string, unknown>,
    evidence: Evidence,
  ): Promise<void> {
    const confidence = this.calculateInitialConfidence(evidence);

    const data = {
      value,
      confidence,
      evidenceCount: 1,
      firstObserved: new Date().toISOString(),
      lastReinforced: new Date().toISOString(),
      sourceEvents: [evidence.event],
      status: this.getStatus(confidence),
    };

    await this.prisma.careerMemory.create({
      data: {
        userId,
        key,
        data: data as unknown as Prisma.InputJsonValue,
      },
    });

    this.logger.log(`Created career memory: ${key} (confidence: ${confidence})`);
  }

  private async reinforce(
    id: string,
    currentData: Record<string, unknown>,
    evidence: Evidence,
  ): Promise<void> {
    const currentConfidence = (currentData.confidence as number) || 0;
    const evidenceCount = (currentData.evidenceCount as number) || 0;
    const sourceEvents = (currentData.sourceEvents as string[]) || [];

    const newConfidence = this.calculateReinforcedConfidence(
      currentConfidence,
      evidence,
      evidenceCount,
    );

    const newCount = evidenceCount + 1;
    const newSourceEvents = [...new Set([...sourceEvents, evidence.event])];

    const data = {
      ...currentData,
      confidence: newConfidence,
      evidenceCount: newCount,
      lastReinforced: new Date().toISOString(),
      sourceEvents: newSourceEvents,
      status: this.getStatus(newConfidence),
    };

    await this.prisma.careerMemory.update({
      where: { id },
      data: {
        data: data as unknown as Prisma.InputJsonValue,
      },
    });

    this.logger.log(`Reinforced career memory: ${currentData.key} (confidence: ${currentConfidence} → ${newConfidence})`);
  }

  private calculateInitialConfidence(evidence: Evidence): number {
    return Math.min(0.5, evidence.sourceReliability * 0.5);
  }

  private calculateReinforcedConfidence(
    current: number,
    evidence: Evidence,
    evidenceCount: number,
  ): number {
    const evidenceWeight = 0.1 + Math.min(0.1, evidenceCount * 0.01);
    const newConfidence = current + evidenceWeight * evidence.sourceReliability;
    return Math.min(1.0, newConfidence);
  }

  private getStatus(confidence: number): string {
    if (confidence >= 0.8) return 'reliable';
    if (confidence >= 0.5) return 'developing';
    if (confidence >= 0.3) return 'uncertain';
    return 'deprecated';
  }

  private toKnowledgeEntry(data: { data: unknown }): KnowledgeEntry {
    const d = data.data as Record<string, unknown>;
    return {
      key: d.key as string,
      value: (d.value as Record<string, unknown>) || {},
      confidence: (d.confidence as number) || 0,
      evidenceCount: (d.evidenceCount as number) || 0,
      firstObserved: new Date(d.firstObserved as string),
      lastReinforced: new Date(d.lastReinforced as string),
      sourceEvents: (d.sourceEvents as string[]) || [],
      status: (d.status as KnowledgeEntry['status']) || 'deprecated',
    };
  }
}
