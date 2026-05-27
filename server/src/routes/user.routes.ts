import { Router } from 'express';
import { createUserHandler, deleteUserHandler, detailUser, listUsers, updateUserHandler } from '../controllers/user.controller.js';
import { validateBody } from '../middlewares/validate.js';
import { userCreateRules } from '../schemas/user.schema.js';

const router = Router();

/**
 * @openapi
 * /api/users:
 *   get:
 *     summary: Get all users
 *     tags:
 *       - Users
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 */
router.get('/', listUsers);
router.get('/:id', detailUser);
router.post('/', validateBody(userCreateRules), createUserHandler);
router.put('/:id', validateBody(userCreateRules), updateUserHandler);
router.delete('/:id', deleteUserHandler);

export default router;
