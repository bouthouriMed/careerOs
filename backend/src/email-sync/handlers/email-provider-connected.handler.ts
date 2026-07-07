import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PrismaService } from '../../platform/prisma/prisma.service';
import { EmailSyncService } from '../email-sync.service';
import { EmailProviderConnectedEvent } from '../events/email-provider-connected.event';

@Injectable()
export class EmailProviderConnectedHandler {
  private readonly logger = new Logger(EmailProviderConnectedHandler.name);

  constructor(
    private readonly emailSyncService: EmailSyncService,
    private readonly prisma: PrismaService,
  ) {}

  @OnEvent('email-provider.connected')
  async handle(event: EmailProviderConnectedEvent): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: event.userId },
      select: { initialSyncCompleted: true },
    });

    if (!user) {
      this.logger.warn(`User ${event.userId} not found, skipping sync`);
      return;
    }

    if (user.initialSyncCompleted) {
      this.logger.log(`Initial sync already completed for user ${event.userId}, skipping`);
      return;
    }

    this.logger.log(`Starting initial sync for user ${event.userId}`);

    try {
      await this.emailSyncService.sync(event.userId);
      this.logger.log(`Initial sync completed for user ${event.userId}`);
    } catch (error) {
      this.logger.error(`Initial sync failed for user ${event.userId}: ${error}`);
    }
  }
}
