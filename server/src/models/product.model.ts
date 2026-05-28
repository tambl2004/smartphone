import { getDb } from './mysql.js';
import type { ListQuery } from '../utils/pagination.js';

export type ProductRecord = {
  id: number;
  slug: string;
  sku: string | null;
  name: string;
  categoryId: number;
  categoryName: string;
  categorySlug: string;
  brand: string;
  price: string;
  originalPrice: string | null;
  discountPercent: number;
  rating: string;
  reviewsCount: number;
  stock: number;
  description: string | null;
  featured: number;
  status: 'active' | 'draft' | 'out_of_stock' | 'hidden';
  additionalSpecs: any;
  images: Array<{ id: number; imageUrl: string; sortOrder: number; isPrimary: number }>;
  specs: Array<{ specName: string; specValue: string; sortOrder: number }>;
};

export type ProductPayload = {
  slug: string;
  sku?: string | null;
  name: string;
  categoryId: number;
  brand: string;
  price: number;
  originalPrice?: number | null;
  discountPercent?: number;
  rating?: number;
  reviewsCount?: number;
  stock?: number;
  description?: string | null;
  additionalSpecs?: any;
  featured?: boolean;
  status?: ProductRecord['status'];
  images?: Array<{ imageUrl: string; sortOrder?: number; isPrimary?: boolean }>;
  specs?: Array<{ specName: string; specValue: string; sortOrder?: number }>;
};

const BASE_SELECT = `
  p.id, p.slug, p.sku, p.name,
  p.category_id AS categoryId, c.name AS categoryName, c.slug AS categorySlug,
  p.brand AS brand,
  p.price, p.original_price AS originalPrice, p.discount_percent AS discountPercent,
  p.rating, p.reviews_count AS reviewsCount, p.stock,
  p.description, p.additional_specs AS additionalSpecs, p.featured, p.status
`;

type RawProductRow = Omit<ProductRecord, 'images' | 'specs'>;

async function attachImagesAndSpecs(products: RawProductRow[]): Promise<ProductRecord[]> {
  if (products.length === 0) return [];

  const ids = products.map((p) => p.id);
  const placeholders = ids.map(() => '?').join(', ');

  const [imgRows] = await getDb().query(
    `SELECT product_id AS productId, id, image_url AS imageUrl, sort_order AS sortOrder, is_primary AS isPrimary
     FROM product_images WHERE product_id IN (${placeholders}) ORDER BY sort_order ASC`,
    ids,
  );

  const [specRows] = await getDb().query(
    `SELECT product_id AS productId, spec_name AS specName, spec_value AS specValue, sort_order AS sortOrder
     FROM product_specs WHERE product_id IN (${placeholders}) ORDER BY sort_order ASC`,
    ids,
  );

  const imgMap = new Map<number, ProductRecord['images']>();
  const specMap = new Map<number, ProductRecord['specs']>();

  for (const row of imgRows as Array<{ productId: number; id: number; imageUrl: string; sortOrder: number; isPrimary: number }>) {
    if (!imgMap.has(row.productId)) imgMap.set(row.productId, []);
    imgMap.get(row.productId)!.push({ id: row.id, imageUrl: row.imageUrl, sortOrder: row.sortOrder, isPrimary: row.isPrimary });
  }

  for (const row of specRows as Array<{ productId: number; specName: string; specValue: string; sortOrder: number }>) {
    if (!specMap.has(row.productId)) specMap.set(row.productId, []);
    specMap.get(row.productId)!.push({ specName: row.specName, specValue: row.specValue, sortOrder: row.sortOrder });
  }

  return products.map((p) => ({
    ...p,
    images: imgMap.get(p.id) ?? [],
    specs: specMap.get(p.id) ?? [],
  }));
}

export const findAllProducts = async (query: ListQuery) => {
  const where: string[] = [];
  const params: unknown[] = [];

  if (query.search) {
    where.push('(p.name LIKE ? OR p.slug LIKE ?)');
    params.push(`%${query.search}%`, `%${query.search}%`);
  }

  for (const [key, value] of Object.entries(query.filter ?? {})) {
    if (key === 'status') {
      where.push('p.status = ?');
      params.push(value);
    }
    if (key === 'categoryId') {
      where.push('p.category_id = ?');
      params.push(value);
    }
    if (key === 'brand') {
      where.push('p.brand = ?');
      params.push(value);
    }
  }

  const allowedSort = new Set(['id', 'name', 'price', 'stock', 'rating', 'created_at']);
  const sortBy = allowedSort.has(query.sortBy ?? '') ? `p.${query.sortBy!}` : 'p.id';
  const sortOrder = query.sortOrder === 'asc' ? 'ASC' : 'DESC';
  const offset = (query.page - 1) * query.limit;

  const whereSql = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';

  const [countRows] = await getDb().query(
    `SELECT COUNT(*) AS total FROM products p
     LEFT JOIN categories c ON c.id = p.category_id
     ${whereSql}`,
    params,
  );
  const total = Number((countRows as Array<{ total: number }>)[0]?.total ?? 0);

  const [rows] = await getDb().query(
    `SELECT ${BASE_SELECT}
     FROM products p
     LEFT JOIN categories c ON c.id = p.category_id
     ${whereSql} ORDER BY ${sortBy} ${sortOrder} LIMIT ? OFFSET ?`,
    [...params, query.limit, offset],
  );

  const items = await attachImagesAndSpecs(rows as RawProductRow[]);

  return {
    items,
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
    `SELECT ${BASE_SELECT}
     FROM products p
     LEFT JOIN categories c ON c.id = p.category_id
     WHERE p.id = ? LIMIT 1`,
    [id],
  );
  const raw = (rows as RawProductRow[])[0] ?? null;
  if (!raw) return null;
  const [full] = await attachImagesAndSpecs([raw]);
  return full;
};

export const findProductBySlug = async (slug: string) => {
  const [rows] = await getDb().query(
    `SELECT ${BASE_SELECT}
     FROM products p
     LEFT JOIN categories c ON c.id = p.category_id
     WHERE p.slug = ? LIMIT 1`,
    [slug],
  );
  const raw = (rows as RawProductRow[])[0] ?? null;
  if (!raw) return null;
  const [full] = await attachImagesAndSpecs([raw]);
  return full;
};

export const createProduct = async (payload: ProductPayload) => {
  const db = getDb();
  const additionalSpecsStr = payload.additionalSpecs ? JSON.stringify(payload.additionalSpecs) : null;
  const [result] = await db.execute(
    'INSERT INTO products (slug, sku, name, category_id, brand, price, original_price, discount_percent, rating, reviews_count, stock, description, additional_specs, featured, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [payload.slug, payload.sku ?? null, payload.name, payload.categoryId, payload.brand, payload.price, payload.originalPrice ?? null, payload.discountPercent ?? 0, payload.rating ?? 0, payload.reviewsCount ?? 0, payload.stock ?? 0, payload.description ?? null, additionalSpecsStr, payload.featured ? 1 : 0, payload.status ?? 'active'],
  );
  const insertId = Number((result as { insertId: number }).insertId);

  if (payload.images && payload.images.length > 0) {
    for (const img of payload.images) {
      if (img.imageUrl) {
        await db.execute(
          'INSERT INTO product_images (product_id, image_url, sort_order, is_primary) VALUES (?, ?, ?, ?)',
          [insertId, img.imageUrl, img.sortOrder ?? 0, img.isPrimary ? 1 : 0]
        );
      }
    }
  }

  if (payload.specs && payload.specs.length > 0) {
    for (const spec of payload.specs) {
      if (spec.specName && spec.specValue) {
        await db.execute(
          'INSERT INTO product_specs (product_id, spec_name, spec_value, sort_order) VALUES (?, ?, ?, ?)',
          [insertId, spec.specName, spec.specValue, spec.sortOrder ?? 0]
        );
      }
    }
  }

  return insertId;
};

export const updateProduct = async (id: number, payload: ProductPayload) => {
  const db = getDb();
  const additionalSpecsStr = payload.additionalSpecs ? JSON.stringify(payload.additionalSpecs) : null;
  await db.execute(
    'UPDATE products SET slug = ?, sku = ?, name = ?, category_id = ?, brand = ?, price = ?, original_price = ?, discount_percent = ?, rating = ?, reviews_count = ?, stock = ?, description = ?, additional_specs = ?, featured = ?, status = ? WHERE id = ?',
    [payload.slug, payload.sku ?? null, payload.name, payload.categoryId, payload.brand, payload.price, payload.originalPrice ?? null, payload.discountPercent ?? 0, payload.rating ?? 0, payload.reviewsCount ?? 0, payload.stock ?? 0, payload.description ?? null, additionalSpecsStr, payload.featured ? 1 : 0, payload.status ?? 'active', id],
  );

  if (payload.images) {
    await db.execute('DELETE FROM product_images WHERE product_id = ?', [id]);
    for (const img of payload.images) {
      if (img.imageUrl) {
        await db.execute(
          'INSERT INTO product_images (product_id, image_url, sort_order, is_primary) VALUES (?, ?, ?, ?)',
          [id, img.imageUrl, img.sortOrder ?? 0, img.isPrimary ? 1 : 0]
        );
      }
    }
  }

  if (payload.specs) {
    await db.execute('DELETE FROM product_specs WHERE product_id = ?', [id]);
    for (const spec of payload.specs) {
      if (spec.specName && spec.specValue) {
        await db.execute(
          'INSERT INTO product_specs (product_id, spec_name, spec_value, sort_order) VALUES (?, ?, ?, ?)',
          [id, spec.specName, spec.specValue, spec.sortOrder ?? 0]
        );
      }
    }
  }
};

export const deleteProduct = async (id: number) => {
  await getDb().execute('DELETE FROM products WHERE id = ?', [id]);
};
