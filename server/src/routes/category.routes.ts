import { Router } from 'express';
import { createCategoryHandler, deleteCategoryHandler, detailCategory, listCategories, updateCategoryHandler } from '../controllers/category.controller.js';
import { validateBody } from '../middlewares/validate.js';
import { categoryCreateRules } from '../schemas/category.schema.js';

const router = Router();

/**
 * @openapi
 * /api/categories:
 *   get:
 *     summary: Get all categories
 *     tags:
 *       - Categories
 *     responses:
 *       200:
 *         description: Categories retrieved successfully
 */
router.get('/', listCategories);
router.get('/:id', detailCategory);
router.post('/', validateBody(categoryCreateRules), createCategoryHandler);
router.put('/:id', validateBody(categoryCreateRules), updateCategoryHandler);
router.delete('/:id', deleteCategoryHandler);

export default router;
