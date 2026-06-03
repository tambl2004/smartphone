/**
 * Chat Routes
 *
 * GET  /api/chat/messages/:userId   – Lấy lịch sử tin nhắn (user xem tin của mình / admin xem tin của user)
 * GET  /api/chat/rooms              – Danh sách phòng chat (admin only)
 * PATCH /api/chat/rooms/:userId/read – Đánh dấu đã đọc (admin)
 */

import { Router } from 'express';
import { authenticate, authorizeRoles } from '../middlewares/auth.js';
import { getMessages, getChatRooms, markRoomAsRead, uploadChatImage, clearRoomMessages, getAdminInfo } from '../controllers/chat.controller.js';
import { upload } from '../middlewares/upload.js';

const router = Router();

// Lấy thông tin công khai của admin (tên, avatar)
router.get('/admin-info', authenticate, getAdminInfo);

// Khách hàng lấy lịch sử tin nhắn của chính mình
// Admin cũng có thể dùng endpoint này để lấy tin của bất kỳ userId nào
router.get('/messages/:userId', authenticate, getMessages);

// Danh sách phòng – chỉ admin
router.get('/rooms', authenticate, authorizeRoles('admin'), getChatRooms);

// Đánh dấu đã đọc – chỉ admin
router.patch('/rooms/:userId/read', authenticate, authorizeRoles('admin'), markRoomAsRead);

// Upload ảnh trong chat
router.post('/upload', authenticate, upload.single('image'), uploadChatImage);

// Xóa toàn bộ tin nhắn – chỉ admin
router.delete('/rooms/:userId', authenticate, authorizeRoles('admin'), clearRoomMessages);

export default router;
