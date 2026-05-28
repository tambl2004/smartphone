import { getDb } from './mysql.js';
import type { ProductRecord } from './product.model.js';

export type WishlistRow = ProductRecord & {
  primaryImageId: number | null;
  primaryImageUrl: string | null;
  primaryImageSortOrder: number | null;
  primaryImageIsPrimary: number | null;
};

const PRODUCT_SELECT = `
  p.id, p.slug, p.sku, p.name,
  p.category_id AS categoryId, c.name AS categoryName, c.slug AS categorySlug,
  p.brand AS brand,
  p.price, p.original_price AS originalPrice, p.discount_percent AS discountPercent,
  p.rating, p.reviews_count AS reviewsCount, p.stock,
  p.description, p.additional_specs AS additionalSpecs, p.featured, p.status,
  pi.id AS primaryImageId, pi.image_url AS primaryImageUrl, pi.sort_order AS primaryImageSortOrder, pi.is_primary AS primaryImageIsPrimary
`;

export const getWishlistItemsByUserId = async (userId: number) => {
  const [rows] = await getDb().query(
    `SELECT ${PRODUCT_SELECT}
     FROM wishlists w
     INNER JOIN products p ON p.id = w.product_id
     LEFT JOIN categories c ON c.id = p.category_id
     LEFT JOIN product_images pi ON pi.product_id = p.id AND pi.is_primary = 1
     WHERE w.user_id = ?
     ORDER BY w.created_at DESC`,
    [userId],
  );

  return rows as ProductRecord[];
};

export const toggleWishlistItem = async (userId: number, productId: number) => {
  const [existing] = await getDb().query(
    'SELECT 1 FROM wishlists WHERE user_id = ? AND product_id = ? LIMIT 1',
    [userId, productId],
  );

  if ((existing as unknown[]).length > 0) {
    await getDb().execute('DELETE FROM wishlists WHERE user_id = ? AND product_id = ?', [userId, productId]);
    return { added: false };
  }

  await getDb().execute('INSERT INTO wishlists (user_id, product_id) VALUES (?, ?)', [userId, productId]);
  return { added: true };
};

export const removeWishlistItem = async (userId: number, productId: number) => {
  await getDb().execute('DELETE FROM wishlists WHERE user_id = ? AND product_id = ?', [userId, productId]);
};
