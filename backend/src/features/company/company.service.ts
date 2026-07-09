import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../platform/prisma/prisma.service';

@Injectable()
export class CompanyService {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<{ id: string; name: string; domain: string | null; logoUrl: string | null }[]> {
    return this.prisma.company.findMany({
      select: { id: true, name: true, domain: true, logoUrl: true },
      orderBy: { name: 'asc' },
    });
  }

  async findById(id: string) {
    return this.prisma.company.findUnique({
      where: { id },
      include: { jobs: true, recruiters: true },
    });
  }

  async findOrCreate(name: string, domain?: string | null, description?: string) {
    if (domain) {
      const existing = await this.prisma.company.findFirst({ where: { domain } });
      if (existing) {
        if (description && !existing.description) {
          return this.prisma.company.update({
            where: { id: existing.id },
            data: { description },
          });
        }
        return existing;
      }
    }
    const existing = await this.prisma.company.findFirst({ where: { name: { equals: name, mode: 'insensitive' } } });
    if (existing) {
      if (description && !existing.description) {
        return this.prisma.company.update({
          where: { id: existing.id },
          data: { description },
        });
      }
      return existing;
    }
    return this.prisma.company.create({
      data: { name, domain: domain || null, description: description || null },
    });
  }
}
