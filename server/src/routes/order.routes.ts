import { Router } from 'express';
import { listOrders } from '../controllers/order.controller.js';

const router = Router();

/**
 * @openapi
 * /api/orders:
 *   get:
 *     summary: Get all orders
 *     tags:
 *       - Orders
 *     responses:
 *       200:
 *         description: Orders retrieved successfully
 */
router.get('/', listOrders);

export default router;
