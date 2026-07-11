import { AiProvider, EmailContent, ExtractionResult } from './ai-provider';

export class GroqProvider implements AiProvider {
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.GROQ_API_KEY || '';
  }

  async classifyEmail(email: EmailContent): Promise<ExtractionResult> {
    const prompt = this.buildClassifyPrompt(email);
    const response = await this.callGroq(prompt, 300);
    return this.parseResponse(response);
  }

  async extractEmail(email: EmailContent, context?: { companyName?: string; jobTitle?: string; category?: string }): Promise<ExtractionResult> {
    const prompt = this.buildExtractPrompt(email, context);
    const response = await this.callGroq(prompt, 800);
    return this.parseResponse(response);
  }

  private buildClassifyPrompt(email: EmailContent): string {
    const body = email.body.slice(0, 2000);
    return `You are a job application classifier. Analyze this hiring email and extract structured data.

Email:
From: ${email.fromName ? `${email.fromName} <${email.from}>` : email.from}
Subject: ${email.subject}
Date: ${email.date.toISOString()}
Body:
${body}

RULES for status classification:
- "applied" → application confirmation, "thanks for applying", "application received", "we got your application"
- "interviewing" → interview scheduled, "schedule a time", "interview invitation", "phone screen", "technical interview"
- "rejected" → "unfortunately", "regret to inform", "not selected", "not moving forward", "decided to move on", "other candidates", "position has been filled"
- "offer" → "offer letter", "compensation", "salary", "we are pleased to offer"
- If the email is ambiguous, use the most conservative status (e.g., if unsure between interviewing and rejected, use applied)

RULES for company extraction:
- Extract the OFFICIAL company name from the sender domain or email signature
- Do NOT use department names, team names, or individual names as company
- Example: @google.com → Google, @stripe.com → Stripe

RULES for job title:
- If you cannot determine the job title with high confidence, set it to null
- Do NOT guess or make up job titles

RULES for date:
- If this is an application confirmation: appliedAt = email date or date mentioned in body
- If this is interview/rejection/offer/follow-up: appliedAt = null

Return ONLY plain JSON with all fields:
{
  "isHiringRelated": true,
  "category": "application_sent|interview_invite|interview_scheduled|rejection|offer|follow_up|application_viewed|other",
  "application": {
    "companyName": "string (required, official company name)",
    "companyDomain": "string or null (sender domain)",
    "jobTitle": "string or null (only if confident)",
    "status": "applied|screening|interviewing|offer|rejected|accepted|declined|saved",
    "appliedAt": "ISO date or null"
  },
  "recruiter": { "name": "string or null", "email": "string or null" },
  "interview": null,
  "offer": null
}`;
  }

  private buildExtractPrompt(email: EmailContent, context?: { companyName?: string; jobTitle?: string; category?: string }): string {
    const body = email.body.slice(0, 2000);
    const known = context
      ? `\nKnown context:
Company: ${context.companyName || 'unknown'}
Job Title: ${context.jobTitle || 'unknown'}
Category: ${context.category || 'unknown'}
`
      : '';
    return `You are a job application data extractor. Extract detailed structured data from this hiring email.${known}

Email:
From: ${email.fromName ? `${email.fromName} <${email.from}>` : email.from}
Subject: ${email.subject}
Date: ${email.date.toISOString()}
Body:
${body}

CRITICAL RULES:
- Company name must be the OFFICIAL company name (not a department, team, or individual)
- Job title must be extracted with high confidence. If unsure, set to null
- If the email mentions rejection language ("unfortunately", "regret", "not selected", "not moving forward"), set status to "rejected"
- If the email mentions interview scheduling, set isScheduled to true and extract date/time/duration
- For dates, always use ISO 8601 format

Return ONLY plain JSON. Set null for anything not found:
{
  "isHiringRelated": true,
  "category": "application_sent|interview_invite|interview_scheduled|rejection|offer|follow_up|application_viewed|other",
  "application": {
    "companyName": "string (official company name)",
    "companyDomain": "string or null",
    "companyDescription": "string or null",
    "jobTitle": "string or null (only if confident)",
    "jobDescription": "string or null",
    "jobLocation": "string or null",
    "jobSalaryMin": "number or null",
    "jobSalaryMax": "number or null",
    "jobSalaryCurrency": "string or null",
    "jobKeywords": "comma-separated string or null",
    "jobUrl": "string or null",
    "status": "applied|screening|interviewing|offer|rejected|accepted|declined|saved",
    "appliedAt": "ISO date or null",
    "notes": "string or null"
  },
  "recruiter": {
    "name": "string or null",
    "email": "string or null",
    "phone": "string or null",
    "linkedinUrl": "string or null",
    "notes": "string or null"
  },
  "interview": {
    "isScheduled": true,
    "date": "ISO date or null",
    "type": "Phone|Video|Onsite|Technical|TakeHome|Final|Other or null",
    "duration": "number or null",
    "location": "string or null",
    "meetingUrl": "string or null",
    "round": "string or null",
    "status": "Scheduled|Completed|Cancelled|FeedbackReceived or null",
    "feedback": "string or null"
  } | null,
  "offer": {
    "salary": "string or null",
    "currency": "string or null",
    "deadline": "ISO date or null"
  } | null
}`;
  }

  private async callGroq(prompt: string, maxTokens: number, retries = 3): Promise<string> {
    for (let attempt = 1; attempt <= retries; attempt++) {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.1,
          max_tokens: maxTokens,
        }),
      });

      if (response.ok) {
        const data = await response.json() as { choices: Array<{ message: { content: string } }> };
        return data.choices[0]?.message?.content || '';
      }

      if (response.status === 429 && attempt < retries) {
        const errorText = await response.text();
        const match = errorText.match(/try again in (\d+(?:\.\d+)?)s/);
        const waitMs = match ? Math.ceil(parseFloat(match[1]) * 1000) + 500 : 3000;
        console.warn(`Groq 429 (attempt ${attempt}/${retries}), waiting ${waitMs}ms`);
        await this.delay(waitMs);
        continue;
      }

      const error = await response.text();
      throw new Error(`Groq API error: ${response.status} ${error}`);
    }
    throw new Error('Groq API: max retries exceeded');
  }

  private parseResponse(raw: string): ExtractionResult {
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in AI response');
    }
    return JSON.parse(jsonMatch[0]) as ExtractionResult;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
