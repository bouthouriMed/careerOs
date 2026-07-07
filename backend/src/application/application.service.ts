import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { v4 as uuid } from 'uuid';
import { PrismaService } from '../platform/prisma/prisma.service';
import { ApplicationRepository } from './persistence/application.repository';
import { ApplicationEntity } from './domain/application.entity';
import { ApplicationStatus, parseStatus } from './domain/application-status';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationStatusDto } from './dto/update-application-status.dto';
import { ApplicationCreatedEvent } from './events/application-created.event';
import { ApplicationStatusChangedEvent } from './events/application-status-changed.event';

@Injectable()
export class ApplicationService {
  constructor(
    private readonly repository: ApplicationRepository,
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(dto: CreateApplicationDto, userId: string) {
    let jobId = dto.jobId ?? null;

    if (dto.companyName && !jobId) {
      const company = await this.findOrCreateCompany(dto.companyName, userId);

      if (dto.jobTitle) {
        const job = await this.findOrCreateJob(dto.jobTitle, company.id, userId);
        jobId = job.id;
      }
    }

    const now = new Date();
    const appData = {
      id: uuid(),
      userId,
      jobId,
      status: ApplicationStatus.Draft,
      source: dto.source ?? 'manual',
      notes: dto.notes ?? null,
      appliedAt: dto.appliedAt ? new Date(dto.appliedAt) : now,
      createdAt: now,
      updatedAt: now,
      job: null,
    };

    const persisted = await this.repository.create(appData);
    const entity = ApplicationEntity.fromPersistence(persisted);

    this.eventEmitter.emit(
      'application.created',
      new ApplicationCreatedEvent(entity.id, userId, entity.jobId, entity.source),
    );

    return this.toResponse(entity);
  }

  async updateStatus(id: string, dto: UpdateApplicationStatusDto, userId: string) {
    const persisted = await this.repository.findById(id);
    if (!persisted) {
      throw new NotFoundException('Application not found');
    }
    if (persisted.userId !== userId) {
      throw new NotFoundException('Application not found');
    }

    const entity = ApplicationEntity.fromPersistence(persisted);
    const previousStatus = entity.status;

    try {
      entity.transitionTo(parseStatus(dto.status));
    } catch {
      throw new BadRequestException(
        `Invalid status transition from ${previousStatus} to ${dto.status}`,
      );
    }

    const updated = await this.repository.updateStatus(id, dto.status);
    const updatedEntity = ApplicationEntity.fromPersistence(updated);

    this.eventEmitter.emit(
      'application.status-changed',
      new ApplicationStatusChangedEvent(id, userId, previousStatus, dto.status),
    );

    return this.toResponse(updatedEntity);
  }

  async findById(id: string, userId: string) {
    const persisted = await this.repository.findById(id);
    if (!persisted || persisted.userId !== userId) {
      throw new NotFoundException('Application not found');
    }
    return this.toResponse(ApplicationEntity.fromPersistence(persisted));
  }

  async findAll(userId: string, filters?: { status?: string; source?: string }) {
    const result = await this.repository.findByUserId(userId, filters);
    return {
      applications: result.applications.map((a) =>
        this.toResponse(ApplicationEntity.fromPersistence(a)),
      ),
      total: result.total,
    };
  }

  async getTimeline(userId: string) {
    const result = await this.repository.findByUserId(userId, { limit: 200 });
    const applications = result.applications.map((a) =>
      this.toResponse(ApplicationEntity.fromPersistence(a)),
    );

    const grouped: Record<string, typeof applications> = {};
    for (const app of applications) {
      const date = app.appliedAt
        ? new Date(app.appliedAt).toISOString().split('T')[0]
        : 'Unknown';
      if (!grouped[date]) grouped[date] = [];
      grouped[date].push(app);
    }

    const timeline = Object.entries(grouped)
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([date, apps]) => ({ date, applications: apps }));

    return { timeline };
  }

  private async findOrCreateCompany(name: string, userId: string) {
    const existing = await this.prisma.company.findUnique({
      where: { userId_name: { userId, name } },
    });
    if (existing) return existing;

    return this.prisma.company.create({
      data: { name, userId },
    });
  }

  private async findOrCreateJob(title: string, companyId: string, userId: string) {
    const existing = await this.prisma.job.findFirst({
      where: { title, companyId, userId },
    });
    if (existing) return existing;

    return this.prisma.job.create({
      data: { title, companyId, userId },
    });
  }

  private toResponse(entity: ApplicationEntity) {
    return {
      id: entity.id,
      status: entity.status,
      source: entity.source,
      jobId: entity.jobId ?? undefined,
      jobTitle: entity.jobTitle ?? undefined,
      companyName: entity.companyName ?? undefined,
      notes: entity.notes ?? undefined,
      appliedAt: entity.appliedAt?.toISOString() ?? undefined,
      createdAt: entity.createdAt.toISOString(),
      updatedAt: entity.updatedAt.toISOString(),
    };
  }
}
