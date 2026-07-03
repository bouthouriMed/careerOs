import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SessionRepositoryInterface, SessionRecord } from './session.repository.interface';

@Injectable()
export class SessionRepository implements SessionRepositoryInterface {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, expiresAt: Date): Promise<SessionRecord> {
    return this.prisma.session.create({
      data: { userId, expiresAt },
    });
  }

  async findById(id: string): Promise<SessionRecord | null> {
    return this.prisma.session.findUnique({ where: { id } });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.session.delete({ where: { id } });
  }

  async deleteExpired(): Promise<void> {
    await this.prisma.session.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });
  }
}
