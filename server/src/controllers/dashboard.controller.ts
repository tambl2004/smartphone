import type { Request, Response } from 'express';
import { getDashboardSummary } from '../models/dashboard.model.js';
import { sendSuccess } from '../utils/api-response.js';

export const getDashboardOverview = async (_req: Request, res: Response) => {
  const stats = await getDashboardSummary();
  return sendSuccess(res, 200, 'Dashboard stats retrieved successfully', stats);
};
