import type { Request, Response } from 'express';
import {
  loginUser,
  loginGoogleUser,
  initiateRegister,
  verifyRegisterOtp,
  initiateForgotPassword,
  verifyForgotOtp,
  resetPassword,
} from '../services/auth.service.js';
import { sendError, sendSuccess } from '../utils/api-response.js';

// ─── Login ────────────────────────────────────────────────────────────────────
export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body as { email?: string; password?: string };

  if (!email || !password) {
    return sendError(res, 400, 'Email và mật khẩu là bắt buộc');
  }

  try {
    const result = await loginUser({ email, password });
    if (!result) return sendError(res, 401, 'Email hoặc mật khẩu không đúng');

    return sendSuccess(res, 200, 'Đăng nhập thành công', result);
  } catch (error: any) {
    if (error.message === 'Tài khoản đã bị khóa, liên hệ admin để mở') {
      return sendError(res, 403, error.message);
    }
    return sendError(res, 500, 'Lỗi máy chủ');
  }
};

// ─── Google Login ─────────────────────────────────────────────────────────────
export const googleLogin = async (req: Request, res: Response) => {
  const { token } = req.body as { token?: string };

  if (!token) {
    return sendError(res, 400, 'Token không hợp lệ');
  }

  try {
    const result = await loginGoogleUser(token);
    return sendSuccess(res, 200, 'Đăng nhập Google thành công', result);
  } catch (error: any) {
    console.error('Lỗi xác thực Google:', error);
    if (error.message === 'Tài khoản đã bị khóa, liên hệ admin để mở') {
      return sendError(res, 403, error.message);
    }
    return sendError(res, 500, error.message || 'Lỗi xác thực Google');
  }
};

// ─── Register – Step 1: send OTP ─────────────────────────────────────────────
export const register = async (req: Request, res: Response) => {
  const { fullName, email, phone, password } = req.body as {
    fullName?: string;
    email?: string;
    phone?: string;
    password?: string;
  };

  if (!fullName || !email || !password) {
    return sendError(res, 400, 'Họ tên, email và mật khẩu là bắt buộc');
  }

  if (password.length < 8) {
    return sendError(res, 400, 'Mật khẩu phải có ít nhất 8 ký tự');
  }

  const result = await initiateRegister({ fullName, email, phone, password });
  if (!result.success) return sendError(res, 409, result.message);

  return sendSuccess(res, 200, result.message, null);
};

// ─── Register – Step 2: verify OTP ───────────────────────────────────────────
export const verifyRegister = async (req: Request, res: Response) => {
  const { email, otp } = req.body as { email?: string; otp?: string };

  if (!email || !otp) {
    return sendError(res, 400, 'Email và mã OTP là bắt buộc');
  }

  const result = await verifyRegisterOtp({ email, otp });
  if (!result) return sendError(res, 400, 'Mã OTP không đúng hoặc đã hết hạn');

  return sendSuccess(res, 200, 'Đăng ký thành công', result);
};

// ─── Forgot Password – Step 1: send OTP ──────────────────────────────────────
export const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body as { email?: string };

  if (!email) return sendError(res, 400, 'Email là bắt buộc');

  const result = await initiateForgotPassword(email);
  return sendSuccess(res, 200, result.message, null);
};

// ─── Forgot Password – Step 2: verify OTP ────────────────────────────────────
export const verifyForgot = async (req: Request, res: Response) => {
  const { email, otp } = req.body as { email?: string; otp?: string };

  if (!email || !otp) return sendError(res, 400, 'Email và OTP là bắt buộc');

  const result = await verifyForgotOtp({ email, otp });
  if (!result.success) return sendError(res, 400, result.message);

  return sendSuccess(res, 200, result.message, null);
};

// ─── Forgot Password – Step 3: reset password ────────────────────────────────
export const confirmResetPassword = async (req: Request, res: Response) => {
  const { email, otp, newPassword } = req.body as {
    email?: string;
    otp?: string;
    newPassword?: string;
  };

  if (!email || !otp || !newPassword) {
    return sendError(res, 400, 'Email, OTP và mật khẩu mới là bắt buộc');
  }

  if (newPassword.length < 8) {
    return sendError(res, 400, 'Mật khẩu mới phải có ít nhất 8 ký tự');
  }

  const result = await resetPassword({ email, otp, newPassword });
  if (!result.success) return sendError(res, 400, result.message);

  return sendSuccess(res, 200, result.message, null);
};
