import { Router } from 'express';
import { listOrders, createOrderController, getMyOrdersController, updateOrderStatusController, deleteOrderController } from '../controllers/order.controller.js';
import { authorizeRoles } from '../middlewares/auth.js';

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
router.get('/', authorizeRoles('admin'), listOrders);

router.post('/', createOrderController);
router.get('/my-orders', getMyOrdersController);
router.patch('/:id/status', authorizeRoles('admin'), updateOrderStatusController);
router.delete('/:id', authorizeRoles('admin'), deleteOrderController);

export default router;
