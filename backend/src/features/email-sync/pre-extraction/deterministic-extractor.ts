import { PreExtractedData, EmailSubjectParts } from './types';

const CATEGORY_PATTERNS: Array<{ pattern: RegExp; category: string; confidence: number }> = [
  { pattern: /application\s+(?:received|submitted|confirmed)/i, category: 'application_sent', confidence: 0.9 },
  { pattern: /thank you for (?:your )?application/i, category: 'application_sent', confidence: 0.85 },
  { pattern: /we(?:'ve)? received your application/i, category: 'application_sent', confidence: 0.85 },
  { pattern: /your application (?:has been|was) (?:received|submitted)/i, category: 'application_sent', confidence: 0.85 },
  { pattern: /application\s+(?:status|update)/i, category: 'application_viewed', confidence: 0.7 },
  { pattern: /we(?:'ve)? (?:reviewed|viewed|looked at) your application/i, category: 'application_viewed', confidence: 0.8 },
  { pattern: /interview\s+(?:invitation|invite|scheduled|confirmation)/i, category: 'interview_invite', confidence: 0.9 },
  { pattern: /schedule.*interview/i, category: 'interview_invite', confidence: 0.85 },
  { pattern: /interview.*schedule/i, category: 'interview_invite', confidence: 0.85 },
  { pattern: /phone\s+(?:screen|call|interview)/i, category: 'interview_invite', confidence: 0.8 },
  { pattern: /technical\s+(?:screen|interview)/i, category: 'interview_invite', confidence: 0.8 },
  { pattern: /onsite\s+(?:interview|loop)/i, category: 'interview_invite', confidence: 0.85 },
  { pattern: /(?:next|following)\s+steps/i, category: 'interview_invite', confidence: 0.6 },
  { pattern: /offer\s+(?:letter|employment|extended)/i, category: 'offer', confidence: 0.95 },
  { pattern: /we(?:'d)? (?:like|are) to (?:offer|extend)/i, category: 'offer', confidence: 0.9 },
  { pattern: /pleased to (?:offer|extend)/i, category: 'offer', confidence: 0.9 },
  { pattern: /compensation\s+(?:package|offer)/i, category: 'offer', confidence: 0.85 },
  { pattern: /salary\s+(?:offer|package)/i, category: 'offer', confidence: 0.85 },
  { pattern: /rejection|not.*move.*forward|unfortunately.*not.*selected/i, category: 'rejection', confidence: 0.9 },
  { pattern: /we(?:'ve)? decided not to (?:move forward|proceed)/i, category: 'rejection', confidence: 0.9 },
  { pattern: /position.*filled|role.*filled/i, category: 'rejection', confidence: 0.8 },
  { pattern: /follow[- ]?up/i, category: 'follow_up', confidence: 0.7 },
  { pattern: /checking in|checking in on/i, category: 'follow_up', confidence: 0.75 },
  { pattern: /status\s+update/i, category: 'follow_up', confidence: 0.6 },
];

const SUBJECT_COMPANY_PATTERNS: Array<{ pattern: RegExp; captureGroup: number }> = [
  { pattern: /^re:\s*.+?\s+[-–—|]\s+(.+?)(?:\s+[-–—|]|$)/i, captureGroup: 1 },
  { pattern: /^(.+?)\s+[-–—|]\s+(?:job|position|role|opportunity)/i, captureGroup: 1 },
  { pattern: /^(?:application|apply|app)\s+(?:for|to|at)\s+(.+?)(?:\s*[-–—|]|$)/i, captureGroup: 1 },
  { pattern: /^(?:your )?application (?:to|at|for) (.+?)(?:\s*[-–—|]|$)/i, captureGroup: 1 },
  { pattern: /(?:at|for|with)\s+([A-Z][A-Za-z0-9\s&.]+?)(?:\s*[-–—|]|$)/i, captureGroup: 1 },
];

const TITLE_PATTERNS: Array<{ pattern: RegExp; captureGroup: number }> = [
  { pattern: /[-–—|]\s*(.+?)\s+(?:position|role|opportunity)/i, captureGroup: 1 },
  { pattern: /(?:for|position)\s+(.+?)(?:\s+at|\s+[-–—|]|$)/i, captureGroup: 1 },
  { pattern: /application (?:for|to)\s+.+?\s+(.+?)(?:\s*[-–—|]|$)/i, captureGroup: 1 },
];

const COMMON_JOB_TITLES = [
  'software engineer', 'senior software engineer', 'staff engineer', 'principal engineer',
  'frontend engineer', 'backend engineer', 'full stack engineer', 'fullstack engineer',
  'senior frontend engineer', 'senior backend engineer',
  'data scientist', 'senior data scientist', 'data engineer', 'senior data engineer',
  'machine learning engineer', 'ml engineer', 'senior ml engineer',
  'product manager', 'senior product manager', 'technical product manager',
  'devops engineer', 'senior devops engineer', 'sre', 'site reliability engineer',
  'engineering manager', 'director of engineering', 'vp of engineering',
  'designer', 'ux designer', 'ui designer', 'product designer', 'senior product designer',
  'qa engineer', 'quality assurance engineer', 'test engineer',
  'cloud engineer', 'security engineer', 'platform engineer',
  'mobile engineer', 'ios engineer', 'android engineer',
  'solutions architect', 'systems architect', 'technical architect',
];

export class DeterministicExtractor {
  static extractFromSubject(subject: string): PreExtractedData {
    const parts = this.parseSubject(subject);
    const category = this.extractCategory(subject);
    const jobTitle = parts.title || this.extractJobTitleFromSubject(subject);

    return {
      companyName: parts.company,
      jobTitle,
      category,
      confidence: this.calculateConfidence(parts, category, jobTitle),
      extractedFields: this.listExtractedFields(parts, category, jobTitle),
    };
  }

  static extractFromSender(fromEmail: string, fromName: string | null): {
    companyName: string | null;
    confidence: number;
  } {
    const domain = fromEmail.match(/@(.+)$/)?.[1];
    if (!domain) return { companyName: null, confidence: 0 };

    const cleanDomain = domain
      .replace(/^(mail|app|noreply|no-reply|donotreply|jobs|careers|recruiting)\./, '')
      .replace(/\.(com|io|co|org|net)$/, '');

    if (cleanDomain.length < 2) return { companyName: null, confidence: 0 };

    const name = cleanDomain.charAt(0).toUpperCase() + cleanDomain.slice(1);

    return {
      companyName: name,
      confidence: 0.6,
    };
  }

  static extractCategory(body: string): { category: string; confidence: number } | null {
    for (const { pattern, category, confidence } of CATEGORY_PATTERNS) {
      if (pattern.test(body)) {
        return { category, confidence };
      }
    }
    return null;
  }

  private static parseSubject(subject: string): EmailSubjectParts {
    const cleaned = subject
      .replace(/^(fwd?:\s*|re:\s*)+/i, '')
      .trim();

    let company: string | null = null;
    let title: string | null = null;

    for (const { pattern, captureGroup } of SUBJECT_COMPANY_PATTERNS) {
      const match = cleaned.match(pattern);
      if (match?.[captureGroup]) {
        company = match[captureGroup].trim();
        break;
      }
    }

    for (const { pattern, captureGroup } of TITLE_PATTERNS) {
      const match = cleaned.match(pattern);
      if (match?.[captureGroup]) {
        title = match[captureGroup].trim();
        break;
      }
    }

    if (!title) {
      const lowerSubject = cleaned.toLowerCase();
      for (const jobTitle of COMMON_JOB_TITLES) {
        if (lowerSubject.includes(jobTitle)) {
          title = jobTitle.split(' ').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
          break;
        }
      }
    }

    return {
      prefix: cleaned,
      company,
      title,
      suffix: null,
    };
  }

  private static extractCategory(subject: string): string | null {
    for (const { pattern, category } of CATEGORY_PATTERNS) {
      if (pattern.test(subject)) {
        return category;
      }
    }
    return null;
  }

  private static extractJobTitleFromSubject(subject: string): string | null {
    const lowerSubject = subject.toLowerCase();
    for (const jobTitle of COMMON_JOB_TITLES) {
      if (lowerSubject.includes(jobTitle)) {
        return jobTitle.split(' ').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      }
    }
    return null;
  }

  private static calculateConfidence(
    parts: EmailSubjectParts,
    category: string | null,
    jobTitle: string | null,
  ): number {
    let confidence = 0;

    if (parts.company) confidence += 0.4;
    if (category) confidence += 0.3;
    if (jobTitle) confidence += 0.3;

    return Math.min(1, confidence);
  }

  private static listExtractedFields(
    parts: EmailSubjectParts,
    category: string | null,
    jobTitle: string | null,
  ): string[] {
    const fields: string[] = [];
    if (parts.company) fields.push('companyName');
    if (category) fields.push('category');
    if (jobTitle) fields.push('jobTitle');
    return fields;
  }
}
