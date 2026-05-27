import type { Request, Response } from 'express';
import { createUser, deleteUser, findUserById, findAllUsers, updateUser } from '../models/user.model.js';
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
  const id = await createUser(req.body);
  return sendSuccess(res, 201, 'User created', { id });
};

export const updateUserHandler = async (req: Request, res: Response) => {
  await updateUser(toNumber(req.params.id), req.body);
  return sendSuccess(res, 200, 'User updated', null);
};

export const deleteUserHandler = async (req: Request, res: Response) => {
  await deleteUser(toNumber(req.params.id));
  return sendSuccess(res, 200, 'User deleted', null);
};
