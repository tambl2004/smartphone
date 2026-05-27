import { Router } from 'express';
import {
  getMyAddresses,
  addAddress,
  editAddress,
  removeAddress,
  setAsDefault
} from '../controllers/address.controller.js';

const router = Router();

/**
 * @openapi
 * /api/addresses:
 *   get:
 *     summary: Lấy danh sách địa chỉ của user đang đăng nhập
 *     tags: [Addresses]
 *     security:
 *       - bearerAuth: []
 */
router.get('/', getMyAddresses);

/**
 * @openapi
 * /api/addresses:
 *   post:
 *     summary: Thêm địa chỉ mới
 *     tags: [Addresses]
 *     security:
 *       - bearerAuth: []
 */
router.post('/', addAddress);

/**
 * @openapi
 * /api/addresses/{id}:
 *   put:
 *     summary: Cập nhật địa chỉ
 *     tags: [Addresses]
 *     security:
 *       - bearerAuth: []
 */
router.put('/:id', editAddress);

/**
 * @openapi
 * /api/addresses/{id}:
 *   delete:
 *     summary: Xóa địa chỉ
 *     tags: [Addresses]
 *     security:
 *       - bearerAuth: []
 */
router.delete('/:id', removeAddress);

/**
 * @openapi
 * /api/addresses/{id}/default:
 *   patch:
 *     summary: Đặt làm địa chỉ mặc định
 *     tags: [Addresses]
 *     security:
 *       - bearerAuth: []
 */
router.patch('/:id/default', setAsDefault);

export default router;
