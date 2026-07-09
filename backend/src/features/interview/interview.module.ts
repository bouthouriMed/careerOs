import { Module } from '@nestjs/common';
import { PrismaService } from '../../platform/prisma/prisma.service';
import { InterviewController } from './interview.controller';
import { InterviewService } from './interview.service';

@Module({
  controllers: [InterviewController],
  providers: [InterviewService, PrismaService],
  exports: [InterviewService],
})
export class InterviewModule {}
