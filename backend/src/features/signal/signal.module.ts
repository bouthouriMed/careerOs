import { Module } from '@nestjs/common';
import { PrismaService } from '../../platform/prisma/prisma.service';
import { SignalController } from './signal.controller';
import { SignalService } from './signal.service';

@Module({
  controllers: [SignalController],
  providers: [SignalService, PrismaService],
  exports: [SignalService],
})
export class SignalModule {}
