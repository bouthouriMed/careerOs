import { Injectable, OnModuleInit } from '@nestjs/common';
import { InProcessEventBus } from '../../platform/event-bus/event-bus';
import { ApplicationService } from './application.service';
import { CompanyService } from '../company/company.service';
import { JobService } from '../job/job.service';
import { RecruiterService } from '../recruiter/recruiter.service';
import { PrismaService } from '../../platform/prisma/prisma.service';
import { ApplicationStatus, InterviewStatus, InterviewType } from '@prisma/client';
import { ExtractionResult } from '../intelligence/ai-provider';

interface ApplicationExtractedEvent {
  userId: string;
  sourceEmailId: string;
  result: ExtractionResult;
  emailDate?: string;
}

const STATUS_ORDER: Record<string, number> = {
  rejected: 5,
  offer: 4,
  interviewing: 3,
  screening: 2,
  applied: 1,
  saved: 0,
  accepted: 6,
  declined: 5,
  closed: 5,
};

@Injectable()
export class ApplicationConsumer implements OnModuleInit {
  constructor(
    private eventBus: InProcessEventBus,
    private applicationService: ApplicationService,
    private companyService: CompanyService,
    private jobService: JobService,
    private recruiterService: RecruiterService,
    private prisma: PrismaService,
  ) {}

  onModuleInit(): void {
    this.eventBus.subscribe('intelligence.application.extracted', async (payload) => {
      await this.handleApplicationExtracted(payload);
    });
  }

  private async handleApplicationExtracted(payload: Record<string, unknown>) {
    const { userId, sourceEmailId, result, emailDate } = payload as unknown as ApplicationExtractedEvent;
    const appData = result.application;
    const recruiterData = result.recruiter;

    if (!appData.companyName) return;

    const company = await this.companyService.findOrCreate(
      appData.companyName,
      appData.companyDomain,
      appData.companyDescription || undefined,
    );

    let jobId: string | undefined;
    if (appData.jobTitle) {
      const job = await this.jobService.findOrCreate(company.id, appData.jobTitle, {
        description: appData.jobDescription || undefined,
        location: appData.jobLocation || undefined,
        url: appData.jobUrl || undefined,
        salaryMin: appData.jobSalaryMin ?? undefined,
        salaryMax: appData.jobSalaryMax ?? undefined,
        currency: appData.jobSalaryCurrency || undefined,
        keywords: appData.jobKeywords ? appData.jobKeywords.split(',').map(k => k.trim()) : undefined,
        source: 'email',
      });
      jobId = job.id;
    }

    const newStatus = this.mapStatus(appData.status);
    const appliedAt = appData.appliedAt ? new Date(appData.appliedAt) : undefined;
    const emailCreatedAt = emailDate ? new Date(emailDate) : undefined;

    const existingApp = await this.findExistingApplication(userId, company.id, jobId);

    let app;
    if (existingApp) {
      const currentStatusRank = STATUS_ORDER[existingApp.status.toLowerCase()] ?? 0;
      const newStatusRank = STATUS_ORDER[newStatus.toLowerCase()] ?? 0;
      const shouldUpgrade = newStatusRank >= currentStatusRank;

      app = await this.prisma.application.update({
        where: { id: existingApp.id },
        data: {
          ...(shouldUpgrade ? { status: newStatus } : {}),
          appliedAt: appliedAt || existingApp.appliedAt,
          notes: appData.notes || existingApp.notes,
        },
      });
    } else {
      app = await this.prisma.application.create({
        data: {
          userId,
          companyId: company.id,
          jobId,
          status: newStatus,
          appliedAt,
          source: 'email',
          ...(emailCreatedAt ? { createdAt: emailCreatedAt } : {}),
        },
      });
    }

    await this.prisma.intelligenceArtifact.updateMany({
      where: { sourceEmailId },
      data: { applicationId: app.id },
    });

    if (recruiterData.name) {
      const recruiter = await this.recruiterService.findOrCreate(
        company.id,
        recruiterData.name,
        recruiterData.email || undefined,
        recruiterData.phone || undefined,
        recruiterData.linkedinUrl || undefined,
        recruiterData.notes || undefined,
      );
      await this.prisma.applicationContact.create({
        data: {
          applicationId: app.id,
          recruiterId: recruiter.id,
          role: 'recruiter',
        },
      }).catch(() => {});
    }

    if (result.interview?.isScheduled && result.interview.date) {
      const interviewDate = new Date(result.interview.date);
      const existingInterview = await this.prisma.interview.findFirst({
        where: { applicationId: app.id, scheduledAt: interviewDate },
      });
      if (!existingInterview) {
        await this.prisma.interview.create({
          data: {
            applicationId: app.id,
            round: result.interview.round || undefined,
            type: this.mapInterviewType(result.interview.type),
            scheduledAt: interviewDate,
            durationMinutes: result.interview.duration ?? undefined,
            location: result.interview.location || undefined,
            meetingUrl: result.interview.meetingUrl || undefined,
            status: this.mapInterviewStatus(result.interview.status),
            feedback: result.interview.feedback || undefined,
          },
        });
      }
    }

    if (result.offer && result.offer.salary) {
      const existingNotes = app.notes || '';
      const offerNote = `Offer: ${result.offer.salary}${result.offer.currency ? ' ' + result.offer.currency : ''}${result.offer.deadline ? ', deadline: ' + result.offer.deadline : ''}`;
      if (!existingNotes.includes(offerNote)) {
        await this.prisma.application.update({
          where: { id: app.id },
          data: { notes: existingNotes ? `${existingNotes}\n${offerNote}` : offerNote },
        });
      }
    }
  }

  private async findExistingApplication(userId: string, companyId: string, jobId?: string) {
    if (jobId) {
      return await this.prisma.application.findFirst({
        where: { userId, companyId, jobId },
        orderBy: { createdAt: 'desc' },
      });
    }

    return await this.prisma.application.findFirst({
      where: { userId, companyId },
      orderBy: { createdAt: 'desc' },
    });
  }

  private mapStatus(status?: string): ApplicationStatus {
    switch (status?.toLowerCase()) {
      case 'applied': return ApplicationStatus.Applied;
      case 'screening': return ApplicationStatus.Screening;
      case 'interviewing': return ApplicationStatus.Interviewing;
      case 'offer': return ApplicationStatus.Offer;
      case 'accepted': return ApplicationStatus.Accepted;
      case 'declined': return ApplicationStatus.Declined;
      case 'rejected': return ApplicationStatus.Rejected;
      case 'closed': return ApplicationStatus.Closed;
      default: return ApplicationStatus.Saved;
    }
  }

  private mapInterviewType(type?: string | null): InterviewType {
    switch (type?.toLowerCase()) {
      case 'phone': return InterviewType.Phone;
      case 'video': return InterviewType.Video;
      case 'onsite': return InterviewType.Onsite;
      case 'technical': return InterviewType.Technical;
      case 'takehome': return InterviewType.TakeHome;
      case 'final': return InterviewType.Final;
      default: return InterviewType.Video;
    }
  }

  private mapInterviewStatus(status?: string | null): InterviewStatus {
    switch (status?.toLowerCase()) {
      case 'completed': return InterviewStatus.Completed;
      case 'cancelled': return InterviewStatus.Cancelled;
      case 'feedbackreceived': return InterviewStatus.FeedbackReceived;
      default: return InterviewStatus.Scheduled;
    }
  }
}
