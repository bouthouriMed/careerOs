export interface SessionRecord {
  id: string;
  userId: string;
  expiresAt: Date;
  createdAt: Date;
  refreshedAt: Date | null;
}

export interface SessionRepositoryInterface {
  create(userId: string, expiresAt: Date): Promise<SessionRecord>;
  findById(id: string): Promise<SessionRecord | null>;
  delete(id: string): Promise<void>;
  deleteExpired(): Promise<void>;
}
