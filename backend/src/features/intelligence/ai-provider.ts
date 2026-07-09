export interface EmailContent {
  subject: string;
  from: string;
  fromName?: string;
  body: string;
  date: Date;
}

export interface ExtractionResult {
  isHiringRelated: boolean;
  category: 'application_sent' | 'interview_invite' | 'interview_scheduled' | 'rejection' | 'offer' | 'follow_up' | 'application_viewed' | 'other';
  application: {
    companyName: string;
    companyDomain: string | null;
    companyDescription: string | null;
    jobTitle: string | null;
    jobDescription: string | null;
    jobLocation: string | null;
    jobSalaryMin: number | null;
    jobSalaryMax: number | null;
    jobSalaryCurrency: string | null;
    jobKeywords: string | null;
    jobUrl: string | null;
    status: 'saved' | 'applied' | 'screening' | 'interviewing' | 'offer' | 'rejected' | 'accepted' | 'declined';
    appliedAt: string | null;
    notes: string | null;
  };
  recruiter: {
    name: string | null;
    email: string | null;
    phone: string | null;
    linkedinUrl: string | null;
    notes: string | null;
  };
  interview: {
    isScheduled: boolean;
    date: string | null;
    type: string | null;
    duration: number | null;
    location: string | null;
    meetingUrl: string | null;
    round: string | null;
    status: string | null;
    feedback: string | null;
  } | null;
  offer: {
    salary: string | null;
    currency: string | null;
    deadline: string | null;
  } | null;
}

export interface AiProvider {
  classifyEmail(email: EmailContent): Promise<ExtractionResult>;
  extractEmail(email: EmailContent, context?: { companyName?: string; jobTitle?: string; category?: string }): Promise<ExtractionResult>;
}
