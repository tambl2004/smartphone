import type { Request, Response } from 'express';
import {
  submitReviews,
  getProductReviews,
  getOrderReviews,
  getAllReviews,
  removeReview,
} from '../services/review.service.js';
import { sendSuccess, sendError } from '../utils/api-response.js';
import { parseListQuery } from '../utils/pagination.js';

/**
 * POST /reviews
 * Body: { orderId, items: [{ productId, rating, comment? }] }
 */
export const createReviewController = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { orderId, items } = req.body;

  if (!orderId || !items || !Array.isArray(items) || items.length === 0) {
    return sendError(res, 400, 'Missing orderId or items');
  }

  // Validate ratings
  for (const item of items) {
    if (!item.productId || !item.rating || item.rating < 1 || item.rating > 5) {
      return sendError(res, 400, 'Invalid rating. Must be 1-5.');
    }
  }

  await submitReviews(userId, orderId, items);
  return sendSuccess(res, 201, 'Reviews submitted successfully', null);
};

/**
 * GET /reviews/product/:productId
 * Public: get all reviews for a product
 */
export const getProductReviewsController = async (req: Request, res: Response) => {
  const { productId } = req.params;
  const reviews = await getProductReviews(Number(productId));
  return sendSuccess(res, 200, 'Product reviews retrieved', { items: reviews });
};

/**
 * GET /reviews/order/:orderId
 * Authenticated: get current user's reviews for a specific order
 */
export const getOrderReviewsController = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { orderId } = req.params;
  const reviews = await getOrderReviews(Number(orderId), userId);
  return sendSuccess(res, 200, 'Order reviews retrieved', { items: reviews });
};

/**
 * GET /reviews (admin)
 * Paginated list of all reviews
 */
export const listReviewsController = async (req: Request, res: Response) => {
  const result = await getAllReviews(parseListQuery(req.query as Record<string, unknown>));
  return sendSuccess(res, 200, 'Reviews retrieved', result);
};

/**
 * DELETE /reviews/:id (admin)
 */
export const deleteReviewController = async (req: Request, res: Response) => {
  const { id } = req.params;
  const success = await removeReview(Number(id));
  if (!success) {
    return sendError(res, 404, 'Review not found');
  }
  return sendSuccess(res, 200, 'Review deleted', null);
};
