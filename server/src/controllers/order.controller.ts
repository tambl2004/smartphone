import type { Request, Response } from 'express';
import { getOrders } from '../services/order.service.js';
import { sendSuccess } from '../utils/api-response.js';
import { parseListQuery } from '../utils/pagination.js';

export const listOrders = async (req: Request, res: Response) => {
  const result = await getOrders(parseListQuery(req.query as Record<string, unknown>));
  return sendSuccess(res, 200, 'Orders retrieved successfully', result);
};
