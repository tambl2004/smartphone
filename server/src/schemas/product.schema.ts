import type { ValidationRule } from '../middlewares/validate.js';

export const productCreateRules = [
  { field: 'slug', required: true, type: 'string' },
  { field: 'name', required: true, type: 'string' },
  { field: 'categoryId', required: true, type: 'integer' },
  { field: 'brandId', required: true, type: 'integer' },
  { field: 'price', required: true, type: 'number' },
  { field: 'originalPrice', required: false, type: 'number', nullable: true },
  { field: 'discountPercent', required: false, type: 'integer' },
  { field: 'rating', required: false, type: 'number' },
  { field: 'reviewsCount', required: false, type: 'integer' },
  { field: 'stock', required: false, type: 'integer' },
  { field: 'description', required: false, type: 'string', nullable: true },
  { field: 'featured', required: false, type: 'boolean' },
  { field: 'status', required: false, type: 'string' },
] satisfies ValidationRule[];
