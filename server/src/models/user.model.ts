import { getDb } from './mysql.js';
import type { ListQuery } from '../utils/pagination.js';

export type UserRecord = {
  id: number;
  fullName: string;
  email: string;
  passwordHash: string;
  role: 'admin' | 'user';
  status: 'active' | 'blocked';
};

export type UserPayload = {
  fullName: string;
  email: string;
  passwordHash?: string;
  role?: UserRecord['role'];
  status?: UserRecord['status'];
};

export const findAllUsers = async (query: ListQuery) => {
  const where: string[] = [];
  const params: unknown[] = [];

  if (query.search) {
    where.push('(full_name LIKE ? OR email LIKE ?)');
    params.push(`%${query.search}%`, `%${query.search}%`);
  }

  for (const [key, value] of Object.entries(query.filter ?? {})) {
    if (['role', 'status'].includes(key)) {
      where.push(`${key} = ?`);
      params.push(value);
    }
  }

  const allowedSort = new Set(['id', 'full_name', 'email', 'role', 'status']);
  const sortBy = allowedSort.has(query.sortBy ?? '') ? query.sortBy! : 'id';
  const sortOrder = query.sortOrder === 'asc' ? 'ASC' : 'DESC';
  const offset = (query.page - 1) * query.limit;

  const whereSql = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';
  const [countRows] = await getDb().query(`SELECT COUNT(*) AS total FROM users ${whereSql}`, params);
  const total = Number((countRows as Array<{ total: number }>)[0]?.total ?? 0);

  const [rows] = await getDb().query(
    `SELECT id, full_name AS fullName, email, password_hash AS passwordHash, role, status FROM users ${whereSql} ORDER BY ${sortBy} ${sortOrder} LIMIT ? OFFSET ?`,
    [...params, query.limit, offset],
  );

  return {
    items: rows as UserRecord[],
    meta: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / query.limit)),
    },
  };
};

export const findUserByEmail = async (email: string) => {
  const [rows] = await getDb().query('SELECT id, full_name AS fullName, email, password_hash AS passwordHash, role, status FROM users WHERE email = ? LIMIT 1', [email]);
  return (rows as UserRecord[])[0] ?? null;
};

export const findUserById = async (id: number) => {
  const [rows] = await getDb().query('SELECT id, full_name AS fullName, email, password_hash AS passwordHash, role, status FROM users WHERE id = ? LIMIT 1', [id]);
  return (rows as UserRecord[])[0] ?? null;
};

export const createUser = async (payload: UserPayload) => {
  const [result] = await getDb().execute('INSERT INTO users (full_name, email, password_hash, role, status) VALUES (?, ?, ?, ?, ?)', [payload.fullName, payload.email, payload.passwordHash ?? '', payload.role ?? 'user', payload.status ?? 'active']);
  return Number((result as { insertId: number }).insertId);
};

export const updateUser = async (id: number, payload: UserPayload) => {
  await getDb().execute('UPDATE users SET full_name = ?, email = ?, password_hash = COALESCE(?, password_hash), role = ?, status = ? WHERE id = ?', [payload.fullName, payload.email, payload.passwordHash ?? null, payload.role ?? 'user', payload.status ?? 'active', id]);
};

export const deleteUser = async (id: number) => {
  await getDb().execute('DELETE FROM users WHERE id = ?', [id]);
};
