import type { Request, Response } from 'express';
import { getUsers } from '../services/user.service.js';

export const listUsers = async (_req: Request, res: Response) => {
  const items = await getUsers();

  return res.status(200).json({
    items,
  });
};