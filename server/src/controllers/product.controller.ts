import type { Request, Response } from 'express';
import { getProducts } from '../services/product.service.js';

export const listProducts = async (_req: Request, res: Response) => {
  const items = await getProducts();

  return res.status(200).json({
    items,
  });
};