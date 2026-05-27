import { getDb } from './mysql.js';

export type CustomerRecord = {
  id: number;
  code: string;
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

export const findAllCustomers = async () => {
  const [rows] = await getDb().query(
    'SELECT id, code, full_name AS fullName, email, phone, avatar_url AS avatarUrl, total_orders AS totalOrders, total_spent AS totalSpent, status, join_date AS joinDate, last_order_date AS lastOrderDate FROM customers ORDER BY id DESC',
  );

  return rows as CustomerRecord[];
};
