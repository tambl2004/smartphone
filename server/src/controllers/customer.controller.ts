import type { Request, Response } from 'express';
import { getCustomers } from '../services/customer.service.js';
import { sendError, sendSuccess } from '../utils/api-response.js';
import { getCartItemsByUserId, upsertCartItem, removeCartItem, clearCartByUserId } from '../models/cart.model.js';
import { getWishlistItemsByUserId, toggleWishlistItem, removeWishlistItem } from '../models/wishlist.model.js';
import type { ProductRecord } from '../models/product.model.js';

type CustomerProductRow = ProductRecord & {
  primaryImageId?: number | null;
  primaryImageUrl?: string | null;
  primaryImageSortOrder?: number | null;
  primaryImageIsPrimary?: number | null;
};

const mapProductRecord = (row: CustomerProductRow) => ({
  id: row.id,
  slug: row.slug,
  sku: row.sku,
  name: row.name,
  categoryId: row.categoryId,
  categoryName: row.categoryName,
  categorySlug: row.categorySlug,
  brand: row.brand,
  price: Number(row.price),
  originalPrice: row.originalPrice ? Number(row.originalPrice) : null,
  discountPercent: row.discountPercent,
  rating: Number(row.rating),
  reviewsCount: row.reviewsCount,
  stock: row.stock,
  description: row.description,
  featured: row.featured,
  status: row.status,
  additionalSpecs: row.additionalSpecs,
  images: row.primaryImageUrl
    ? [{
        id: row.primaryImageId ?? undefined,
        imageUrl: row.primaryImageUrl,
        sortOrder: row.primaryImageSortOrder ?? 0,
        isPrimary: row.primaryImageIsPrimary ?? 1,
      }]
    : (row.images ?? []),
  specs: row.specs ?? [],
});

export const listCustomers = async (_req: Request, res: Response) => {
  const items = await getCustomers();

  return res.status(200).json({ items });
};

export const getMyCart = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) return sendError(res, 401, 'Unauthorized');

  const rows = await getCartItemsByUserId(userId);
  const items = rows.map((row) => ({
    product: mapProductRecord(row),
    quantity: row.quantity,
  }));
  return sendSuccess(res, 200, 'Cart retrieved successfully', { items });
};

export const upsertMyCart = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) return sendError(res, 401, 'Unauthorized');

  const productId = Number(req.params.productId);
  const quantity = Number(req.body.quantity ?? 1);
  if (!Number.isFinite(productId) || productId <= 0 || !Number.isFinite(quantity) || quantity <= 0) {
    return sendError(res, 400, 'Invalid cart payload');
  }

  await upsertCartItem(userId, productId, quantity);
  return sendSuccess(res, 200, 'Cart updated successfully', null);
};

export const deleteMyCartItem = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) return sendError(res, 401, 'Unauthorized');

  const productId = Number(req.params.productId);
  if (!Number.isFinite(productId) || productId <= 0) {
    return sendError(res, 400, 'Invalid product id');
  }

  await removeCartItem(userId, productId);
  return sendSuccess(res, 200, 'Cart item removed', null);
};

export const clearMyCart = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) return sendError(res, 401, 'Unauthorized');

  await clearCartByUserId(userId);
  return sendSuccess(res, 200, 'Cart cleared', null);
};

export const getMyWishlist = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) return sendError(res, 401, 'Unauthorized');

  const rows = await getWishlistItemsByUserId(userId);
  const items = rows.map((row) => mapProductRecord(row));
  return sendSuccess(res, 200, 'Wishlist retrieved successfully', { items });
};

export const toggleMyWishlist = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) return sendError(res, 401, 'Unauthorized');

  const productId = Number(req.params.productId);
  if (!Number.isFinite(productId) || productId <= 0) {
    return sendError(res, 400, 'Invalid product id');
  }

  const result = await toggleWishlistItem(userId, productId);
  return sendSuccess(res, 200, result.added ? 'Added to wishlist' : 'Removed from wishlist', result);
};

export const deleteMyWishlistItem = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) return sendError(res, 401, 'Unauthorized');

  const productId = Number(req.params.productId);
  if (!Number.isFinite(productId) || productId <= 0) {
    return sendError(res, 400, 'Invalid product id');
  }

  await removeWishlistItem(userId, productId);
  return sendSuccess(res, 200, 'Wishlist item removed', null);
};
