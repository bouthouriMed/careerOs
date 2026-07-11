import { ApplicationStatus } from '@prisma/client';

export interface StatusEvidence {
  status: ApplicationStatus;
  emailId: string;
  emailDate: Date;
  confidence: number;
}

export interface StatusResolution {
  newStatus: ApplicationStatus;
  confidence: number;
  reason: string;
  evidence: StatusEvidence;
}

export interface OfferExtraction {
  hasOffer: boolean;
  salary: string | null;
  currency: string | null;
  deadline: Date | null;
  confidence: number;
  reason: string;
}

export interface InterviewDecision {
  shouldCreate: boolean;
  status: 'Scheduled' | 'Completed' | 'Cancelled';
  reason: string;
  confidence: number;
}
