import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../platform/prisma/prisma.service';
import { ApplicationEntityData } from '../domain/application.entity';
import { ApplicationRepositoryInterface, FindAllFilters } from './application.repository.interface';

@Injectable()
export class ApplicationRepository implements ApplicationRepositoryInterface {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: ApplicationEntityData): Promise<ApplicationEntityData> {
    return this.prisma.application.create({
      data: {
        id: data.id,
        userId: data.userId,
        jobId: data.jobId,
        status: data.status,
        source: data.source,
        notes: data.notes,
        appliedAt: data.appliedAt,
      },
      include: { job: { include: { company: true } } },
    }) as unknown as ApplicationEntityData;
  }

  async findById(id: string): Promise<ApplicationEntityData | null> {
    const app = await this.prisma.application.findUnique({
      where: { id },
      include: { job: { include: { company: true } } },
    });
    return app as unknown as ApplicationEntityData | null;
  }

  async findByUserId(
    userId: string,
    filters?: FindAllFilters,
  ): Promise<{ applications: ApplicationEntityData[]; total: number }> {
    const where: Record<string, unknown> = { userId };
    if (filters?.status) where.status = filters.status;
    if (filters?.source) where.source = filters.source;

    const [applications, total] = await Promise.all([
      this.prisma.application.findMany({
        where,
        include: { job: { include: { company: true } } },
        orderBy: { createdAt: 'desc' },
        take: filters?.limit ?? 50,
        skip: filters?.offset ?? 0,
      }),
      this.prisma.application.count({ where }),
    ]);

    return { applications: applications as unknown as ApplicationEntityData[], total };
  }

  async updateStatus(id: string, status: string): Promise<ApplicationEntityData> {
    const app = await this.prisma.application.update({
      where: { id },
      data: { status },
      include: { job: { include: { company: true } } },
    });
    return app as unknown as ApplicationEntityData;
  }

  async update(id: string, data: Partial<ApplicationEntityData>): Promise<ApplicationEntityData> {
    const app = await this.prisma.application.update({
      where: { id },
      data: {
        ...(data.jobId !== undefined && { jobId: data.jobId }),
        ...(data.notes !== undefined && { notes: data.notes }),
        ...(data.appliedAt !== undefined && { appliedAt: data.appliedAt }),
      },
      include: { job: { include: { company: true } } },
    });
    return app as unknown as ApplicationEntityData;
  }
}
