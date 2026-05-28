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
} from '../controllers/customer.controller.js';

const router = Router();

router.get('/', listCustomers);
router.get('/me/cart', getMyCart);
router.post('/me/cart/:productId', upsertMyCart);
router.delete('/me/cart/:productId', deleteMyCartItem);
router.delete('/me/cart', clearMyCart);
router.get('/me/wishlist', getMyWishlist);
router.post('/me/wishlist/:productId', toggleMyWishlist);
router.delete('/me/wishlist/:productId', deleteMyWishlistItem);

export default router;
