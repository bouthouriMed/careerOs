import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PlatformModule } from './platform/platform.module';
import { EventBusModule } from './platform/event-bus/event-bus.module';
import { EmailSyncModule } from './features/email-sync/email-sync.module';
import { CompanyModule } from './features/company/company.module';
import { JobModule } from './features/job/job.module';
import { RecruiterModule } from './features/recruiter/recruiter.module';
import { ApplicationModule } from './features/application/application.module';
import { InterviewModule } from './features/interview/interview.module';
import { IntelligenceModule } from './features/intelligence/intelligence.module';
import { validateEnvironment } from './platform/config/environment';

@Module({
  imports: [
    ConfigModule.forRoot({
      validate: validateEnvironment,
      isGlobal: true,
    }),
    PlatformModule,
    EventBusModule,
    EmailSyncModule,
    CompanyModule,
    JobModule,
    RecruiterModule,
    ApplicationModule,
    InterviewModule,
    IntelligenceModule,
  ],
})
export class AppModule {}
