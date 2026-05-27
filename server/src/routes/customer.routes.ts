import { Router } from 'express';
import { listCustomers } from '../controllers/customer.controller.js';

const router = Router();

/**
 * @openapi
 * /api/customers:
 *   get:
 *     summary: Get all customers
 *     tags:
 *       - Customers
 *     responses:
 *       200:
 *         description: Customers retrieved successfully
 */
router.get('/', listCustomers);

export default router;
