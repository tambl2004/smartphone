import { getDatabaseConnection } from '../config/database.js';

export interface FAQ {
  id: number;
  question: string;
  answer: string;
  sortOrder: number;
  isActive: boolean;
}

export const getAllFAQs = async (activeOnly: boolean = false): Promise<FAQ[]> => {
  const db = getDatabaseConnection();
  let query = 'SELECT id, question, answer, sort_order as sortOrder, is_active as isActive FROM faqs';
  if (activeOnly) {
    query += ' WHERE is_active = 1';
  }
  query += ' ORDER BY sort_order ASC';
  const [rows] = await db.query(query);
  return rows as FAQ[];
};

export const createFAQ = async (data: Partial<FAQ>): Promise<number> => {
  const db = getDatabaseConnection();
  const [result] = await db.execute(
    'INSERT INTO faqs (question, answer, sort_order, is_active) VALUES (?, ?, ?, ?)',
    [data.question ?? null, data.answer ?? null, data.sortOrder ?? 0, data.isActive ? 1 : 0]
  );
  return Number((result as any).insertId);
};

export const updateFAQ = async (id: number, data: Partial<FAQ>): Promise<void> => {
  const db = getDatabaseConnection();
  await db.execute(
    'UPDATE faqs SET question = ?, answer = ?, sort_order = ?, is_active = ? WHERE id = ?',
    [data.question ?? null, data.answer ?? null, data.sortOrder ?? 0, data.isActive ? 1 : 0, id]
  );
};

export const deleteFAQ = async (id: number): Promise<void> => {
  const db = getDatabaseConnection();
  await db.execute('DELETE FROM faqs WHERE id = ?', [id]);
};
