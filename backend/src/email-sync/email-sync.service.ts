import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../platform/prisma/prisma.service';
import { GmailService } from './gmail.service';
import { EmailDetectorService } from './email-detector.service';
import { ApplicationService } from '../application/application.service';
import { InitialSyncCompletedEvent } from './events/initial-sync-completed.event';

interface SyncResult {
  emailsScanned: number;
  applicationsCreated: number;
  syncDurationMs: number;
}

@Injectable()
export class EmailSyncService {
  private readonly logger = new Logger(EmailSyncService.name);

  constructor(
    private readonly gmailService: GmailService,
    private readonly emailDetector: EmailDetectorService,
    private readonly applicationService: ApplicationService,
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async sync(userId: string, monthsBack = 12): Promise<SyncResult> {
    const syncRecord = await this.prisma.emailSync.create({
      data: {
        userId,
        status: 'pending',
      },
    });

    await this.prisma.emailSync.update({
      where: { id: syncRecord.id },
      data: { status: 'in_progress' },
    });

    const start = Date.now();
    const sinceDate = new Date();
    sinceDate.setMonth(sinceDate.getMonth() - monthsBack);

    this.logger.log(`Starting email sync for user ${userId} since ${sinceDate.toISOString()}`);

    const messages = await this.gmailService.fetchMessagesSince(
      userId,
      sinceDate,
      (processed, _total) => {
        this.prisma.emailSync.update({
          where: { id: syncRecord.id },
          data: { emailsScanned: processed },
        }).catch(() => {});
      },
    );

    await this.prisma.emailSync.update({
      where: { id: syncRecord.id },
      data: { emailsScanned: messages.length },
    });

    this.logger.log(`Fetched ${messages.length} messages`);

    const detected = this.emailDetector.detectHiringEmails(messages);
    this.logger.log(`Detected ${detected.length} hiring-related emails`);

    let applicationsCreated = 0;
    for (const d of detected) {
      if (d.confidence === 'low') continue;
      try {
        await this.applicationService.create(
          {
            companyName: d.companyName,
            jobTitle: d.jobTitle ?? undefined,
            source: 'email',
            appliedAt: d.emailDate.toISOString(),
          },
          userId,
        );
        applicationsCreated++;

        await this.prisma.emailSync.update({
          where: { id: syncRecord.id },
          data: { applicationsCreated },
        });
      } catch (error) {
        this.logger.warn(`Failed to create application for ${d.companyName}: ${error}`);
      }
    }

    const syncDurationMs = Date.now() - start;

    await this.prisma.user.update({
      where: { id: userId },
      data: { initialSyncCompleted: true },
    });

    await this.prisma.emailSync.update({
      where: { id: syncRecord.id },
      data: {
        status: 'completed',
        completedAt: new Date(),
        applicationsCreated,
      },
    });

    this.eventEmitter.emit(
      'email-sync.completed',
      new InitialSyncCompletedEvent(userId, messages.length, applicationsCreated, syncDurationMs),
    );

    return {
      emailsScanned: messages.length,
      applicationsCreated,
      syncDurationMs,
    };
  }
}
