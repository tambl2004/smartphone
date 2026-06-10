import { Router } from 'express';
import {
  login,
  googleLogin,
  register,
  verifyRegister,
  forgotPassword,
  verifyForgot,
  confirmResetPassword,
} from '../controllers/auth.controller.js';

const router = Router();

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     summary: Đăng nhập
 *     tags: [Auth]
 */
router.post('/login', login);

/**
 * @openapi
 * /api/auth/google:
 *   post:
 *     summary: Đăng nhập bằng Google
 *     tags: [Auth]
 */
router.post('/google', googleLogin);

/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     summary: Đăng ký – gửi OTP qua email
 *     tags: [Auth]
 */
router.post('/register', register);

/**
 * @openapi
 * /api/auth/register/verify:
 *   post:
 *     summary: Đăng ký – xác thực OTP
 *     tags: [Auth]
 */
router.post('/register/verify', verifyRegister);

/**
 * @openapi
 * /api/auth/forgot-password:
 *   post:
 *     summary: Quên mật khẩu – gửi OTP
 *     tags: [Auth]
 */
router.post('/forgot-password', forgotPassword);

/**
 * @openapi
 * /api/auth/forgot-password/verify:
 *   post:
 *     summary: Quên mật khẩu – xác thực OTP
 *     tags: [Auth]
 */
router.post('/forgot-password/verify', verifyForgot);

/**
 * @openapi
 * /api/auth/reset-password:
 *   post:
 *     summary: Đặt lại mật khẩu
 *     tags: [Auth]
 */
router.post('/reset-password', confirmResetPassword);

export default router;