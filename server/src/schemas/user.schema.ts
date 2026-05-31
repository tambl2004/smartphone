import type { ValidationRule } from '../middlewares/validate.js';

export const userCreateRules = [
  { field: 'fullName', required: true, type: 'string' },
  { field: 'email', required: true, type: 'string' },
  { field: 'password', required: false, type: 'string', nullable: true },
  { field: 'role', required: false, type: 'string', nullable: true },
  { field: 'status', required: false, type: 'string', nullable: true },
] satisfies ValidationRule[];
