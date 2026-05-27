import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { updateUserProfile, updateUserPassword, findUserById, updateUserAvatar } from '../models/user.model.js';
import { sendError, sendSuccess } from '../utils/api-response.js';
import fs from 'fs';
import path from 'path';

export const updateProfile = async (req: Request, res: Response) => {
  if (!req.user) return sendError(res, 401, 'Chưa xác thực');
  
  const { fullName, phone, dateOfBirth } = req.body as { fullName?: string; phone?: string; dateOfBirth?: string | null };

  if (!fullName || !phone) {
    return sendError(res, 400, 'Họ tên và số điện thoại là bắt buộc');
  }

  await updateUserProfile(req.user.id, phone, fullName, dateOfBirth ?? null);
  
  // Return updated info
  const updatedUser = await findUserById(req.user.id);
  if (!updatedUser) return sendError(res, 404, 'Không tìm thấy người dùng');

  return sendSuccess(res, 200, 'Cập nhật hồ sơ thành công', {
    id: updatedUser.id,
    fullName: updatedUser.fullName,
    email: updatedUser.email,
    phone: updatedUser.phone,
    avatarUrl: updatedUser.avatarUrl,
    dateOfBirth: updatedUser.dateOfBirth,
    role: updatedUser.role,
    status: updatedUser.status
  });
};

export const updatePassword = async (req: Request, res: Response) => {
  if (!req.user) return sendError(res, 401, 'Chưa xác thực');

  const { currentPassword, newPassword } = req.body as { currentPassword?: string; newPassword?: string };

  if (!currentPassword || !newPassword) {
    return sendError(res, 400, 'Mật khẩu hiện tại và mật khẩu mới là bắt buộc');
  }

  if (newPassword.length < 8) {
    return sendError(res, 400, 'Mật khẩu mới phải có ít nhất 8 ký tự');
  }

  const user = await findUserById(req.user.id);
  if (!user) return sendError(res, 404, 'Không tìm thấy người dùng');

  const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!isMatch) {
    return sendError(res, 400, 'Mật khẩu hiện tại không đúng');
  }

  const newHash = await bcrypt.hash(newPassword, 10);
  await updateUserPassword(req.user.id, newHash);

  return sendSuccess(res, 200, 'Đổi mật khẩu thành công', null);
};

export const updateAvatar = async (req: Request, res: Response) => {
  if (!req.user) return sendError(res, 401, 'Chưa xác thực');
  
  if (!req.file) {
    return sendError(res, 400, 'Không tìm thấy file ảnh');
  }

  const avatarUrl = `/uploads/${req.file.filename}`;
  
  const user = await findUserById(req.user.id);
  if (!user) return sendError(res, 404, 'Không tìm thấy người dùng');

  // Optional: Delete old avatar file if it exists
  if (user.avatarUrl) {
    const oldPath = path.join(process.cwd(), user.avatarUrl);
    if (fs.existsSync(oldPath)) {
      try {
        fs.unlinkSync(oldPath);
      } catch (err) {
        console.error('Failed to delete old avatar:', err);
      }
    }
  }

  await updateUserAvatar(req.user.id, avatarUrl);

  const updatedUser = await findUserById(req.user.id);
  
  return sendSuccess(res, 200, 'Cập nhật ảnh đại diện thành công', {
    id: updatedUser!.id,
    fullName: updatedUser!.fullName,
    email: updatedUser!.email,
    phone: updatedUser!.phone,
    avatarUrl: updatedUser!.avatarUrl,
    role: updatedUser!.role,
    status: updatedUser!.status
  });
};
