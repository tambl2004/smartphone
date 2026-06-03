import { getDb } from './mysql.js';
import type { ListQuery } from '../utils/pagination.js';

export type ReviewRecord = {
  id: number;
  orderId: number;
  productId: number;
  userId: number;
  rating: number;
  comment: string | null;
  createdAt: string;
  // Joined fields
  productName?: string;
  productImage?: string;
  userName?: string;
  userEmail?: string;
  userAvatar?: string;
  orderCode?: string;
};

/**
 * Create reviews for all products in an order (batch).
 * Each item gets a rating + optional comment.
 */
export const createReviews = async (
  userId: number,
  orderId: number,
  items: { productId: number; rating: number; comment?: string }[]
) => {
  const db = getDb();

  for (const item of items) {
    await db.execute(
      `INSERT INTO reviews (order_id, product_id, user_id, rating, comment)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE rating = VALUES(rating), comment = VALUES(comment)`,
      [orderId, item.productId, userId, item.rating, item.comment || null]
    );

    // Update product aggregate rating
    await recalculateProductRating(item.productId);
  }
};

/**
 * Recalculate and update a product's average rating and review count.
 */
const recalculateProductRating = async (productId: number) => {
  const [rows] = await getDb().query(
    `SELECT COUNT(*) AS cnt, COALESCE(AVG(rating), 0) AS avg_rating
     FROM reviews WHERE product_id = ?`,
    [productId]
  );
  const row = (rows as Array<{ cnt: number; avg_rating: number }>)[0];
  await getDb().execute(
    `UPDATE products SET rating = ?, reviews_count = ? WHERE id = ?`,
    [Number(row.avg_rating).toFixed(1), row.cnt, productId]
  );
};

/**
 * Find reviews for a specific product (for ProductDetailPage).
 */
export const findReviewsByProduct = async (productId: number) => {
  const [rows] = await getDb().query(
    `SELECT r.id, r.order_id AS orderId, r.product_id AS productId, r.user_id AS userId,
            r.rating, r.comment, r.created_at AS createdAt,
            u.full_name AS userName, u.avatar_url AS userAvatar
     FROM reviews r
     LEFT JOIN users u ON u.id = r.user_id
     WHERE r.product_id = ?
     ORDER BY r.created_at DESC`,
    [productId]
  );
  return rows as ReviewRecord[];
};

/**
 * Check which products in a given order have already been reviewed by a user.
 * Returns an array of { productId, rating, comment }.
 */
export const findReviewsByOrderAndUser = async (orderId: number, userId: number) => {
  const [rows] = await getDb().query(
    `SELECT r.id, r.product_id AS productId, r.rating, r.comment, r.created_at AS createdAt
     FROM reviews r
     WHERE r.order_id = ? AND r.user_id = ?`,
    [orderId, userId]
  );
  return rows as Array<{ id: number; productId: number; rating: number; comment: string | null; createdAt: string }>;
};

/**
 * Find all reviews for admin management (paginated).
 */
export const findAllReviews = async (query: ListQuery) => {
  const where: string[] = [];
  const params: unknown[] = [];

  if (query.search) {
    where.push('(u.full_name LIKE ? OR p.name LIKE ? OR r.comment LIKE ?)');
    params.push(`%${query.search}%`, `%${query.search}%`, `%${query.search}%`);
  }

  for (const [key, value] of Object.entries(query.filter ?? {})) {
    if (key === 'rating') {
      where.push('r.rating = ?');
      params.push(value);
    }
    if (key === 'productId') {
      where.push('r.product_id = ?');
      params.push(value);
    }
  }

  const sortOrder = query.sortOrder === 'asc' ? 'ASC' : 'DESC';
  const offset = (query.page - 1) * query.limit;

  const whereSql = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';

  const [countRows] = await getDb().query(
    `SELECT COUNT(*) AS total FROM reviews r
     LEFT JOIN users u ON u.id = r.user_id
     LEFT JOIN products p ON p.id = r.product_id
     ${whereSql}`,
    params
  );
  const total = Number((countRows as Array<{ total: number }>)[0]?.total ?? 0);

  const [rows] = await getDb().query(
    `SELECT r.id, r.order_id AS orderId, r.product_id AS productId, r.user_id AS userId,
            r.rating, r.comment, r.created_at AS createdAt,
            p.name AS productName,
            (SELECT pi.image_url FROM product_images pi WHERE pi.product_id = p.id AND pi.is_primary = 1 LIMIT 1) AS productImage,
            u.full_name AS userName, u.email AS userEmail, u.avatar_url AS userAvatar,
            o.order_code AS orderCode
     FROM reviews r
     LEFT JOIN users u ON u.id = r.user_id
     LEFT JOIN products p ON p.id = r.product_id
     LEFT JOIN orders o ON o.id = r.order_id
     ${whereSql}
     ORDER BY r.created_at ${sortOrder}
     LIMIT ? OFFSET ?`,
    [...params, query.limit, offset]
  );

  return {
    items: rows as ReviewRecord[],
    meta: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / query.limit)),
    },
  };
};

/**
 * Delete a review (admin only).
 */
export const deleteReview = async (id: number) => {
  // Get the productId before deleting so we can recalculate
  const [rows] = await getDb().query('SELECT product_id FROM reviews WHERE id = ?', [id]);
  const review = (rows as Array<{ product_id: number }>)[0];
  if (!review) return false;

  const [result] = await getDb().execute('DELETE FROM reviews WHERE id = ?', [id]);
  const deleted = (result as any).affectedRows > 0;

  if (deleted) {
    await recalculateProductRating(review.product_id);
  }

  return deleted;
};
