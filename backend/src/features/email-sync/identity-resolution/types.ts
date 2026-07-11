export interface CompanyNormalizationResult {
  normalizedName: string;
  normalizedDomain: string | null;
  aliases: string[];
  isKnownCompany: boolean;
  mergedCompanyId: string | null;
}

export interface CompanyAlias {
  alias: string;
  canonicalName: string;
  domain: string | null;
}

export interface ResolutionSignal {
  type: 'thread_id' | 'recruiter_email' | 'ats_provider' | 'requisition_id' | 'company_domain' | 'job_title' | 'sender_reputation' | 'historical_relationship' | 'same_company_same_week' | 'temporal_proximity';
  value: string;
  weight: number;
}

export interface ApplicationCandidate {
  applicationId: string;
  companyId: string;
  companyName: string;
  jobId: string | null;
  jobTitle: string | null;
  companyDomain: string | null;
  recruiterEmail: string | null;
  atsProvider: string | null;
  requisitionId: string | null;
  threadIds: string[];
  totalConfidence: number;
}

export interface ResolutionResult {
  matched: boolean;
  applicationId: string | null;
  confidence: number;
  signals: ResolutionSignal[];
  method: 'exact_match' | 'high_confidence' | 'ambiguous' | 'no_match';
  candidateCount: number;
}

export interface EmailSignals {
  threadId: string | null;
  senderEmail: string;
  senderName: string | null;
  subject: string;
  body: string;
  atsProvider: string | null;
  applicationId: string | null;
  requisitionId: string | null;
  companyName: string | null;
  companyDomain: string | null;
  jobTitle: string | null;
  emailDate: string | null;
}
