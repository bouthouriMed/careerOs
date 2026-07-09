import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../platform/prisma/prisma.service';

@Injectable()
export class RecruiterService {
  constructor(private prisma: PrismaService) {}

  async findByCompany(companyId: string) {
    return this.prisma.recruiter.findMany({
      where: { companyId },
      orderBy: { name: 'asc' },
    });
  }

  async findById(id: string) {
    return this.prisma.recruiter.findUnique({ where: { id }, include: { company: true } });
  }

  async findOrCreate(
    companyId: string,
    name: string,
    email?: string | null,
    phone?: string | null,
    linkedinUrl?: string | null,
    notes?: string | null,
  ) {
    if (email) {
      const existing = await this.prisma.recruiter.findFirst({ where: { email, companyId } });
      if (existing) {
        const updateData: Record<string, unknown> = {};
        if (phone && !existing.phone) updateData.phone = phone;
        if (linkedinUrl && !existing.linkedinUrl) updateData.linkedinUrl = linkedinUrl;
        if (notes && !existing.notes) updateData.notes = notes;
        if (Object.keys(updateData).length > 0) {
          return this.prisma.recruiter.update({ where: { id: existing.id }, data: updateData });
        }
        return existing;
      }
    }
    const existing = await this.prisma.recruiter.findFirst({
      where: { companyId, name: { equals: name, mode: 'insensitive' } },
    });
    if (existing) {
      const updateData: Record<string, unknown> = {};
      if (email && !existing.email) updateData.email = email;
      if (phone && !existing.phone) updateData.phone = phone;
      if (linkedinUrl && !existing.linkedinUrl) updateData.linkedinUrl = linkedinUrl;
      if (notes && !existing.notes) updateData.notes = notes;
      if (Object.keys(updateData).length > 0) {
        return this.prisma.recruiter.update({ where: { id: existing.id }, data: updateData });
      }
      return existing;
    }
    return this.prisma.recruiter.create({
      data: { companyId, name, email: email || null, phone: phone || null, linkedinUrl: linkedinUrl || null, notes: notes || null },
    });
  }
}
