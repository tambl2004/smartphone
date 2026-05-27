import type { NextFunction, Request, Response } from 'express';
import { sendError } from '../utils/api-response.js';

export type ValidationRule = {
  field: string;
  required?: boolean;
  type?: 'string' | 'number' | 'boolean' | 'integer';
  nullable?: boolean;
};

export type ValidationIssue = {
  field: string;
  message: string;
};

const getValue = (body: Record<string, unknown>, field: string) => body[field];

export const validateBody = (rules: ValidationRule[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const body = req.body as Record<string, unknown>;
    const issues: ValidationIssue[] = [];

    for (const rule of rules) {
      const value = getValue(body, rule.field);
      const isMissing = value === undefined || value === null || value === '';

      if (rule.required && isMissing) {
        issues.push({ field: rule.field, message: `${rule.field} is required` });
        continue;
      }

      if ((value === null || value === undefined) && rule.nullable) {
        continue;
      }

      if (value !== undefined && value !== null && rule.type) {
        const actualType = Array.isArray(value) ? 'array' : typeof value;
        const expectedType = rule.type === 'integer' ? 'number' : rule.type;

        if (expectedType === 'number' && actualType !== 'number') {
          issues.push({ field: rule.field, message: `${rule.field} must be a number` });
        }

        if (expectedType === 'boolean' && actualType !== 'boolean') {
          issues.push({ field: rule.field, message: `${rule.field} must be a boolean` });
        }

        if (expectedType === 'string' && actualType !== 'string') {
          issues.push({ field: rule.field, message: `${rule.field} must be a string` });
        }
      }
    }

    if (issues.length > 0) {
      return sendError(res, 400, 'Validation failed', issues);
    }

    return next();
  };
};
