export interface PreExtractedData {
  companyName: string | null;
  jobTitle: string | null;
  category: string | null;
  confidence: number;
  extractedFields: string[];
}

export interface EmailSubjectParts {
  prefix: string;
  company: string | null;
  title: string | null;
  suffix: string | null;
}
