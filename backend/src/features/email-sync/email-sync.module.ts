import { Module } from '@nestjs/common';
import { PrismaService } from '../../platform/prisma/prisma.service';
import { TokenService } from '../../platform/auth/token.service';
import { EmailSyncController } from './email-sync.controller';
import { EmailSyncService } from './email-sync.service';
import { GmailSyncService } from './gmail-sync.service';

@Module({
  controllers: [EmailSyncController],
  providers: [
    EmailSyncService,
    GmailSyncService,
    PrismaService,
    TokenService,
  ],
  exports: [EmailSyncService],
})
export class EmailSyncModule {}
