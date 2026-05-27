import { Router } from 'express';
import { updateProfile, updatePassword } from '../controllers/profile.controller.js';

const router = Router();

/**
 * @openapi
 * /api/profile:
 *   put:
 *     summary: Cập nhật hồ sơ (tên, số điện thoại)
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 */
router.put('/', updateProfile);

/**
 * @openapi
 * /api/profile/password:
 *   put:
 *     summary: Đổi mật khẩu
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 */
router.put('/password', updatePassword);

/**
 * @openapi
 * /api/profile/avatar:
 *   post:
 *     summary: Cập nhật ảnh đại diện
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 */
import { updateAvatar } from '../controllers/profile.controller.js';
import { upload } from '../middlewares/upload.js';
router.post('/avatar', upload.single('avatar'), updateAvatar);

export default router;
