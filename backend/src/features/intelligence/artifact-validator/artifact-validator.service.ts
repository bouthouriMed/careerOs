import { Injectable, Logger } from '@nestjs/common';
import { ArtifactSchema, ValidationRule, ValidationResult } from './types';

@Injectable()
export class ArtifactValidator {
  private readonly logger = new Logger(ArtifactValidator.name);
  private schemas = new Map<string, ArtifactSchema>();

  registerSchema(schema: ArtifactSchema): void {
    this.schemas.set(schema.type, schema);
  }

  validate(type: string, data: Record<string, unknown>, confidence: number): ValidationResult {
    const schema = this.schemas.get(type);
    if (!schema) {
      this.logger.warn(`No schema registered for artifact type: ${type}`);
      return { valid: true, errors: [], warnings: [`No schema for type: ${type}`] };
    }

    const errors: string[] = [];
    const warnings: string[] = [];

    if (confidence < schema.minConfidence) {
      errors.push(`Confidence ${confidence} below minimum ${schema.minConfidence}`);
    }

    for (const rule of schema.rules) {
      const value = data[rule.field];

      if (rule.required && (value === undefined || value === null)) {
        errors.push(`Missing required field: ${rule.field}`);
        continue;
      }

      if (value !== undefined && value !== null) {
        if (!this.checkType(value, rule.type)) {
          errors.push(`Field ${rule.field} expected ${rule.type}, got ${typeof value}`);
        }
      }
    }

    const valid = errors.length === 0;

    if (!valid) {
      this.logger.warn(`Artifact validation failed for ${type}: ${errors.join(', ')}`);
    }

    return { valid, errors, warnings };
  }

  private checkType(value: unknown, expectedType: string): boolean {
    switch (expectedType) {
      case 'string':
        return typeof value === 'string';
      case 'number':
        return typeof value === 'number';
      case 'boolean':
        return typeof value === 'boolean';
      case 'object':
        return typeof value === 'object' && value !== null;
      case 'array':
        return Array.isArray(value);
      default:
        return true;
    }
  }
}
