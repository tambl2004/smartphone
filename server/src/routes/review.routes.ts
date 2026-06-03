import { Router } from 'express';
import {
  createReviewController,
  getProductReviewsController,
  getOrderReviewsController,
  listReviewsController,
  deleteReviewController,
} from '../controllers/review.controller.js';
import { authenticate, authorizeRoles } from '../middlewares/auth.js';

const router = Router();

// Public: get reviews for a product
router.get('/product/:productId', getProductReviewsController);

// Authenticated: submit reviews
router.post('/', authenticate, createReviewController);

// Authenticated: get my reviews for a specific order
router.get('/order/:orderId', authenticate, getOrderReviewsController);

// Admin: list all reviews
router.get('/', authenticate, authorizeRoles('admin'), listReviewsController);

// Admin: delete a review
router.delete('/:id', authenticate, authorizeRoles('admin'), deleteReviewController);

export default router;
