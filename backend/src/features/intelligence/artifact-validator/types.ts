export interface ValidationRule {
  field: string;
  required: boolean;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  minConfidence?: number;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface ArtifactSchema {
  type: string;
  rules: ValidationRule[];
  minConfidence: number;
}
