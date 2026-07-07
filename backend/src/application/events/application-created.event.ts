export class ApplicationCreatedEvent {
  constructor(
    public readonly applicationId: string,
    public readonly userId: string,
    public readonly jobId: string | null,
    public readonly source: string,
    public readonly timestamp: Date = new Date(),
  ) {}
}
