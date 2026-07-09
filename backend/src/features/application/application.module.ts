import { Module } from '@nestjs/common';
import { PrismaService } from '../../platform/prisma/prisma.service';
import { ApplicationController } from './application.controller';
import { ApplicationService } from './application.service';
import { ApplicationConsumer } from './application.consumer';
import { CompanyService } from '../company/company.service';
import { JobService } from '../job/job.service';
import { RecruiterService } from '../recruiter/recruiter.service';

@Module({
  controllers: [ApplicationController],
  providers: [
    ApplicationService,
    ApplicationConsumer,
    CompanyService,
    JobService,
    RecruiterService,
    PrismaService,
  ],
  exports: [ApplicationService],
})
export class ApplicationModule {}
