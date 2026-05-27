import { getDb } from './mysql.js';

export type BrandRecord = {
  id: number;
  slug: string;
  name: string;
  logoUrl: string | null;
};

export type BrandPayload = {
  slug: string;
  name: string;
  logoUrl?: string | null;
};

export const findAllBrands = async () => {
  const [rows] = await getDb().query('SELECT id, slug, name, logo_url AS logoUrl FROM brands ORDER BY id DESC');
  return rows as BrandRecord[];
};

export const findBrandById = async (id: number) => {
  const [rows] = await getDb().query('SELECT id, slug, name, logo_url AS logoUrl FROM brands WHERE id = ? LIMIT 1', [id]);
  return (rows as BrandRecord[])[0] ?? null;
};

export const createBrand = async (payload: BrandPayload) => {
  const [result] = await getDb().execute('INSERT INTO brands (slug, name, logo_url) VALUES (?, ?, ?)', [payload.slug, payload.name, payload.logoUrl ?? null]);
  return Number((result as { insertId: number }).insertId);
};

export const updateBrand = async (id: number, payload: BrandPayload) => {
  await getDb().execute('UPDATE brands SET slug = ?, name = ?, logo_url = ? WHERE id = ?', [payload.slug, payload.name, payload.logoUrl ?? null, id]);
};

export const deleteBrand = async (id: number) => {
  await getDb().execute('DELETE FROM brands WHERE id = ?', [id]);
};
