import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../platform/prisma/prisma.service';
import { InterviewStatus, InterviewType } from '@prisma/client';

@Injectable()
export class InterviewService {
  constructor(private prisma: PrismaService) {}

  async findByApplication(applicationId: string) {
    return this.prisma.interview.findMany({
      where: { applicationId },
      orderBy: { scheduledAt: 'asc' },
    });
  }

  async create(data: {
    applicationId: string;
    type: InterviewType;
    scheduledAt: string;
    durationMinutes?: number;
    location?: string;
    meetingUrl?: string;
    round?: string;
  }) {
    return this.prisma.interview.create({
      data: {
        applicationId: data.applicationId,
        type: data.type,
        scheduledAt: new Date(data.scheduledAt),
        durationMinutes: data.durationMinutes,
        location: data.location,
        meetingUrl: data.meetingUrl,
        round: data.round,
      },
    });
  }

  async updateStatus(id: string, status: InterviewStatus) {
    const interview = await this.prisma.interview.findUnique({ where: { id } });
    if (!interview) throw new NotFoundException('Interview not found');
    return this.prisma.interview.update({ where: { id }, data: { status } });
  }
}
