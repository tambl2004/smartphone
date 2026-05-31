import type { Request, Response } from 'express';
import { createUser, deleteUser, findUserById, findAllUsers, updateUser, findUserByEmail } from '../models/user.model.js';
import bcrypt from 'bcryptjs';
import { sendError, sendSuccess } from '../utils/api-response.js';
import { parseListQuery } from '../utils/pagination.js';

const toNumber = (value: string | string[] | undefined) => Number(Array.isArray(value) ? value[0] : value);

export const listUsers = async (req: Request, res: Response) => {
  const result = await findAllUsers(parseListQuery(req.query as Record<string, unknown>));
  return sendSuccess(res, 200, 'Users retrieved successfully', result);
};

export const detailUser = async (req: Request, res: Response) => {
  const item = await findUserById(toNumber(req.params.id));
  if (!item) return sendError(res, 404, 'User not found');
  return sendSuccess(res, 200, 'User found', { item });
};

export const createUserHandler = async (req: Request, res: Response) => {
  const existing = await findUserByEmail(req.body.email);
  if (existing) {
    return sendError(res, 400, 'Email đã được sử dụng');
  }

  const payload = { ...req.body, isVerified: true };
  if (req.body.password) {
    payload.passwordHash = await bcrypt.hash(req.body.password, 10);
  } else {
    payload.passwordHash = await bcrypt.hash('12345678', 10);
  }
  
  const id = await createUser(payload);
  return sendSuccess(res, 201, 'User created', { id });
};

export const updateUserHandler = async (req: Request, res: Response) => {
  const userId = toNumber(req.params.id);
  const user = await findUserById(userId);
  if (!user) return sendError(res, 404, 'Không tìm thấy tài khoản');
  if (user.role === 'admin') return sendError(res, 403, 'Không thể sửa tài khoản admin');

  const payload = { ...req.body };
  if (req.body.password) {
    payload.passwordHash = await bcrypt.hash(req.body.password, 10);
  }
  await updateUser(userId, payload);
  return sendSuccess(res, 200, 'User updated', null);
};

export const deleteUserHandler = async (req: Request, res: Response) => {
  const userId = toNumber(req.params.id);
  const user = await findUserById(userId);
  if (!user) return sendError(res, 404, 'Không tìm thấy tài khoản');
  if (user.role === 'admin') return sendError(res, 403, 'Không thể xóa tài khoản admin');

  await deleteUser(userId);
  return sendSuccess(res, 200, 'User deleted', null);
};
