import { getDb } from './mysql.js';
import type { ListQuery } from '../utils/pagination.js';

export type UserRecord = {
  id: number;
  fullName: string;
  email: string;
  phone: string | null;
  avatarUrl: string | null;
  dateOfBirth: string | null;
  passwordHash: string;
  role: 'admin' | 'user';
  status: 'active' | 'blocked';
};

export type UserWithOtp = UserRecord & {
  otpCode: string | null;
  otpExpiresAt: Date | null;
  isVerified: boolean;
};

export type UserPayload = {
  fullName: string;
  email: string;
  phone?: string | null;
  dateOfBirth?: string | null;
  passwordHash?: string;
  role?: UserRecord['role'];
  status?: UserRecord['status'];
  otp?: string | null;
  otpExpiresAt?: Date | null;
  isVerified?: boolean;
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
    `SELECT id, full_name AS fullName, email, phone, avatar_url AS avatarUrl, date_of_birth AS dateOfBirth, password_hash AS passwordHash, role, status FROM users ${whereSql} ORDER BY ${sortBy} ${sortOrder} LIMIT ? OFFSET ?`,
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
  const [rows] = await getDb().query(
    'SELECT id, full_name AS fullName, email, phone, avatar_url AS avatarUrl, date_of_birth AS dateOfBirth, password_hash AS passwordHash, role, status FROM users WHERE email = ? LIMIT 1',
    [email],
  );
  return (rows as UserRecord[])[0] ?? null;
};

export const findUserByEmailWithOtp = async (email: string) => {
  const [rows] = await getDb().query(
    `SELECT id, full_name AS fullName, email, phone, avatar_url AS avatarUrl, date_of_birth AS dateOfBirth, password_hash AS passwordHash,
            role, status, otp_code AS otpCode, otp_expires_at AS otpExpiresAt, is_verified AS isVerified
     FROM users WHERE email = ? LIMIT 1`,
    [email],
  );
  return (rows as UserWithOtp[])[0] ?? null;
};

export const findUserById = async (id: number) => {
  const [rows] = await getDb().query(
    'SELECT id, full_name AS fullName, email, phone, avatar_url AS avatarUrl, date_of_birth AS dateOfBirth, password_hash AS passwordHash, role, status FROM users WHERE id = ? LIMIT 1',
    [id],
  );
  return (rows as UserRecord[])[0] ?? null;
};

export const createUser = async (payload: UserPayload) => {
  const [result] = await getDb().execute(
    `INSERT INTO users (full_name, email, phone, password_hash, role, status, otp_code, otp_expires_at, is_verified)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      payload.fullName,
      payload.email,
      payload.phone ?? null,
      payload.passwordHash ?? '',
      payload.role ?? 'user',
      payload.status ?? 'active',
      payload.otp ?? null,
      payload.otpExpiresAt ?? null,
      payload.isVerified ? 1 : 0,
    ],
  );
  return Number((result as { insertId: number }).insertId);
};

export const updateUser = async (id: number, payload: UserPayload) => {
  await getDb().execute(
    'UPDATE users SET full_name = ?, email = ?, password_hash = COALESCE(?, password_hash), role = ?, status = ? WHERE id = ?',
    [payload.fullName, payload.email, payload.passwordHash ?? null, payload.role ?? 'user', payload.status ?? 'active', id],
  );
};

export const updateUserOtp = async (id: number, otp: string, expiresAt: Date) => {
  await getDb().execute(
    'UPDATE users SET otp_code = ?, otp_expires_at = ? WHERE id = ?',
    [otp, expiresAt, id],
  );
};

export const clearUserOtp = async (id: number, markVerified: boolean) => {
  await getDb().execute(
    'UPDATE users SET otp_code = NULL, otp_expires_at = NULL, is_verified = ? WHERE id = ?',
    [markVerified ? 1 : 0, id],
  );
};

export const updateUserPassword = async (id: number, passwordHash: string) => {
  await getDb().execute('UPDATE users SET password_hash = ? WHERE id = ?', [passwordHash, id]);
};

export const updateUserAvatar = async (id: number, avatarUrl: string) => {
  await getDb().execute('UPDATE users SET avatar_url = ? WHERE id = ?', [avatarUrl, id]);
};

export const deleteUser = async (id: number) => {
  await getDb().execute('DELETE FROM users WHERE id = ?', [id]);
};

export const updateUserProfile = async (id: number, phone: string, fullName: string, dateOfBirth: string | null) => {
  await getDb().execute('UPDATE users SET phone = ?, full_name = ?, date_of_birth = ? WHERE id = ?', [phone, fullName, dateOfBirth, id]);
};
