import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { EventEmitter } from 'events';
import { EventBus, EventPayload } from './event-bus.interface';

@Injectable()
export class InProcessEventBus implements EventBus, OnModuleDestroy {
  private emitter = new EventEmitter();
  private handlers = new Map<string, Array<(payload: EventPayload) => Promise<void>>>();

  publish(event: string, payload: EventPayload): void {
    this.emitter.emit(event, payload);
  }

  subscribe(event: string, handler: (payload: EventPayload) => Promise<void>): void {
    const existing = this.handlers.get(event) || [];
    existing.push(handler);
    this.handlers.set(event, existing);
    this.emitter.on(event, handler);
  }

  onModuleDestroy(): void {
    this.emitter.removeAllListeners();
  }
}
