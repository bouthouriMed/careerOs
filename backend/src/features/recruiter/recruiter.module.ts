import { Module } from '@nestjs/common';
import { PrismaService } from '../../platform/prisma/prisma.service';
import { RecruiterController } from './recruiter.controller';
import { RecruiterService } from './recruiter.service';

@Module({
  controllers: [RecruiterController],
  providers: [RecruiterService, PrismaService],
  exports: [RecruiterService],
})
export class RecruiterModule {}
