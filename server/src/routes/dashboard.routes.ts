import { Router } from 'express';
import { getDashboardOverview } from '../controllers/dashboard.controller.js';

const router = Router();

/**
 * @openapi
 * /api/dashboard/overview:
 *   get:
 *     summary: Get dashboard summary
 *     tags:
 *       - Dashboard
 *     responses:
 *       200:
 *         description: Dashboard stats retrieved successfully
 */
router.get('/overview', getDashboardOverview);

export default router;
