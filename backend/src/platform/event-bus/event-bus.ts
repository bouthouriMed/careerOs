import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { EventBus, EventPayload } from './event-bus.interface';

@Injectable()
export class InProcessEventBus implements EventBus, OnModuleDestroy {
  private handlers = new Map<string, Array<(payload: EventPayload) => Promise<void>>>();

  async publish(event: string, payload: EventPayload): Promise<void> {
    const handlers = this.handlers.get(event) || [];
    for (const handler of handlers) {
      await handler(payload).catch((err) => {
        console.error(`EventBus handler error for ${event}:`, err);
      });
    }
  }

  subscribe(event: string, handler: (payload: EventPayload) => Promise<void>): void {
    const existing = this.handlers.get(event) || [];
    existing.push(handler);
    this.handlers.set(event, existing);
  }

  onModuleDestroy(): void {
    this.handlers.clear();
  }
}
