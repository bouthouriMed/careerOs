import { ApplicationEntityData } from '../domain/application.entity';

export interface FindAllFilters {
  status?: string;
  source?: string;
  limit?: number;
  offset?: number;
}

export interface ApplicationRepositoryInterface {
  create(data: ApplicationEntityData): Promise<ApplicationEntityData>;
  findById(id: string): Promise<ApplicationEntityData | null>;
  findByUserId(userId: string, filters?: FindAllFilters): Promise<{ applications: ApplicationEntityData[]; total: number }>;
  updateStatus(id: string, status: string): Promise<ApplicationEntityData>;
  update(id: string, data: Partial<ApplicationEntityData>): Promise<ApplicationEntityData>;
}
