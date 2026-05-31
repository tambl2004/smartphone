import type { Request, Response } from 'express';
import { getDashboardSummary } from '../models/dashboard.model.js';
import { sendSuccess, sendError } from '../utils/api-response.js';

export const getDashboardOverview = async (_req: Request, res: Response) => {
  try {
    const stats = await getDashboardSummary();
    return sendSuccess(res, 200, 'Dashboard stats retrieved successfully', stats);
  } catch (error: any) {
    console.error('Dashboard Error:', error);
    return sendError(res, 500, error.message || 'Failed to fetch dashboard data');
  }
};
