import { getDb } from './mysql.js';
import type { ProductRecord } from './product.model.js';

export type CartRow = ProductRecord & {
  productId: number;
  quantity: number;
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

export const getCartItemsByUserId = async (userId: number) => {
  const [rows] = await getDb().query(
    `SELECT ci.product_id AS productId, ci.quantity,
            ${PRODUCT_SELECT}
     FROM carts ci
     INNER JOIN products p ON p.id = ci.product_id
     LEFT JOIN categories c ON c.id = p.category_id
     LEFT JOIN product_images pi ON pi.product_id = p.id AND pi.is_primary = 1
     WHERE ci.user_id = ?
     ORDER BY ci.created_at DESC`,
    [userId],
  );

  return rows as CartRow[];
};

export const upsertCartItem = async (userId: number, productId: number, quantity: number) => {
  await getDb().execute(
    `INSERT INTO carts (user_id, product_id, quantity)
     VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE quantity = VALUES(quantity), updated_at = CURRENT_TIMESTAMP`,
    [userId, productId, quantity],
  );
};

export const removeCartItem = async (userId: number, productId: number) => {
  await getDb().execute('DELETE FROM carts WHERE user_id = ? AND product_id = ?', [userId, productId]);
};

export const clearCartByUserId = async (userId: number) => {
  await getDb().execute('DELETE FROM carts WHERE user_id = ?', [userId]);
};
