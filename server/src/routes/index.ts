import { Router } from 'express';
import authRoutes from './auth.routes.js';

import categoryRoutes from './category.routes.js';
import customerRoutes from './customer.routes.js';
import dashboardRoutes from './dashboard.routes.js';
import orderRoutes from './order.routes.js';
import productRoutes from './product.routes.js';
import faqRoutes from './faq.routes.js';
import promotionRoutes from './promotion.routes.js';
import userRoutes from './user.routes.js';
import locationRoutes from './location.routes.js';
import addressRoutes from './address.routes.js';
import profileRoutes from './profile.routes.js';
import { authenticate, authorizeRoles } from '../middlewares/auth.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/locations', locationRoutes);
router.use('/addresses', authenticate, addressRoutes);
router.use('/profile', authenticate, profileRoutes);
router.use('/users', authenticate, authorizeRoles('admin'), userRoutes);
router.use('/customers', authenticate, customerRoutes);
router.use('/orders', authenticate, orderRoutes);
router.use('/dashboard', authenticate, authorizeRoles('admin'), dashboardRoutes);

// GET is public, write operations are protected inside each route file
router.use('/products', productRoutes);
router.use('/categories', categoryRoutes);
router.use('/faqs', faqRoutes);
router.use('/promotions', promotionRoutes);


export default router;