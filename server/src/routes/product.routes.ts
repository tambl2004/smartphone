import { Router } from 'express';
import { createProductHandler, deleteProductHandler, detailProduct, listProducts, updateProductHandler } from '../controllers/product.controller.js';
import { validateBody } from '../middlewares/validate.js';
import { productCreateRules } from '../schemas/product.schema.js';
import { authenticate, authorizeRoles } from '../middlewares/auth.js';

const router = Router();

const adminAuth = [authenticate, authorizeRoles('admin')];

// Public routes
router.get('/', listProducts);
router.get('/:id', detailProduct);

// Admin-only routes
router.post('/', ...adminAuth, validateBody(productCreateRules), createProductHandler);
router.put('/:id', ...adminAuth, validateBody(productCreateRules), updateProductHandler);
router.delete('/:id', ...adminAuth, deleteProductHandler);

export default router;
