import { AtsProviderConfig, AtsDetectionResult, AtsCategorySignal } from './ats-provider.interface';

const ATS_PROVIDERS: AtsProviderConfig[] = [
  {
    id: 'greenhouse',
    name: 'Greenhouse',
    domainPatterns: [/greenhouse\.io$/i, /greenhouse-mail\.io$/i],
    senderPatterns: [/greenhouse/i, /no-reply@.*\.greenhouse\.io$/i],
    subjectPatterns: [
      /application.*received/i,
      /interview.*scheduled/i,
      /offer.*letter/i,
      /rejection/i,
      /next steps/i,
      /update.*application/i,
    ],
    applicationIdPatterns: [/job_id[=:](\d+)/i, /gh_jid[=:](\d+)/i],
    requisitionIdPatterns: [/requisition[_\s]*(?:id|number|#)[=:](\S+)/i],
    categorySignals: {
      application_sent: 0.9,
      interview_invite: 0.85,
      interview_scheduled: 0.85,
      rejection: 0.9,
      offer: 0.9,
    },
  },
  {
    id: 'lever',
    name: 'Lever',
    domainPatterns: [/lever\.co$/i],
    senderPatterns: [/lever/i, /no-reply@.*\.lever\.co$/i],
    subjectPatterns: [
      /application.*update/i,
      /interview/i,
      /offer/i,
      /decided.*not/i,
      /moving forward/i,
    ],
    applicationIdPatterns: [/postings\/([a-zA-Z0-9]+)/i, /lever:\/\/([a-zA-Z0-9]+)/i],
    requisitionIdPatterns: [],
    categorySignals: {
      application_sent: 0.85,
      interview_invite: 0.8,
      interview_scheduled: 0.8,
      rejection: 0.85,
      offer: 0.85,
    },
  },
  {
    id: 'workable',
    name: 'Workable',
    domainPatterns: [/workable\.com$/i],
    senderPatterns: [/workable/i, /no-reply@.*\.workable\.com$/i],
    subjectPatterns: [
      /application.*submitted/i,
      /interview.*invitation/i,
      /position.*update/i,
    ],
    applicationIdPatterns: [/job\/([a-zA-Z0-9]+)/i],
    requisitionIdPatterns: [],
    categorySignals: {
      application_sent: 0.85,
      interview_invite: 0.8,
      interview_scheduled: 0.8,
      rejection: 0.85,
      offer: 0.85,
    },
  },
  {
    id: 'bamboohr',
    name: 'BambooHR',
    domainPatterns: [/bamboohr\.com$/i],
    senderPatterns: [/bamboohr/i],
    subjectPatterns: [
      /application/i,
      /interview/i,
      /offer/i,
    ],
    applicationIdPatterns: [/apptracking\/(\d+)/i],
    requisitionIdPatterns: [],
    categorySignals: {
      application_sent: 0.8,
      interview_invite: 0.75,
      interview_scheduled: 0.75,
      rejection: 0.8,
      offer: 0.8,
    },
  },
  {
    id: 'icims',
    name: 'iCIMS',
    domainPatterns: [/icims\.com$/i],
    senderPatterns: [/icims/i, /no-reply@.*\.icims\.com$/i],
    subjectPatterns: [
      /application.*received/i,
      /interview/i,
      /position.*update/i,
    ],
    applicationIdPatterns: [/icims\.com\/[^\s]*?\/(\d+)/i],
    requisitionIdPatterns: [/req(?:uisition)?[_\s]*[#:]?\s*(\S+)/i],
    categorySignals: {
      application_sent: 0.8,
      interview_invite: 0.75,
      interview_scheduled: 0.75,
      rejection: 0.8,
      offer: 0.8,
    },
  },
  {
    id: 'smartrecruiters',
    name: 'SmartRecruiters',
    domainPatterns: [/smartrecruiters\.com$/i],
    senderPatterns: [/smartrecruiters/i],
    subjectPatterns: [
      /application/i,
      /interview/i,
      /offer/i,
      /status.*update/i,
    ],
    applicationIdPatterns: [/job\/(\d+)/i, /posting\/([a-f0-9]+)/i],
    requisitionIdPatterns: [],
    categorySignals: {
      application_sent: 0.8,
      interview_invite: 0.75,
      interview_scheduled: 0.75,
      rejection: 0.8,
      offer: 0.8,
    },
  },
  {
    id: 'jobvite',
    name: 'Jobvite',
    domainPatterns: [/jobvite\.com$/i],
    senderPatterns: [/jobvite/i],
    subjectPatterns: [
      /application/i,
      /interview/i,
      /offer/i,
    ],
    applicationIdPatterns: [/job\/(\d+)/i],
    requisitionIdPatterns: [],
    categorySignals: {
      application_sent: 0.8,
      interview_invite: 0.75,
      interview_scheduled: 0.75,
      rejection: 0.8,
      offer: 0.8,
    },
  },
  {
    id: 'ashby',
    name: 'Ashby',
    domainPatterns: [/ashbyhq\.com$/i, /ashby\.co$/i],
    senderPatterns: [/ashby/i, /no-reply@.*\.ashbyhq\.com$/i],
    subjectPatterns: [
      /application.*update/i,
      /interview/i,
      /offer/i,
      /status.*update/i,
    ],
    applicationIdPatterns: [/job-boards\/([a-zA-Z0-9]+)/i],
    requisitionIdPatterns: [],
    categorySignals: {
      application_sent: 0.85,
      interview_invite: 0.8,
      interview_scheduled: 0.8,
      rejection: 0.85,
      offer: 0.85,
    },
  },
  {
    id: 'workday',
    name: 'Workday',
    domainPatterns: [/myworkdayjobs\.com$/i, /wd5\.myworkday\.com$/i, /workday\.com$/i],
    senderPatterns: [/workday/i, /no-reply@.*\.myworkdayjobs\.com$/i],
    subjectPatterns: [
      /application/i,
      /interview/i,
      /offer/i,
      /status.*update/i,
    ],
    applicationIdPatterns: [/job\/([a-zA-Z0-9]+)/i],
    requisitionIdPatterns: [/req[_\s]*[#:]?\s*(\S+)/i],
    categorySignals: {
      application_sent: 0.8,
      interview_invite: 0.75,
      interview_scheduled: 0.75,
      rejection: 0.8,
      offer: 0.8,
    },
  },
];

export class AtsRegistry {
  private static providers: AtsProviderConfig[] = ATS_PROVIDERS;

  static register(config: AtsProviderConfig): void {
    const existing = this.providers.findIndex((p) => p.id === config.id);
    if (existing >= 0) {
      this.providers[existing] = config;
    } else {
      this.providers.push(config);
    }
  }

  static detect(
    senderEmail: string,
    subject: string,
    body: string,
  ): AtsDetectionResult {
    const results: AtsDetectionResult[] = [];

    for (const provider of this.providers) {
      const senderConfidence = this.matchSender(senderEmail, provider);
      const subjectConfidence = this.matchSubject(subject, provider);

      if (senderConfidence > 0 || subjectConfidence > 0) {
        const applicationId = this.extractApplicationId(body, provider);
        const requisitionId = this.extractRequisitionId(body, provider);

        results.push({
          provider: provider.id,
          applicationId,
          requisitionId,
          subjectConfidence,
          senderConfidence,
        });
      }
    }

    results.sort((a, b) => {
      const scoreA = a.senderConfidence * 0.6 + a.subjectConfidence * 0.4;
      const scoreB = b.senderConfidence * 0.6 + b.subjectConfidence * 0.4;
      return scoreB - scoreA;
    });

    return results[0] || {
      provider: null,
      applicationId: null,
      requisitionId: null,
      subjectConfidence: 0,
      senderConfidence: 0,
    };
  }

  static getCategorySignal(
    providerId: string,
    category: string,
  ): AtsCategorySignal | null {
    const provider = this.providers.find((p) => p.id === providerId);
    if (!provider) return null;

    const confidence = provider.categorySignals[category];
    if (confidence === undefined) return null;

    return { provider: provider.id, category, confidence };
  }

  static getProvider(providerId: string): AtsProviderConfig | undefined {
    return this.providers.find((p) => p.id === providerId);
  }

  private static matchSender(senderEmail: string, provider: AtsProviderConfig): number {
    for (const pattern of provider.senderPatterns) {
      if (pattern.test(senderEmail)) return 1.0;
    }
    for (const pattern of provider.domainPatterns) {
      const domainMatch = senderEmail.match(/@(.+)$/);
      if (domainMatch && pattern.test(domainMatch[1])) return 0.9;
    }
    return 0;
  }

  private static matchSubject(subject: string, provider: AtsProviderConfig): number {
    let matched = 0;
    for (const pattern of provider.subjectPatterns) {
      if (pattern.test(subject)) matched++;
    }
    if (matched === 0) return 0;
    return Math.min(0.9, 0.5 + matched * 0.15);
  }

  private static extractApplicationId(body: string, provider: AtsProviderConfig): string | null {
    for (const pattern of provider.applicationIdPatterns) {
      const match = body.match(pattern);
      if (match?.[1]) return match[1];
    }
    return null;
  }

  private static extractRequisitionId(body: string, provider: AtsProviderConfig): string | null {
    for (const pattern of provider.requisitionIdPatterns) {
      const match = body.match(pattern);
      if (match?.[1]) return match[1];
    }
    return null;
  }
}
