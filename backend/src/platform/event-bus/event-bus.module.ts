import { Global, Module } from '@nestjs/common';
import { InProcessEventBus } from './event-bus';

@Global()
@Module({
  providers: [InProcessEventBus],
  exports: [InProcessEventBus],
})
export class EventBusModule {}
