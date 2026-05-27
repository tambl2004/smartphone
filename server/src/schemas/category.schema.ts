import type { ValidationRule } from '../middlewares/validate.js';

export const categoryCreateRules = [
  { field: 'slug', required: true, type: 'string' },
  { field: 'name', required: true, type: 'string' },
  { field: 'icon', required: false, type: 'string', nullable: true },
] satisfies ValidationRule[];
