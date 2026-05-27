import { getDb } from './mysql.js';

type CountRow = { value: number };

const getCount = async (table: string) => {
  const [rows] = await getDb().query(`SELECT COUNT(*) AS value FROM ${table}`);
  const [row] = rows as CountRow[];

  return Number(row?.value ?? 0);
};

export const getDashboardSummary = async () => {
  const [products, categories, brands, customers, orders] = await Promise.all([
    getCount('products'),
    getCount('categories'),
    getCount('brands'),
    getCount('customers'),
    getCount('orders'),
  ]);

  return {
    products,
    categories,
    brands,
    customers,
    orders,
  };
};
