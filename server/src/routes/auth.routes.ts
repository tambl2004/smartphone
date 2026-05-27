import { Router } from 'express';
import { login } from '../controllers/auth.controller.js';

const router = Router();

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags:
 *       - Auth
 *     responses:
 *       200:
 *         description: Login successful
 */
router.post('/login', login);

export default router;