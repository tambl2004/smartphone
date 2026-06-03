import {
  createReviews as createReviewsModel,
  findReviewsByProduct,
  findReviewsByOrderAndUser,
  findAllReviews as findAllReviewsModel,
  deleteReview as deleteReviewModel,
} from '../models/review.model.js';
import type { ListQuery } from '../utils/pagination.js';

export const submitReviews = async (
  userId: number,
  orderId: number,
  items: { productId: number; rating: number; comment?: string }[]
) => {
  return createReviewsModel(userId, orderId, items);
};

export const getProductReviews = async (productId: number) => {
  return findReviewsByProduct(productId);
};

export const getOrderReviews = async (orderId: number, userId: number) => {
  return findReviewsByOrderAndUser(orderId, userId);
};

export const getAllReviews = async (query: ListQuery) => {
  return findAllReviewsModel(query);
};

export const removeReview = async (id: number) => {
  return deleteReviewModel(id);
};
