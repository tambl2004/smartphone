import type { Request, Response } from 'express';
import { getCustomers } from '../services/customer.service.js';

export const listCustomers = async (_req: Request, res: Response) => {
  const items = await getCustomers();

  return res.status(200).json({ items });
};
