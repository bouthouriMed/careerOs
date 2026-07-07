import { Module } from '@nestjs/common';
import { EmailSyncController } from './email-sync.controller';
import { EmailSyncService } from './email-sync.service';
import { GmailService } from './gmail.service';
import { EmailDetectorService } from './email-detector.service';
import { EmailProviderConnectedHandler } from './handlers/email-provider-connected.handler';
import { ApplicationModule } from '../application/application.module';
import { PrismaService } from '../platform/prisma/prisma.service';
import { TokenService } from '../platform/auth/token.service';
import { AuthModule } from '../platform/auth/auth.module';

@Module({
  imports: [
    ApplicationModule,
    AuthModule,
  ],
  controllers: [EmailSyncController],
  providers: [
    EmailSyncService,
    GmailService,
    EmailDetectorService,
    EmailProviderConnectedHandler,
    PrismaService,
    TokenService,
  ],
})
export class EmailSyncModule {}
