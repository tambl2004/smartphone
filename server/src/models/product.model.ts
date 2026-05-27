import { getDb } from './mysql.js';
import type { ListQuery } from '../utils/pagination.js';

export type ProductRecord = {
  id: number;
  slug: string;
  sku: string | null;
  name: string;
  categoryId: number;
  brandId: number;
  price: string;
  originalPrice: string | null;
  discountPercent: number;
  rating: string;
  reviewsCount: number;
  stock: number;
  description: string | null;
  featured: number;
  status: 'active' | 'draft' | 'out_of_stock' | 'hidden';
};

export type ProductPayload = {
  slug: string;
  sku?: string | null;
  name: string;
  categoryId: number;
  brandId: number;
  price: number;
  originalPrice?: number | null;
  discountPercent?: number;
  rating?: number;
  reviewsCount?: number;
  stock?: number;
  description?: string | null;
  featured?: boolean;
  status?: ProductRecord['status'];
};

export const findAllProducts = async (query: ListQuery) => {
  const where: string[] = [];
  const params: unknown[] = [];

  if (query.search) {
    where.push('(name LIKE ? OR slug LIKE ?)');
    params.push(`%${query.search}%`, `%${query.search}%`);
  }

  for (const [key, value] of Object.entries(query.filter ?? {})) {
    if (['status'].includes(key)) {
      where.push(`${key} = ?`);
      params.push(value);
    }
  }

  const allowedSort = new Set(['id', 'name', 'price', 'stock', 'rating', 'created_at']);
  const sortBy = allowedSort.has(query.sortBy ?? '') ? query.sortBy! : 'id';
  const sortOrder = query.sortOrder === 'asc' ? 'ASC' : 'DESC';
  const offset = (query.page - 1) * query.limit;

  const whereSql = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';
  const [countRows] = await getDb().query(`SELECT COUNT(*) AS total FROM products ${whereSql}`, params);
  const total = Number((countRows as Array<{ total: number }>)[0]?.total ?? 0);

  const [rows] = await getDb().query(
    `SELECT id, slug, sku, name, category_id AS categoryId, brand_id AS brandId, price, original_price AS originalPrice, discount_percent AS discountPercent, rating, reviews_count AS reviewsCount, stock, description, featured, status FROM products ${whereSql} ORDER BY ${sortBy} ${sortOrder} LIMIT ? OFFSET ?`,
    [...params, query.limit, offset],
  );

  return {
    items: rows as ProductRecord[],
    meta: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / query.limit)),
    },
  };
};

export const findProductById = async (id: number) => {
  const [rows] = await getDb().query(
    'SELECT id, slug, sku, name, category_id AS categoryId, brand_id AS brandId, price, original_price AS originalPrice, discount_percent AS discountPercent, rating, reviews_count AS reviewsCount, stock, description, featured, status FROM products WHERE id = ? LIMIT 1',
    [id],
  );
  return (rows as ProductRecord[])[0] ?? null;
};

export const createProduct = async (payload: ProductPayload) => {
  const db = getDb();
  const [result] = await db.execute(
    'INSERT INTO products (slug, sku, name, category_id, brand_id, price, original_price, discount_percent, rating, reviews_count, stock, description, featured, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [payload.slug, payload.sku ?? null, payload.name, payload.categoryId, payload.brandId, payload.price, payload.originalPrice ?? null, payload.discountPercent ?? 0, payload.rating ?? 0, payload.reviewsCount ?? 0, payload.stock ?? 0, payload.description ?? null, payload.featured ? 1 : 0, payload.status ?? 'active'],
  );
  return Number((result as { insertId: number }).insertId);
};

export const updateProduct = async (id: number, payload: ProductPayload) => {
  await getDb().execute(
    'UPDATE products SET slug = ?, sku = ?, name = ?, category_id = ?, brand_id = ?, price = ?, original_price = ?, discount_percent = ?, rating = ?, reviews_count = ?, stock = ?, description = ?, featured = ?, status = ? WHERE id = ?',
    [payload.slug, payload.sku ?? null, payload.name, payload.categoryId, payload.brandId, payload.price, payload.originalPrice ?? null, payload.discountPercent ?? 0, payload.rating ?? 0, payload.reviewsCount ?? 0, payload.stock ?? 0, payload.description ?? null, payload.featured ? 1 : 0, payload.status ?? 'active', id],
  );
};

export const deleteProduct = async (id: number) => {
  await getDb().execute('DELETE FROM products WHERE id = ?', [id]);
};
