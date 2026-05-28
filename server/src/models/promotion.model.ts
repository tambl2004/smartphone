import { getDatabaseConnection } from '../config/database.js';

export interface Promotion {
  id: number;
  code: string;
  discountType: 'percent' | 'fixed';
  discountValue: number;
  minOrderValue: number;
  maxDiscountAmount: number | null;
  startDate: string;
  endDate: string;
  usageLimit: number | null;
  usedCount: number;
  perUserLimit: number;
  isActive: boolean;
}

const mapRow = (row: any): Promotion => ({
  id: row.id,
  code: row.code,
  discountType: row.discount_type,
  discountValue: Number(row.discount_value),
  minOrderValue: Number(row.min_order_value),
  maxDiscountAmount: row.max_discount_amount ? Number(row.max_discount_amount) : null,
  startDate: row.start_date,
  endDate: row.end_date,
  usageLimit: row.usage_limit,
  usedCount: row.used_count,
  perUserLimit: row.per_user_limit,
  isActive: !!row.is_active,
});

export const getAllPromotions = async (activeOnly: boolean = false): Promise<Promotion[]> => {
  const db = getDatabaseConnection();
  let query = 'SELECT * FROM promotions';
  if (activeOnly) {
    query += ' WHERE is_active = 1 AND start_date <= NOW() AND end_date >= NOW()';
  }
  query += ' ORDER BY created_at DESC';
  const [rows] = await db.query(query);
  return (rows as any[]).map(mapRow);
};

export const getPromotionByCode = async (code: string): Promise<Promotion | null> => {
  const db = getDatabaseConnection();
  const [rows] = await db.query('SELECT * FROM promotions WHERE code = ?', [code]);
  const results = rows as any[];
  if (results.length === 0) return null;
  return mapRow(results[0]);
};

export const createPromotion = async (data: Partial<Promotion>): Promise<number> => {
  const db = getDatabaseConnection();
  const [result] = await db.execute(
    'INSERT INTO promotions (code, discount_type, discount_value, min_order_value, max_discount_amount, start_date, end_date, usage_limit, per_user_limit, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [
      data.code,
      data.discountType || 'fixed',
      data.discountValue || 0,
      data.minOrderValue || 0,
      data.maxDiscountAmount ?? null,
      data.startDate,
      data.endDate,
      data.usageLimit ?? null,
      data.perUserLimit ?? 1,
      data.isActive ? 1 : 0
    ]
  );
  return Number((result as any).insertId);
};

export const updatePromotion = async (id: number, data: Partial<Promotion>): Promise<void> => {
  const db = getDatabaseConnection();
  await db.execute(
    'UPDATE promotions SET code=?, discount_type=?, discount_value=?, min_order_value=?, max_discount_amount=?, start_date=?, end_date=?, usage_limit=?, per_user_limit=?, is_active=? WHERE id=?',
    [
      data.code,
      data.discountType || 'fixed',
      data.discountValue || 0,
      data.minOrderValue || 0,
      data.maxDiscountAmount ?? null,
      data.startDate,
      data.endDate,
      data.usageLimit ?? null,
      data.perUserLimit ?? 1,
      data.isActive ? 1 : 0,
      id
    ]
  );
};

export const deletePromotion = async (id: number): Promise<void> => {
  const db = getDatabaseConnection();
  await db.execute('DELETE FROM promotions WHERE id = ?', [id]);
};

export const getUserPromotionUsageCount = async (promotionId: number, userId: number): Promise<number> => {
  const db = getDatabaseConnection();
  const [rows] = await db.query('SELECT count(*) as count FROM promotion_usages WHERE promotion_id = ? AND user_id = ?', [promotionId, userId]);
  return Number((rows as any[])[0].count);
};
