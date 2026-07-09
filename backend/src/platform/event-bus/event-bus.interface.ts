export interface EventPayload {
  userId?: string;
  [key: string]: unknown;
}

export interface EventBus {
  publish(event: string, payload: EventPayload): void;
  subscribe(event: string, handler: (payload: EventPayload) => Promise<void>): void;
}
