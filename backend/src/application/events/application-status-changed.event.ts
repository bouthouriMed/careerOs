export class ApplicationStatusChangedEvent {
  constructor(
    public readonly applicationId: string,
    public readonly userId: string,
    public readonly previousStatus: string,
    public readonly newStatus: string,
    public readonly timestamp: Date = new Date(),
  ) {}
}
