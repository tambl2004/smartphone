import { Router } from 'express';
import {
  deleteMyCartItem,
  deleteMyWishlistItem,
  getMyCart,
  getMyWishlist,
  listCustomers,
  clearMyCart,
  toggleMyWishlist,
  upsertMyCart,
  toggleCustomerStatusHandler,
  getCustomerOrdersHandler,
} from '../controllers/customer.controller.js';
import { authorizeRoles } from '../middlewares/auth.js';

const router = Router();

// Admin-only routes
router.get('/', authorizeRoles('admin'), listCustomers);
router.patch('/:id/status', authorizeRoles('admin'), toggleCustomerStatusHandler);
router.get('/:id/orders', authorizeRoles('admin'), getCustomerOrdersHandler);

// User routes (cart & wishlist)
router.get('/me/cart', getMyCart);
router.post('/me/cart/:productId', upsertMyCart);
router.delete('/me/cart/:productId', deleteMyCartItem);
router.delete('/me/cart', clearMyCart);
router.get('/me/wishlist', getMyWishlist);
router.post('/me/wishlist/:productId', toggleMyWishlist);
router.delete('/me/wishlist/:productId', deleteMyWishlistItem);

export default router;
