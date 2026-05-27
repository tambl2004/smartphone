import { Router } from 'express';
import authRoutes from './auth.routes.js';
import brandRoutes from './brand.routes.js';
import categoryRoutes from './category.routes.js';
import customerRoutes from './customer.routes.js';
import dashboardRoutes from './dashboard.routes.js';
import orderRoutes from './order.routes.js';
import productRoutes from './product.routes.js';
import userRoutes from './user.routes.js';
import { authenticate, authorizeRoles } from '../middlewares/auth.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', authenticate, authorizeRoles('admin'), userRoutes);
router.use('/customers', authenticate, authorizeRoles('admin'), customerRoutes);
router.use('/orders', authenticate, authorizeRoles('admin'), orderRoutes);
router.use('/products', authenticate, authorizeRoles('admin'), productRoutes);
router.use('/categories', authenticate, authorizeRoles('admin'), categoryRoutes);
router.use('/brands', authenticate, authorizeRoles('admin'), brandRoutes);
router.use('/dashboard', authenticate, authorizeRoles('admin'), dashboardRoutes);

export default router;