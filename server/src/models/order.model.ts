import { getDb } from './mysql.js';
import type { ListQuery } from '../utils/pagination.js';

export type OrderRecord = {
  id: number;
  orderCode: string;
  customerId: number | null;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  totalAmount: string;
  paymentMethod: 'cod' | 'bank_transfer' | 'credit_card' | 'wallet';
  status: 'pending' | 'confirmed' | 'shipping' | 'delivered' | 'cancelled';
  createdAt: string;
  updatedAt: string;
};

export const findAllOrders = async (query: ListQuery) => {
  const where: string[] = [];
  const params: unknown[] = [];

  if (query.search) {
    where.push('(order_code LIKE ? OR customer_name LIKE ? OR customer_email LIKE ?)');
    params.push(`%${query.search}%`, `%${query.search}%`, `%${query.search}%`);
  }

  for (const [key, value] of Object.entries(query.filter ?? {})) {
    if (['status', 'payment_method'].includes(key)) {
      where.push(`${key} = ?`);
      params.push(value);
    }
  }

  const allowedSort = new Set(['id', 'order_code', 'total_amount', 'status', 'created_at']);
  const sortBy = allowedSort.has(query.sortBy ?? '') ? query.sortBy! : 'id';
  const sortOrder = query.sortOrder === 'asc' ? 'ASC' : 'DESC';
  const offset = (query.page - 1) * query.limit;

  const whereSql = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';
  const [countRows] = await getDb().query(`SELECT COUNT(*) AS total FROM orders ${whereSql}`, params);
  const total = Number((countRows as Array<{ total: number }>)[0]?.total ?? 0);

  const [rows] = await getDb().query(
    `SELECT id, order_code AS orderCode, customer_id AS customerId, customer_name AS customerName, customer_email AS customerEmail, customer_phone AS customerPhone, shipping_address AS shippingAddress, total_amount AS totalAmount, payment_method AS paymentMethod, status, created_at AS createdAt, updated_at AS updatedAt FROM orders ${whereSql} ORDER BY ${sortBy} ${sortOrder} LIMIT ? OFFSET ?`,
    [...params, query.limit, offset],
  );

  return {
    items: rows as OrderRecord[],
    meta: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / query.limit)),
    },
  };
};
