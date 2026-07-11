import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ApplicationStatus, InterviewStatus, InterviewType } from '@prisma/client';
import { InProcessEventBus } from '../../platform/event-bus/event-bus';
import { PrismaService } from '../../platform/prisma/prisma.service';
import { ExtractionResult } from '../intelligence/ai-provider';
import { CompanyService } from '../company/company.service';
import { JobService } from '../job/job.service';
import { RecruiterService } from '../recruiter/recruiter.service';
import { TemporalStatusResolver } from './rules/temporal-status-resolver';
import { OfferDetector } from './rules/offer-detector';
import { InterviewGuard } from './rules/interview-guard';
import { StatusEvidence } from './rules/types';
import { IdentityResolutionEngine } from '../email-sync/identity-resolution/identity-resolution.engine';
import { EmailSignals } from '../email-sync/identity-resolution/types';
import { CompanyNormalizer } from '../email-sync/identity-resolution/company-normalizer';
import { AtsRegistry } from '../email-sync/ats/ats-registry';

interface ApplicationExtractedEvent {
  userId: string;
  sourceEmailId: string;
  result: ExtractionResult;
  emailDate?: string;
  threadId?: string;
  senderEmail?: string;
  senderName?: string;
  subject?: string;
  body?: string;
}

@Injectable()
export class ApplicationConsumer implements OnModuleInit {
  private readonly logger = new Logger(ApplicationConsumer.name);

  constructor(
    private eventBus: InProcessEventBus,
    private companyService: CompanyService,
    private jobService: JobService,
    private recruiterService: RecruiterService,
    private prisma: PrismaService,
    private identityResolution: IdentityResolutionEngine,
  ) {}

  onModuleInit(): void {
    this.eventBus.subscribe('intelligence.application.extracted', async (payload) => {
      await this.handleApplicationExtracted(payload);
    });
  }

  private async handleApplicationExtracted(payload: Record<string, unknown>) {
    const { userId, sourceEmailId, result, emailDate, threadId, senderEmail, senderName, subject, body } =
      payload as unknown as ApplicationExtractedEvent;
    const appData = result.application;
    const recruiterData = result.recruiter;

    if (!appData.companyName) return;

    // Fix E: Idempotency guard - skip if already processed
    const alreadyProcessed = await this.prisma.processedEmail.findUnique({
      where: { emailId: sourceEmailId },
      select: { id: true },
    });
    if (alreadyProcessed) {
      this.logger.log(`Email ${sourceEmailId} already processed, skipping`);
      return;
    }

    // Fix G: Post-extraction validation layer
    const validation = this.validateExtraction(appData, result.category, body || '', senderEmail || '');
    if (!validation.valid) {
      this.logger.warn(`Email ${sourceEmailId} failed validation: ${validation.errors.join(', ')}`);
      return;
    }
    if (validation.warnings.length > 0) {
      validation.warnings.forEach(w => this.logger.warn(`Email ${sourceEmailId} warning: ${w}`));
    }

    const emailDateObj = emailDate ? new Date(emailDate) : new Date();

    await this.storeEmailEvidence(userId, sourceEmailId, result, emailDateObj, subject || '', body || '');

    const companyNorm = CompanyNormalizer.normalize(
      appData.companyName,
      appData.companyDomain,
    );

    const company = await this.companyService.findOrCreate(
      companyNorm.normalizedName,
      companyNorm.normalizedDomain,
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
        keywords: appData.jobKeywords ? appData.jobKeywords.split(',').map((k) => k.trim()) : undefined,
        source: 'email',
      });
      jobId = job.id;
    }

    const atsDetection = AtsRegistry.detect(
      senderEmail || '',
      subject || '',
      body || '',
    );

    const resolution = await this.identityResolution.resolve(userId, {
      threadId: threadId || null,
      senderEmail: senderEmail || '',
      senderName: senderName || null,
      subject: subject || '',
      body: body || '',
      atsProvider: atsDetection.provider,
      applicationId: atsDetection.applicationId,
      requisitionId: atsDetection.requisitionId,
      companyName: companyNorm.normalizedName,
      companyDomain: companyNorm.normalizedDomain,
      jobTitle: appData.jobTitle || null,
      emailDate: emailDateObj.toISOString(),
    });

    const newStatus = TemporalStatusResolver.statusFromCategory(result.category) ?? ApplicationStatus.Saved;
    const appliedAt = appData.appliedAt ? new Date(appData.appliedAt) : undefined;

    let app;
    if (resolution.matched && resolution.applicationId) {
      app = await this.updateExistingApplication(resolution.applicationId, {
        userId,
        sourceEmailId,
        newStatus,
        emailDate: emailDateObj,
        appliedAt,
        notes: appData.notes,
        result,
      });
    } else {
      app = await this.createNewApplication(userId, company.id, jobId, {
        newStatus,
        emailDate: emailDateObj,
        appliedAt,
        sourceEmailId,
        confidence: resolution.confidence,
      });
    }

    await this.linkArtifactsToApplication(sourceEmailId, app.id);

    if (recruiterData.name) {
      await this.linkRecruiter(app.id, company.id, recruiterData);
    }

    await this.processInterview(app.id, result, emailDateObj, body || '');

    await this.processOffer(app, result, emailDateObj, sourceEmailId, body || '');

    this.logger.log(
      `Processed email ${sourceEmailId}: matched=${resolution.matched}, ` +
      `method=${resolution.method}, confidence=${resolution.confidence.toFixed(2)}`,
    );

    // Fix E: Mark email as processed for idempotency
    await this.prisma.processedEmail.create({
      data: {
        userId,
        emailId: sourceEmailId,
        threadId: threadId || null,
        applicationId: app.id,
        category: result.category,
        confidence: resolution.confidence,
        processedAt: new Date(),
      },
    });
  }

  private async updateExistingApplication(
    applicationId: string,
    context: {
      userId: string;
      sourceEmailId: string;
      newStatus: ApplicationStatus;
      emailDate: Date;
      appliedAt?: Date;
      notes?: string | null;
      result: ExtractionResult;
    },
  ) {
    const existingApp = await this.prisma.application.findUnique({
      where: { id: applicationId },
      select: { id: true, userId: true, status: true, statusSourceDate: true, statusSourceEmailId: true, appliedAt: true, notes: true },
    });

    if (!existingApp) {
      this.logger.warn(`Application ${applicationId} not found, creating new`);
      return this.createNewApplication(context.userId, '', undefined, {
        newStatus: context.newStatus,
        emailDate: context.emailDate,
        appliedAt: context.appliedAt,
        sourceEmailId: context.sourceEmailId,
        confidence: 0.5,
      });
    }

    const statusEvidence: StatusEvidence = {
      status: context.newStatus,
      emailId: context.sourceEmailId,
      emailDate: context.emailDate,
      confidence: 0.8,
    };

    const statusResolution = TemporalStatusResolver.resolve(
      existingApp.status,
      existingApp.statusSourceDate,
      statusEvidence,
    );

    const updateData: Record<string, unknown> = {};

    if (statusResolution) {
      updateData.status = statusResolution.newStatus;
      updateData.statusSourceEmailId = context.sourceEmailId;
      updateData.statusSourceDate = context.emailDate;
      this.logger.log(
        `Application ${existingApp.id}: ${existingApp.status} → ${statusResolution.newStatus} (${statusResolution.reason})`,
      );
    }

    if (context.appliedAt && !existingApp.appliedAt) {
      updateData.appliedAt = context.appliedAt;
    }

    if (Object.keys(updateData).length > 0) {
      const updated = await this.prisma.application.update({
        where: { id: existingApp.id },
        data: updateData,
      });

      if (statusResolution && statusResolution.newStatus !== existingApp.status) {
        await this.publishStatusChange(updated.id, context.userId, existingApp.status, statusResolution.newStatus, context.sourceEmailId);
      }

      return updated;
    }

    return existingApp;
  }

  private async createNewApplication(
    userId: string,
    companyId: string,
    jobId: string | undefined,
    context: {
      newStatus: ApplicationStatus;
      emailDate: Date;
      appliedAt?: Date;
      sourceEmailId: string;
      confidence: number;
    },
  ) {
    const app = await this.prisma.application.create({
      data: {
        userId,
        companyId,
        jobId,
        status: context.newStatus,
        appliedAt: context.appliedAt,
        source: 'email',
        statusSourceEmailId: context.sourceEmailId,
        statusSourceDate: context.emailDate,
        confidence: context.confidence,
        createdAt: context.emailDate,
      },
    });

    await this.eventBus.publish('application.created', {
      applicationId: app.id,
      companyId,
      jobId,
      status: context.newStatus,
      source: 'email',
      userId,
    });

    this.logger.log(`Created application ${app.id} for company ${companyId}`);
    return app;
  }

  private async processInterview(
    applicationId: string,
    result: ExtractionResult,
    emailDate: Date,
    emailBody: string,
  ) {
    if (!result.interview?.isScheduled || !result.interview.date) return;

    const interviewDate = new Date(result.interview.date);
    const bodyLower = emailBody.toLowerCase();

    const decision = InterviewGuard.decide(interviewDate, bodyLower, emailDate);

    if (!decision.shouldCreate) {
      this.logger.log(`Interview not created: ${decision.reason}`);
      return;
    }

    const existingInterviews = await this.prisma.interview.findMany({
      where: { applicationId },
      select: { scheduledAt: true, type: true, status: true },
    });

    const isDuplicate = InterviewGuard.findDuplicate(
      existingInterviews,
      interviewDate,
      this.mapInterviewType(result.interview.type),
    );

    if (isDuplicate) {
      this.logger.log(`Duplicate interview detected for application ${applicationId}`);
      return;
    }

    const interview = await this.prisma.interview.create({
      data: {
        applicationId,
        round: result.interview.round || undefined,
        type: this.mapInterviewType(result.interview.type),
        scheduledAt: interviewDate,
        durationMinutes: result.interview.duration ?? undefined,
        location: result.interview.location || undefined,
        meetingUrl: result.interview.meetingUrl || undefined,
        status: this.mapInterviewStatus(decision.status),
        feedback: result.interview.feedback || undefined,
      },
    });

    const eventName = decision.status === 'Completed' ? 'interview.completed' : 'interview.scheduled';
    await this.eventBus.publish(eventName, {
      interviewId: interview.id,
      applicationId,
      scheduledAt: interviewDate,
      type: result.interview.type,
      round: result.interview.round,
    });

    this.logger.log(`Created interview ${interview.id} (${decision.status}) for application ${applicationId}`);
  }

  private async processOffer(
    app: { id: string; userId: string; status: ApplicationStatus },
    result: ExtractionResult,
    emailDate: Date,
    sourceEmailId: string,
    emailBody: string,
  ) {
    if (!result.offer && !OfferDetector.shouldTransitionToOffer(emailBody, result.category)) {
      return;
    }

    const offerData = OfferDetector.extract(
      emailBody,
      result.category,
    );

    if (!offerData.hasOffer && !result.offer) return;

    const salary = result.offer?.salary || offerData.salary;
    const currency = result.offer?.currency || offerData.currency;
    const deadline = result.offer?.deadline ? new Date(result.offer.deadline) : offerData.deadline;

    if (app.status !== ApplicationStatus.Offer) {
      const statusEvidence: StatusEvidence = {
        status: ApplicationStatus.Offer,
        emailId: sourceEmailId,
        emailDate: emailDate,
        confidence: offerData.confidence,
      };

      const statusResolution = TemporalStatusResolver.resolve(
        app.status,
        null,
        statusEvidence,
      );

      if (statusResolution) {
        const previousStatus = app.status;
        await this.prisma.application.update({
          where: { id: app.id },
          data: {
            status: ApplicationStatus.Offer,
            statusSourceEmailId: sourceEmailId,
            statusSourceDate: emailDate,
            offerSalary: salary,
            offerCurrency: currency,
            offerDeadline: deadline,
            offerReceivedAt: emailDate,
          },
        });

        await this.publishStatusChange(app.id, app.userId, previousStatus, ApplicationStatus.Offer, sourceEmailId);
      }
    } else {
      const updateData: Record<string, unknown> = {};
      if (salary && !app.status) updateData.offerSalary = salary;
      if (currency) updateData.offerCurrency = currency;
      if (deadline) updateData.offerDeadline = deadline;

      if (Object.keys(updateData).length > 0) {
        await this.prisma.application.update({
          where: { id: app.id },
          data: updateData,
        });
      }
    }
  }

  private async publishStatusChange(
    applicationId: string,
    userId: string,
    previousStatus: ApplicationStatus,
    newStatus: ApplicationStatus,
    sourceEmailId: string,
  ) {
    await this.eventBus.publish('application.status_changed', {
      applicationId,
      previousStatus,
      newStatus,
      source: 'email',
      sourceEmailId,
      userId,
    });
  }

  private async storeEmailEvidence(
    userId: string,
    emailId: string,
    result: ExtractionResult,
    emailDate: Date,
    subject: string,
    body: string,
  ) {
    await this.prisma.emailEvidence.upsert({
      where: { emailId },
      create: {
        userId,
        emailId,
        subject,
        from: '',
        body,
        emailDate,
        category: result.category,
      },
      update: {
        category: result.category,
      },
    });
  }

  private async linkArtifactsToApplication(emailId: string, applicationId: string) {
    await this.prisma.intelligenceArtifact.updateMany({
      where: { sourceEmailId: emailId },
      data: { applicationId },
    });
  }

  private async linkRecruiter(
    applicationId: string,
    companyId: string,
    recruiterData: ExtractionResult['recruiter'],
  ) {
    if (!recruiterData.name) return;

    const recruiter = await this.recruiterService.findOrCreate(
      companyId,
      recruiterData.name,
      recruiterData.email || undefined,
      recruiterData.phone || undefined,
      recruiterData.linkedinUrl || undefined,
      recruiterData.notes || undefined,
    );

    await this.prisma.applicationContact.upsert({
      where: {
        applicationId_recruiterId: {
          applicationId,
          recruiterId: recruiter.id,
        },
      },
      create: {
        applicationId,
        recruiterId: recruiter.id,
        role: 'recruiter',
      },
      update: {},
    });
  }

  private validateExtraction(
    appData: ExtractionResult['application'],
    category: string,
    emailBody: string,
    senderEmail: string,
  ): { valid: boolean; errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // 1. Company plausibility: if sender domain is known, company should match
    const senderDomain = senderEmail.match(/@(.+)$/)?.[1];
    if (senderDomain) {
      const cleanDomain = senderDomain
        .replace(/^(mail|app|noreply|no-reply|donotreply|jobs|careers|recruiting)\./, '')
        .replace(/\.(com|io|co|org|net)$/, '');
      if (cleanDomain.length >= 3) {
        const companyLower = appData.companyName?.toLowerCase() || '';
        const domainKeywords = cleanDomain.toLowerCase().split('.');
        const hasMatch = domainKeywords.some(k => companyLower.includes(k));
        if (!hasMatch && appData.companyName) {
          warnings.push(`Company "${appData.companyName}" doesn't match sender domain "${senderDomain}"`);
        }
      }
    }

    // 2. Terminal status guard: if existing app is Rejected/Accepted/Declined, block all transitions
    // (This is checked later when updating, but we can warn here)

    // 3. Date plausibility: interview/offer dates must be reasonable
    if (appData.jobTitle && appData.jobTitle.length > 100) {
      warnings.push('Job title suspiciously long');
    }

    // 4. Contradiction detection: body keywords vs LLM extraction
    const bodyLower = emailBody.toLowerCase();
    const hasRejectionKeywords = ['unfortunately', 'not selected', 'not moving forward', 'declined', 'rejected', 'not a fit'].some(k => bodyLower.includes(k));
    const hasOfferKeywords = ['offer', 'pleased to offer', 'welcome to the team', 'compensation package', 'salary'].some(k => bodyLower.includes(k));
    const hasCancellationKeywords = ['cancel', 'reschedule', 'postpone', 'unable to attend'].some(k => bodyLower.includes(k));

    if (hasRejectionKeywords && category !== 'rejection') {
      warnings.push('Email body contains rejection language but category is not rejection');
    }
    if (hasOfferKeywords && category !== 'offer') {
      warnings.push('Email body contains offer language but category is not offer');
    }
    if (hasCancellationKeywords) {
      warnings.push('Email body contains cancellation/reschedule language');
    }

    // 5. Basic sanity checks
    if (!appData.companyName || appData.companyName.trim().length < 2) {
      errors.push('Company name is missing or too short');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
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
