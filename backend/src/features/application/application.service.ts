import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../platform/prisma/prisma.service';
import { ApplicationStatus } from '@prisma/client';

@Injectable()
export class ApplicationService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string, status?: ApplicationStatus) {
    const where: Record<string, unknown> = { userId };
    if (status) where.status = status;
    return this.prisma.application.findMany({
      where,
      include: {
        company: { select: { id: true, name: true, domain: true, logoUrl: true } },
        job: { select: { id: true, title: true, location: true } },
        contacts: {
          include: { recruiter: { select: { id: true, name: true, email: true } } },
          take: 1,
        },
        interviews: {
          select: { id: true, scheduledAt: true, type: true, status: true },
          orderBy: { scheduledAt: 'desc' },
          take: 5,
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async getTimeline(userId: string) {
    const apps = await this.prisma.application.findMany({
      where: { userId },
      include: {
        company: { select: { id: true, name: true, domain: true, logoUrl: true } },
        job: { select: { id: true, title: true } },
        contacts: {
          include: { recruiter: { select: { id: true, name: true, email: true } } },
          take: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const grouped = new Map<string, typeof apps>();
    for (const app of apps) {
      const date = app.createdAt.toISOString().split('T')[0];
      const existing = grouped.get(date) || [];
      existing.push(app);
      grouped.set(date, existing);
    }

    return Array.from(grouped.entries()).map(([date, applications]) => ({
      date,
      applications: applications.map(a => ({
        id: a.id,
        status: a.status,
        companyName: a.company.name,
        companyDomain: a.company.domain,
        companyLogo: a.company.logoUrl,
        jobTitle: a.job?.title ?? null,
        createdAt: a.createdAt.toISOString(),
        recruiter: a.contacts[0]?.recruiter ?? null,
      })),
    }));
  }

  async findById(id: string, userId: string) {
    return this.prisma.application.findFirst({
      where: { id, userId },
      include: {
        company: true,
        job: true,
        contacts: { include: { recruiter: { include: { company: true } } } },
        interviews: { orderBy: { scheduledAt: 'desc' } },
        artifacts: { orderBy: { createdAt: 'desc' }, take: 5 },
      },
    });
  }

  async updateStatus(id: string, userId: string, status: ApplicationStatus) {
    return this.prisma.application.updateMany({
      where: { id, userId },
      data: { status },
    });
  }

  async create(data: {
    userId: string;
    companyId: string;
    jobId?: string;
    status?: ApplicationStatus;
    appliedAt?: Date;
    source?: string;
  }) {
    return this.prisma.application.create({
      data: {
        userId: data.userId,
        companyId: data.companyId,
        jobId: data.jobId,
        status: data.status ?? ApplicationStatus.Saved,
        appliedAt: data.appliedAt,
        source: data.source,
      },
    });
  }
}
