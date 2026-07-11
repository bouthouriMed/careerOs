import { ApplicationStatus } from '@prisma/client';
import { OfferExtraction } from './types';

const OFFER_KEYWORDS = [
  'offer letter', 'we are pleased to offer', 'pleased to extend',
  'offer of employment', 'compensation package', 'salary offer',
  'we would like to offer', 'formal offer', 'job offer',
  'congratulations', 'welcome to the team', 'start date',
  'onboarding', 'benefits package', 'signing bonus',
];

const OFFER_PATTERNS = [
  /salary[:\s]+\$?[\d,]+/i,
  /compensation[:\s]+\$?[\d,]+/i,
  /annual(?:ly)?[:\s]+\$?[\d,]+/i,
  /per (?:year|annum|month)/i,
  /\$\d[\d,]*\s*(?:\/|\s*per\s*)\s*(?:yr|year|annum|month|mo)/i,
];

const DEADLINE_PATTERNS = [
  /(?:deadline|expires?|by|before|respond by|accept by)[:\s]+(.+?)(?:\.|,|\n|$)/i,
  /(?:please )?(?:confirm|respond|accept|reply) (?:by|before|no later than)[:\s]+(.+?)(?:\.|,|\n|$)/i,
];

const CURRENCY_SYMBOLS: Record<string, string> = {
  '$': 'USD',
  '€': 'EUR',
  '£': 'GBP',
  '¥': 'JPY',
  '₹': 'INR',
  'C$': 'CAD',
  'A$': 'AUD',
};

export class OfferDetector {
  static extract(body: string, category: string): OfferExtraction {
    if (category !== 'offer') {
      return {
        hasOffer: false,
        salary: null,
        currency: null,
        deadline: null,
        confidence: 0,
        reason: 'Email category is not offer',
      };
    }

    const bodyLower = body.toLowerCase();
    let confidence = 0.6;

    const hasOfferKeyword = OFFER_KEYWORDS.some((kw) => bodyLower.includes(kw));
    if (hasOfferKeyword) {
      confidence = 0.85;
    }

    const salary = this.extractSalary(body);
    if (salary) {
      confidence = Math.min(0.95, confidence + 0.1);
    }

    const deadline = this.extractDeadline(body);
    if (deadline) {
      confidence = Math.min(0.95, confidence + 0.05);
    }

    const currency = salary ? this.extractCurrency(body) : null;

    return {
      hasOffer: true,
      salary: salary,
      currency: currency,
      deadline: deadline,
      confidence,
      reason: hasOfferKeyword
        ? 'Offer keywords detected'
        : 'Category classified as offer',
    };
  }

  static shouldTransitionToOffer(body: string, category: string): boolean {
    if (category === 'offer') return true;

    const bodyLower = body.toLowerCase();
    const offerSignalCount = OFFER_KEYWORDS.filter((kw) => bodyLower.includes(kw)).length;
    return offerSignalCount >= 2;
  }

  private static extractSalary(body: string): string | null {
    for (const pattern of OFFER_PATTERNS) {
      const match = body.match(pattern);
      if (match) {
        const numMatch = match[0].match(/[\d,]+/);
        if (numMatch) {
          return numMatch[0].replace(/,/g, '');
        }
      }
    }
    return null;
  }

  private static extractCurrency(body: string): string | null {
    for (const [symbol, code] of Object.entries(CURRENCY_SYMBOLS)) {
      if (body.includes(symbol)) {
        return code;
      }
    }
    if (/\busd\b/i.test(body)) return 'USD';
    if (/\beur\b/i.test(body)) return 'EUR';
    if (/\bgbp\b/i.test(body)) return 'GBP';
    return null;
  }

  private static extractDeadline(body: string): Date | null {
    for (const pattern of DEADLINE_PATTERNS) {
      const match = body.match(pattern);
      if (match && match[1]) {
        const parsed = new Date(match[1].trim());
        if (!isNaN(parsed.getTime()) && parsed > new Date()) {
          return parsed;
        }
      }
    }
    return null;
  }
}
