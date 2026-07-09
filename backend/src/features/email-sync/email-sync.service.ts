import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../platform/prisma/prisma.service';
import { InProcessEventBus } from '../../platform/event-bus/event-bus';
import { SyncStatus, SyncStatusResponse } from './types';

@Injectable()
export class EmailSyncService {
  constructor(
    private prisma: PrismaService,
    private eventBus: InProcessEventBus,
  ) {}

  async getStatus(userId: string): Promise<SyncStatusResponse> {
    const state = await this.prisma.emailSyncState.findUnique({
      where: { userId },
    });

    if (!state) {
      return {
        status: 'never_synced',
        emailsScanned: 0,
        applicationsDetected: 0,
        startedAt: null,
        completedAt: null,
      };
    }

    return {
      status: state.status as SyncStatus,
      emailsScanned: state.emailsScanned,
      applicationsDetected: state.applicationsDetected,
      startedAt: state.startedAt?.toISOString() ?? null,
      completedAt: state.completedAt?.toISOString() ?? null,
      errorMessage: state.errorMessage ?? undefined,
    };
  }

  async startSync(userId: string): Promise<SyncStatusResponse> {
    await this.prisma.emailSyncState.upsert({
      where: { userId },
      create: {
        userId,
        status: 'pending',
        startedAt: new Date(),
      },
      update: {
        status: 'pending',
        startedAt: new Date(),
        completedAt: null,
        errorMessage: null,
        emailsScanned: 0,
        applicationsDetected: 0,
      },
    });

    this.eventBus.publish('email.sync.started', { userId });

    return this.getStatus(userId);
  }

  async updateProgress(userId: string, data: { emailsScanned?: number; applicationsDetected?: number }) {
    await this.prisma.emailSyncState.upsert({
      where: { userId },
      create: {
        userId,
        status: 'pending',
        emailsScanned: data.emailsScanned ?? 0,
        applicationsDetected: data.applicationsDetected ?? 0,
        startedAt: new Date(),
      },
      update: {
        emailsScanned: data.emailsScanned,
        applicationsDetected: data.applicationsDetected,
      },
    });
  }

  async completeSync(userId: string) {
    await this.prisma.emailSyncState.update({
      where: { userId },
      data: {
        status: 'completed',
        completedAt: new Date(),
      },
    });
  }

  async failSync(userId: string, errorMessage: string) {
    await this.prisma.emailSyncState.update({
      where: { userId },
      data: {
        status: 'error',
        errorMessage,
        completedAt: new Date(),
      },
    });
  }
}
