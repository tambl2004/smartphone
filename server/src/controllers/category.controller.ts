import type { Request, Response } from 'express';
import { getCategories } from '../services/category.service.js';

export const listCategories = async (_req: Request, res: Response) => {
  const items = await getCategories();

  return res.status(200).json({
    items,
  });
};