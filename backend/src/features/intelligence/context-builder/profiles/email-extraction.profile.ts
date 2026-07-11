import { ContextProfile } from '../types';

export const EMAIL_EXTRACTION_CONTEXT: ContextProfile = {
  id: 'email-extraction',
  name: 'Email Extraction',
  description: 'Context for extracting structured data from hiring emails',
  requiredEntities: ['applications', 'companies'],
  memoryCategories: [],
  artifactTypes: ['email_classification'],
  maxTokens: 2000,
  priorityOrder: ['applications', 'companies'],
};
