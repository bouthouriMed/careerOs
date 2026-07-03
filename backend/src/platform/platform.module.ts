import { Module } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { AuthModule } from './auth/auth.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [AuthModule, HealthModule],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PlatformModule {}
