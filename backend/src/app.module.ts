import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { PlatformModule } from './platform/platform.module';
import { ApplicationModule } from './application/application.module';
import { EmailSyncModule } from './email-sync/email-sync.module';
import { validateEnvironment } from './platform/config/environment';

@Module({
  imports: [
    ConfigModule.forRoot({
      validate: validateEnvironment,
      isGlobal: true,
    }),
    EventEmitterModule.forRoot(),
    PlatformModule,
    ApplicationModule,
    EmailSyncModule,
  ],
})
export class AppModule {}
