export type SyncStatus = 'never_synced' | 'pending' | 'completed' | 'error';

export interface SyncStatusResponse {
  status: SyncStatus;
  emailsScanned: number;
  applicationsDetected: number;
  startedAt: string | null;
  completedAt: string | null;
  errorMessage?: string;
}

export interface StartSyncResponse {
  message: string;
  status: SyncStatus;
}
