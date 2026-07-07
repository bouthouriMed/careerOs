import { Injectable } from '@nestjs/common';
import { GmailMessage } from './gmail.service';

interface DetectedApplication {
  companyName: string;
  jobTitle: string | null;
  confidence: 'high' | 'medium' | 'low';
  emailDate: Date;
}

const HIRING_KEYWORDS = [
  'application',
  'applicant',
  'hiring',
  'recruitment',
  'recruiter',
  'job offer',
  'offer letter',
  'interview',
  'your application',
  'we reviewed',
  'application received',
  'application status',
  'thank you for applying',
  'your candidacy',
  'candidate',
  'next steps',
  'job opportunity',
  'we are pleased',
  'employment opportunity',
];

const REJECTION_PATTERNS = [
  'not moving forward',
  'unfortunately',
  'other candidates',
  'position has been filled',
  'not selected',
  'decided to move forward with another',
  'we will not be',
];

function extractCompanyName(from: string, body: string): string {
  const nameMatch = from.match(/(.+?)\s*<.*>/);
  const senderName = nameMatch ? nameMatch[1].trim() : from;

  const commonDomains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com'];
  if (senderName.includes('@')) {
    const domain = senderName.split('@')[1]?.split('.')[0] ?? '';
    return domain.charAt(0).toUpperCase() + domain.slice(1);
  }

  const emailMatch = from.match(/<.*?@(.+?)\./);
  if (emailMatch && !commonDomains.includes(emailMatch[1])) {
    return emailMatch[1].charAt(0).toUpperCase() + emailMatch[1].slice(1);
  }

  const bodyLines = body.split('\n').filter((l) => l.trim());
  for (const line of bodyLines.slice(0, 20)) {
    const sigMatch = line.match(/^(?:Regards|Thanks|Best|Sincerely|Cheers|Team)[,\s]+\s*(.+)/i);
    if (sigMatch) {
      const name = sigMatch[1].trim();
      if (name.length < 30 && !name.includes('@')) return name;
    }
  }

  return senderName || 'Unknown Company';
}

function extractJobTitle(subject: string, body: string): string | null {
  const titlePatterns = [
    /(?:position|role|job|opening|opportunity)(?:\s+as\s+|\s*:\s*|\s+for\s+)?(.{5,50})/i,
    /(?:applying\s+for|applied\s+for|application\s+for)\s+"?(.{5,50})"?/i,
    /(.{5,50})\s+(?:position|role|job)/i,
  ];

  for (const pattern of titlePatterns) {
    const match = subject.match(pattern) || body.match(pattern);
    if (match) {
      const title = match[1].trim();
      if (title.length > 5 && title.length < 60) return title;
    }
  }

  const commonTitles = [
    'Software Engineer', 'Frontend Engineer', 'Backend Engineer',
    'Full Stack Engineer', 'Data Scientist', 'Product Manager',
    'DevOps Engineer', 'Engineering Manager', 'SRE',
    'Staff Engineer', 'Senior Engineer', 'Principal Engineer',
  ];

  for (const title of commonTitles) {
    if (subject.includes(title) || body.includes(title)) return title;
  }

  return null;
}

@Injectable()
export class EmailDetectorService {
  detectHiringEmails(messages: GmailMessage[]): DetectedApplication[] {
    const results: DetectedApplication[] = [];

    for (const msg of messages) {
      const combined = `${msg.subject} ${msg.body}`.toLowerCase();
      const hasKeyword = HIRING_KEYWORDS.some((kw) => combined.includes(kw));
      if (!hasKeyword) continue;

      const isRejection = REJECTION_PATTERNS.some((p) => combined.includes(p));
      const confidence: 'high' | 'medium' | 'low' = isRejection ? 'medium' : 'high';

      const companyName = extractCompanyName(msg.from, msg.body);
      const jobTitle = extractJobTitle(msg.subject, msg.body);

      results.push({
        companyName,
        jobTitle,
        confidence,
        emailDate: msg.date,
      });
    }

    return results;
  }
}
