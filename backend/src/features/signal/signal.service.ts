import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../platform/prisma/prisma.service';
import { SignalStatus } from '@prisma/client';

@Injectable()
export class SignalService {
  constructor(private prisma: PrismaService) {}

  async findActive(userId: string) {
    return this.prisma.careerSignal.findMany({
      where: { userId, status: 'Active' },
      include: {
        application: {
          select: {
            id: true,
            status: true,
            company: { select: { id: true, name: true, logoUrl: true } },
            job: { select: { id: true, title: true } },
          },
        },
        company: { select: { id: true, name: true, logoUrl: true } },
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' },
      ],
    });
  }

  async findAll(userId: string, status?: SignalStatus) {
    const where: Record<string, unknown> = { userId };
    if (status) where.status = status;

    return this.prisma.careerSignal.findMany({
      where,
      include: {
        application: {
          select: {
            id: true,
            status: true,
            company: { select: { id: true, name: true, logoUrl: true } },
            job: { select: { id: true, title: true } },
          },
        },
        company: { select: { id: true, name: true, logoUrl: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string, userId: string) {
    return this.prisma.careerSignal.findFirst({
      where: { id, userId },
      include: {
        application: {
          include: {
            company: true,
            job: true,
            interviews: { orderBy: { scheduledAt: 'desc' } },
          },
        },
        company: true,
        sourceArtifact: true,
      },
    });
  }

  async getStats(userId: string) {
    const signals = await this.prisma.careerSignal.findMany({
      where: { userId },
      select: { type: true, priority: true, status: true },
    });

    const total = signals.length;
    const active = signals.filter((s) => s.status === 'Active').length;

    const byType: Record<string, number> = {};
    const byPriority: Record<string, number> = {};

    for (const signal of signals) {
      byType[signal.type] = (byType[signal.type] || 0) + 1;
      byPriority[signal.priority] = (byPriority[signal.priority] || 0) + 1;
    }

    return { total, active, byType, byPriority };
  }

  async dismiss(id: string, userId: string) {
    return this.prisma.careerSignal.updateMany({
      where: { id, userId },
      data: { status: 'Dismissed', dismissedAt: new Date() },
    });
  }

  async complete(id: string, userId: string) {
    return this.prisma.careerSignal.updateMany({
      where: { id, userId },
      data: { status: 'Completed', completedAt: new Date() },
    });
  }
}
