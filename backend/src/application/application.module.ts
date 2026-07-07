import { Module } from '@nestjs/common';
import { ApplicationController } from './application.controller';
import { ApplicationService } from './application.service';
import { ApplicationRepository } from './persistence/application.repository';
import { PrismaService } from '../platform/prisma/prisma.service';
import { AuthModule } from '../platform/auth/auth.module';

@Module({
  imports: [
    AuthModule,
  ],
  controllers: [ApplicationController],
  providers: [
    ApplicationService,
    ApplicationRepository,
    PrismaService,
  ],
  exports: [ApplicationService],
})
export class ApplicationModule {}
