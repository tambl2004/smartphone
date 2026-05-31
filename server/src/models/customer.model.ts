import { getDb } from './mysql.js';

export type CustomerRecord = {
  id: number;
  fullName: string;
  email: string;
  phone: string | null;
  avatarUrl: string | null;
  totalOrders: number;
  totalSpent: string;
  status: 'active' | 'blocked';
  joinDate: string | null;
  lastOrderDate: string | null;
};

export const findAllCustomers = async (search?: string, status?: string) => {
  const where: string[] = ["u.role = 'user'"];
  const params: unknown[] = [];

  if (search) {
    where.push('(u.full_name LIKE ? OR u.email LIKE ? OR u.phone LIKE ?)');
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  if (status && status !== 'all') {
    where.push('u.status = ?');
    params.push(status);
  }

  const whereSql = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';

  const [rows] = await getDb().query(
    `SELECT 
      u.id,
      u.full_name AS fullName,
      u.email,
      u.phone,
      u.avatar_url AS avatarUrl,
      COALESCE(stats.total_orders, 0) AS totalOrders,
      COALESCE(stats.total_spent, 0) AS totalSpent,
      u.status,
      DATE(u.created_at) AS joinDate,
      stats.last_order_date AS lastOrderDate
    FROM users u
    LEFT JOIN (
      SELECT 
        customer_id,
        COUNT(CASE WHEN status != 'cancelled' THEN 1 END) AS total_orders,
        SUM(CASE WHEN status = 'delivered' THEN total_amount ELSE 0 END) AS total_spent,
        MAX(DATE(created_at)) AS last_order_date
      FROM orders
      GROUP BY customer_id
    ) stats ON stats.customer_id = u.id
    ${whereSql}
    ORDER BY u.id DESC`,
    params,
  );

  return rows as CustomerRecord[];
};

export const updateCustomerStatus = async (id: number, status: 'active' | 'blocked') => {
  const [result] = await getDb().execute(
    'UPDATE users SET status = ? WHERE id = ? AND role = ?',
    [status, id, 'user'],
  );
  return (result as any).affectedRows > 0;
};

export const findCustomerById = async (id: number) => {
  const [rows] = await getDb().query(
    `SELECT 
      u.id,
      u.full_name AS fullName,
      u.email,
      u.phone,
      u.avatar_url AS avatarUrl,
      u.status,
      DATE(u.created_at) AS joinDate
    FROM users u
    WHERE u.id = ? AND u.role = 'user'
    LIMIT 1`,
    [id],
  );
  return (rows as CustomerRecord[])[0] ?? null;
};

export const findCustomerOrders = async (customerId: number) => {
  const [rows] = await getDb().query(
    `SELECT 
      o.id, 
      o.order_code AS orderCode,
      o.total_amount AS totalAmount,
      o.status,
      o.payment_method AS paymentMethod,
      o.created_at AS createdAt
    FROM orders o
    WHERE o.customer_id = ?
    ORDER BY o.created_at DESC
    LIMIT 20`,
    [customerId],
  );

  const orders = rows as any[];
  if (orders.length === 0) return [];

  const orderIds = orders.map((o) => o.id);
  const [itemRows] = await getDb().query(
    `SELECT order_id, product_name AS productName, product_image_url AS productImage, quantity, unit_price AS unitPrice, line_total AS lineTotal
     FROM order_items WHERE order_id IN (?)`,
    [orderIds],
  );

  const itemsByOrder = (itemRows as any[]).reduce((acc: any, item: any) => {
    if (!acc[item.order_id]) acc[item.order_id] = [];
    acc[item.order_id].push({
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
