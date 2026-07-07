import { ApplicationStatus, isValidTransition, parseStatus } from './application-status';

export interface ApplicationEntityData {
  id: string;
  userId: string;
  jobId: string | null;
  status: string;
  source: string;
  notes: string | null;
  appliedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  job?: { title: string; company: { name: string } } | null;
}

export class ApplicationEntity {
  private constructor(
    public readonly id: string,
    public readonly userId: string,
    public jobId: string | null,
    private _status: ApplicationStatus,
    public readonly source: string,
    public notes: string | null,
    public appliedAt: Date | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public jobTitle: string | null,
    public companyName: string | null,
  ) {}

  static fromPersistence(data: ApplicationEntityData): ApplicationEntity {
    return new ApplicationEntity(
      data.id,
      data.userId,
      data.jobId,
      parseStatus(data.status),
      data.source,
      data.notes,
      data.appliedAt,
      data.createdAt,
      data.updatedAt,
      data.job?.title ?? null,
      data.job?.company.name ?? null,
    );
  }

  get status(): string {
    return this._status;
  }

  transitionTo(newStatus: ApplicationStatus): void {
    if (!isValidTransition(this._status, newStatus)) {
      throw new Error(
        `Invalid status transition from ${this._status} to ${newStatus}`,
      );
    }
    this._status = newStatus;
  }
}
