import { Router } from 'express';
import { createBrandHandler, deleteBrandHandler, detailBrand, listBrands, updateBrandHandler } from '../controllers/brand.controller.js';
import { validateBody } from '../middlewares/validate.js';
import { brandCreateRules } from '../schemas/brand.schema.js';

const router = Router();

/**
 * @openapi
 * /api/brands:
 *   get:
 *     summary: Get all brands
 *     tags:
 *       - Brands
 *     responses:
 *       200:
 *         description: Brands retrieved successfully
 *   post:
 *     summary: Create a brand
 *     tags:
 *       - Brands
 *     responses:
 *       201:
 *         description: Brand created successfully
 */
router.get('/', listBrands);
router.get('/:id', detailBrand);
router.post('/', validateBody(brandCreateRules), createBrandHandler);
router.put('/:id', validateBody(brandCreateRules), updateBrandHandler);
router.delete('/:id', deleteBrandHandler);

export default router;
