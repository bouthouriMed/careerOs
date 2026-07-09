import { Module } from '@nestjs/common';
import { PrismaService } from '../../platform/prisma/prisma.service';
import { EmailExtractionCapability } from './capabilities/email-extraction.capability';

@Module({
  providers: [EmailExtractionCapability, PrismaService],
  exports: [EmailExtractionCapability],
})
export class IntelligenceModule {}
