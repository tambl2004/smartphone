import { Router } from 'express';
import * as promotionController from '../controllers/promotion.controller.js';
import { authenticate, authorizeRoles } from '../middlewares/auth.js';

const router = Router();

// Admin routes for managing promotions
router.get('/', authenticate, authorizeRoles('admin'), promotionController.listPromotions);
router.post('/', authenticate, authorizeRoles('admin'), promotionController.createPromotion);
router.put('/:id', authenticate, authorizeRoles('admin'), promotionController.updatePromotion);
router.delete('/:id', authenticate, authorizeRoles('admin'), promotionController.deletePromotion);

// Public or Customer routes
router.get('/code/:code', promotionController.getPromotion);
router.post('/validate', authenticate, promotionController.validatePromotion);

export default router;
