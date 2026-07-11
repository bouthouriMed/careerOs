import { ArtifactSchema } from '../types';

export const EMAIL_CLASSIFICATION_SCHEMA: ArtifactSchema = {
  type: 'email_classification',
  minConfidence: 0.5,
  rules: [
    { field: 'isHiringRelated', required: true, type: 'boolean' },
    { field: 'category', required: true, type: 'string' },
    { field: 'application', required: true, type: 'object' },
    { field: 'application.companyName', required: true, type: 'string' },
  ],
};

export const EMAIL_EXTRACTION_SCHEMA: ArtifactSchema = {
  type: 'email_extraction',
  minConfidence: 0.5,
  rules: [
    { field: 'isHiringRelated', required: true, type: 'boolean' },
    { field: 'category', required: true, type: 'string' },
    { field: 'application', required: true, type: 'object' },
    { field: 'application.companyName', required: true, type: 'string' },
    { field: 'application.jobTitle', required: true, type: 'string' },
  ],
};
