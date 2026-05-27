import jwt, { type SignOptions } from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import {
  findUserByEmail,
  createUser,
  updateUserOtp,
  clearUserOtp,
  findUserByEmailWithOtp,
  updateUserPassword,
} from '../models/user.model.js';
import type { LoginResponseData } from '../types/auth.js';
import { sendOtpEmail } from '../utils/email.js';

const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-secret';
const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN ?? '7d') as SignOptions['expiresIn'];

const generateOtp = (): string =>
  Math.floor(100000 + Math.random() * 900000).toString();

const buildToken = (user: { id: number; email: string; role: 'admin' | 'user' }) =>
  jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });

// ─── Login ────────────────────────────────────────────────────────────────────
export const loginUser = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}): Promise<LoginResponseData | null> => {
  const user = await findUserByEmail(email);
  if (!user) return null;

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) return null;

  const token = buildToken(user);

  return {
    token,
    user: {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      avatarUrl: user.avatarUrl,
      dateOfBirth: user.dateOfBirth,
      role: user.role,
      status: user.status,
    },
  };
};

// ─── Register – Step 1: send OTP ─────────────────────────────────────────────
export const initiateRegister = async ({
  fullName,
  email,
  phone,
  password,
}: {
  fullName: string;
  email: string;
  phone?: string;
  password: string;
}): Promise<{ success: boolean; message: string }> => {
  const existing = await findUserByEmail(email);
  if (existing) {
    return { success: false, message: 'Email đã được sử dụng' };
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const otp = generateOtp();
  const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min

  // Create user as unverified; store OTP
  await createUser({
    fullName,
    email,
    phone: phone ?? null,
    passwordHash,
    otp,
    otpExpiresAt,
    isVerified: false,
  });

  await sendOtpEmail(email, otp, 'register');

  return { success: true, message: 'OTP đã được gửi đến email của bạn' };
};

// ─── Register – Step 2: verify OTP ───────────────────────────────────────────
export const verifyRegisterOtp = async ({
  email,
  otp,
}: {
  email: string;
  otp: string;
}): Promise<LoginResponseData | null> => {
  const user = await findUserByEmailWithOtp(email);
  if (!user) return null;

  if (user.otpCode !== otp) return null;
  if (!user.otpExpiresAt || new Date() > user.otpExpiresAt) return null;

  await clearUserOtp(user.id, true); // mark verified

  const token = buildToken(user);
  return {
    token,
    user: {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      status: user.status,
    },
  };
};

// ─── Forgot Password – Step 1: send OTP ──────────────────────────────────────
export const initiateForgotPassword = async (
  email: string,
): Promise<{ success: boolean; message: string }> => {
  const user = await findUserByEmail(email);
  if (!user) {
    // Generic message to not leak email existence
    return { success: true, message: 'Nếu email tồn tại, OTP đã được gửi' };
  }

  const otp = generateOtp();
  const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await updateUserOtp(user.id, otp, otpExpiresAt);
  await sendOtpEmail(email, otp, 'reset');

  return { success: true, message: 'OTP đã được gửi đến email của bạn' };
};

// ─── Forgot Password – Step 2: verify OTP ────────────────────────────────────
export const verifyForgotOtp = async ({
  email,
  otp,
}: {
  email: string;
  otp: string;
}): Promise<{ success: boolean; message: string }> => {
  const user = await findUserByEmailWithOtp(email);
  if (!user) return { success: false, message: 'Email không tồn tại' };

  if (user.otpCode !== otp) return { success: false, message: 'Mã OTP không đúng' };
  if (!user.otpExpiresAt || new Date() > user.otpExpiresAt) {
    return { success: false, message: 'Mã OTP đã hết hạn' };
  }

  return { success: true, message: 'OTP hợp lệ' };
};

// ─── Forgot Password – Step 3: reset password ────────────────────────────────
export const resetPassword = async ({
  email,
  otp,
  newPassword,
}: {
  email: string;
  otp: string;
  newPassword: string;
}): Promise<{ success: boolean; message: string }> => {
  const user = await findUserByEmailWithOtp(email);
  if (!user) return { success: false, message: 'Email không tồn tại' };

  if (user.otpCode !== otp) return { success: false, message: 'Phiên xác thực không hợp lệ' };
  if (!user.otpExpiresAt || new Date() > user.otpExpiresAt) {
    return { success: false, message: 'Phiên xác thực đã hết hạn' };
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await updateUserPassword(user.id, passwordHash);
  await clearUserOtp(user.id, false);

  return { success: true, message: 'Đặt lại mật khẩu thành công' };
};
