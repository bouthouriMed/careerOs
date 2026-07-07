export class InitialSyncCompletedEvent {
  constructor(
    public readonly userId: string,
    public readonly emailsScanned: number,
    public readonly applicationsCreated: number,
    public readonly syncDurationMs: number,
    public readonly timestamp: Date = new Date(),
  ) {}
}
