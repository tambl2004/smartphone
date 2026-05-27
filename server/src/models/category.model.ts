import { getDb } from './mysql.js';

export type CategoryRecord = {
  id: number;
  slug: string;
  name: string;
  icon: string | null;
};

export type CategoryPayload = {
  slug: string;
  name: string;
  icon?: string | null;
};

export const findAllCategories = async () => {
  const [rows] = await getDb().query('SELECT id, slug, name, icon FROM categories ORDER BY id DESC');
  return rows as CategoryRecord[];
};

export const findCategoryById = async (id: number) => {
  const [rows] = await getDb().query('SELECT id, slug, name, icon FROM categories WHERE id = ? LIMIT 1', [id]);
  return (rows as CategoryRecord[])[0] ?? null;
};

export const createCategory = async (payload: CategoryPayload) => {
  const [result] = await getDb().execute('INSERT INTO categories (slug, name, icon) VALUES (?, ?, ?)', [payload.slug, payload.name, payload.icon ?? null]);
  return Number((result as { insertId: number }).insertId);
};

export const updateCategory = async (id: number, payload: CategoryPayload) => {
  await getDb().execute('UPDATE categories SET slug = ?, name = ?, icon = ? WHERE id = ?', [payload.slug, payload.name, payload.icon ?? null, id]);
};

export const deleteCategory = async (id: number) => {
  await getDb().execute('DELETE FROM categories WHERE id = ?', [id]);
};
