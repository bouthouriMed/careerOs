import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../platform/prisma/prisma.service';

@Injectable()
export class JobService {
  constructor(private prisma: PrismaService) {}

  async findByCompany(companyId: string) {
    return this.prisma.job.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    return this.prisma.job.findUnique({ where: { id }, include: { company: true } });
  }

  async findOrCreate(
    companyId: string,
    title: string,
    data?: {
      description?: string;
      location?: string;
      url?: string;
      salaryMin?: number;
      salaryMax?: number;
      currency?: string;
      keywords?: string[];
      source?: string;
    },
  ) {
    const existing = await this.prisma.job.findFirst({
      where: { companyId, title: { equals: title, mode: 'insensitive' } },
    });
    if (existing) {
      const updateData: Record<string, unknown> = {};
      if (data?.description && !existing.description) updateData.description = data.description;
      if (data?.location && !existing.location) updateData.location = data.location;
      if (data?.salaryMin !== undefined && existing.salaryMin === null) updateData.salaryMin = data.salaryMin;
      if (data?.salaryMax !== undefined && existing.salaryMax === null) updateData.salaryMax = data.salaryMax;
      if (data?.currency && !existing.currency) updateData.currency = data.currency;
      if (data?.keywords && existing.keywords.length === 0) updateData.keywords = data.keywords;
      if (data?.url && !existing.url) updateData.url = data.url;
      if (Object.keys(updateData).length > 0) {
        return this.prisma.job.update({ where: { id: existing.id }, data: updateData });
      }
      return existing;
    }
    return this.prisma.job.create({
      data: { companyId, title, ...data, keywords: data?.keywords || [] },
    });
  }
}
