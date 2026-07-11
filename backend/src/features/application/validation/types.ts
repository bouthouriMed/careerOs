export interface ValidationIssue {
  id: string;
  type: ValidationIssueType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  entityType: 'application' | 'interview' | 'offer';
  entityId: string;
  description: string;
  suggestedFix: string | null;
  autoFixable: boolean;
  detectedAt: Date;
  evidence: Record<string, unknown>;
}

export type ValidationIssueType =
  | 'status_inconsistency'
  | 'missing_status_source'
  | 'offer_without_status'
  | 'interview_in_past_not_completed'
  | 'interview_scheduled_after_offer'
  | 'duplicate_company_domain'
  | 'low_confidence_application'
  | 'email_evidence_missing'
  | 'timeline_anomaly'
  | 'recruiter_mismatch';

export interface ValidationReport {
  userId: string;
  totalApplications: number;
  issues: ValidationIssue[];
  autoFixableCount: number;
  criticalCount: number;
  validationScore: number;
  validatedAt: Date;
}

export interface ValidationRule {
  id: string;
  type: ValidationIssueType;
  severity: ValidationIssue['severity'];
  autoFixable: boolean;
  description: string;
}
