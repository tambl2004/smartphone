import { Router } from 'express';
import { createCategoryHandler, deleteCategoryHandler, detailCategory, listCategories, updateCategoryHandler } from '../controllers/category.controller.js';
import { validateBody } from '../middlewares/validate.js';
import { categoryCreateRules } from '../schemas/category.schema.js';
import { authenticate, authorizeRoles } from '../middlewares/auth.js';

const router = Router();

const adminAuth = [authenticate, authorizeRoles('admin')];

// Public routes
router.get('/', listCategories);
router.get('/:id', detailCategory);

// Admin-only routes
router.post('/', ...adminAuth, validateBody(categoryCreateRules), createCategoryHandler);
router.put('/:id', ...adminAuth, validateBody(categoryCreateRules), updateCategoryHandler);
router.delete('/:id', ...adminAuth, deleteCategoryHandler);

export default router;
