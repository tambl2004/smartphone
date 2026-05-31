import { getDb } from './mysql.js';
import type { Connection } from 'mysql2/promise';
import type { ListQuery } from '../utils/pagination.js';

export type OrderRecord = {
  id: number;
  orderCode: string;
  customerId: number | null;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  subtotalAmount: string;
  discountAmount: string;
  promotionCode: string | null;
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
    `SELECT id, order_code AS orderCode, customer_id AS customerId, customer_name AS customerName, customer_email AS customerEmail, customer_phone AS customerPhone, shipping_address AS shippingAddress, subtotal_amount AS subtotalAmount, discount_amount AS discountAmount, promotion_code AS promotionCode, total_amount AS totalAmount, payment_method AS paymentMethod, status, created_at AS createdAt, updated_at AS updatedAt FROM orders ${whereSql} ORDER BY ${sortBy} ${sortOrder} LIMIT ? OFFSET ?`,
    [...params, query.limit, offset],
  );

  const orders = rows as any[];
  
  if (orders.length > 0) {
    const orderIds = orders.map((o) => o.id);
    const [itemRows] = await getDb().query(
      `SELECT order_id, product_id AS productId, product_name AS productName, product_image_url AS productImage, quantity, unit_price AS unitPrice, line_total AS lineTotal
       FROM order_items WHERE order_id IN (?)`,
      [orderIds]
    );

    const itemsByOrder = (itemRows as any[]).reduce((acc: any, item: any) => {
      if (!acc[item.order_id]) acc[item.order_id] = [];
      acc[item.order_id].push({
        productId: item.productId,
        productName: item.productName,
        productImage: item.productImage,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        lineTotal: item.lineTotal,
      });
      return acc;
    }, {});

    orders.forEach(o => {
      o.items = itemsByOrder[o.id] || [];
    });
  }

  return {
    items: orders as OrderRecord[],
    meta: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / query.limit)),
    },
  };
};

export const updateOrderStatus = async (id: number, status: string) => {
  const [result] = await getDb().query(
    'UPDATE orders SET status = ? WHERE id = ?',
    [status, id]
  );
  return (result as any).affectedRows > 0;
};

export const deleteOrder = async (id: number) => {
  const db = getDb();
  try {
    await db.beginTransaction();
    await db.query('DELETE FROM order_items WHERE order_id = ?', [id]);
    const [result] = await db.query('DELETE FROM orders WHERE id = ?', [id]);
    await db.commit();
    return (result as any).affectedRows > 0;
  } catch (error) {
    await db.rollback();
    throw error;
  }
};

export const createOrder = async (
  userId: number,
  orderData: {
    orderCode: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    shippingAddress: string;
    subtotalAmount: number;
    discountAmount: number;
    totalAmount: number;
    paymentMethod: string;
    promotionId?: number;
    promotionCode?: string;
    cartItems: { productId: number; productName: string; productImage: string; quantity: number; unitPrice: number; lineTotal: number }[];
  }
) => {
  const db = getDb();
  try {
    await db.beginTransaction();

    // 1. Use userId directly as customer_id (users table = customers)
    const customerId = userId;

    // 2. Insert order
    const [orderResult] = await db.query(
      `INSERT INTO orders (order_code, customer_id, customer_name, customer_email, customer_phone, shipping_address, subtotal_amount, discount_amount, total_amount, payment_method, promotion_code, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [orderData.orderCode, customerId, orderData.customerName, orderData.customerEmail, orderData.customerPhone, orderData.shippingAddress, orderData.subtotalAmount, orderData.discountAmount, orderData.totalAmount, orderData.paymentMethod, orderData.promotionCode || null]
    );
    const orderId = (orderResult as any).insertId;

    // 2. Insert order items
    for (const item of orderData.cartItems) {
      await db.query(
        `INSERT INTO order_items (order_id, product_id, product_name, product_image_url, quantity, unit_price, line_total) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [orderId, item.productId, item.productName, item.productImage, item.quantity, item.unitPrice, item.lineTotal]
      );
      
      // Decrease stock
      await db.query(`UPDATE products SET stock = GREATEST(0, stock - ?) WHERE id = ?`, [item.quantity, item.productId]);
    }

    // 3. Handle promotion
    if (orderData.promotionId) {
      await db.query(
        `INSERT INTO promotion_usages (promotion_id, user_id, order_id) VALUES (?, ?, ?)`,
        [orderData.promotionId, userId, orderId]
      );
      await db.query(`UPDATE promotions SET used_count = used_count + 1 WHERE id = ?`, [orderData.promotionId]);
    }

    // 4. Clear cart
    await db.query(`DELETE FROM carts WHERE user_id = ?`, [userId]);

    await db.commit();
    return orderId;
  } catch (error) {
    await db.rollback();
    throw error;
  }
};

export const findMyOrders = async (userId: number) => {
  const [rows] = await getDb().query(
    `SELECT id, order_code AS orderCode, subtotal_amount AS subtotalAmount, discount_amount AS discountAmount, promotion_code AS promotionCode, total_amount AS totalAmount, status, payment_method AS paymentMethod, shipping_address AS shippingAddress, customer_phone AS customerPhone, customer_name AS customerName, created_at AS createdAt 
     FROM orders 
     WHERE customer_id = ?
     ORDER BY created_at DESC`,
    [userId]
  );
  
  const orders = rows as any[];
  if (orders.length === 0) return [];

  const orderIds = orders.map((o) => o.id);
  const [itemRows] = await getDb().query(
    `SELECT order_id, product_id AS productId, product_name AS productName, product_image_url AS productImage, quantity, unit_price AS unitPrice, line_total AS lineTotal
     FROM order_items WHERE order_id IN (?)`,
    [orderIds]
  );

  const itemsByOrder = (itemRows as any[]).reduce((acc: any, item: any) => {
    if (!acc[item.order_id]) acc[item.order_id] = [];
    acc[item.order_id].push({
      productId: item.productId,
      productName: item.productName,
      productImage: item.productImage,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      lineTotal: item.lineTotal,
    });
    return acc;
  }, {});

  return orders.map((o) => ({
    ...o,
    items: itemsByOrder[o.id] || [],
  }));
};
