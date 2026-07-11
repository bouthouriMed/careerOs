import { Module } from '@nestjs/common';
import { PrismaService } from '../../platform/prisma/prisma.service';
import { TokenService } from '../../platform/auth/token.service';
import { EmailSyncController } from './email-sync.controller';
import { EmailSyncService } from './email-sync.service';
import { GmailSyncService } from './gmail-sync.service';
import { IdentityResolutionEngine } from './identity-resolution/identity-resolution.engine';

@Module({
  controllers: [EmailSyncController],
  providers: [
    EmailSyncService,
    GmailSyncService,
    PrismaService,
    TokenService,
    IdentityResolutionEngine,
  ],
  exports: [EmailSyncService, GmailSyncService],
})
export class EmailSyncModule {}
