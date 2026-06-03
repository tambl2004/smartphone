/**
 * Socket.IO – Chat Handler
 *
 * Kiến trúc: mỗi Khách hàng có 1 phòng duy nhất, roomId = userId của khách.
 *
 * Events (client → server):
 *   join_chat         { userId }          – Khách hoặc Admin join phòng
 *   send_message      { userId, senderType, content }  – Gửi tin nhắn
 *   mark_read         { userId }          – Admin đánh dấu đã đọc hết tin của user này
 *
 * Events (server → client):
 *   receive_message   MessagePayload      – Tin nhắn mới (broadcast vào room)
 *   admin_notification { userId, content, senderName } – Báo Admin có tin mới
 *   messages_read     { userId }          – Báo tất cả tin đã đọc
 */

import { Server as HTTPServer } from 'http';
import { Server, Socket } from 'socket.io';
import { Message } from '../models/message.model.js';
import jwt from 'jsonwebtoken';
import type { JwtUserPayload } from '../types/auth.js';

const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-secret';
const onlineUsers = new Map<string, string>(); // socket.id -> userId (chỉ lưu customer)

export interface MessagePayload {
  _id?: string;
  userId: string;
  senderType: 'user' | 'admin';
  content: string;
  messageType?: 'text' | 'image' | 'recalled';
  isRead: boolean;
  replyTo?: {
    _id: string;
    content: string;
    senderType: 'user' | 'admin';
    messageType: 'text' | 'image' | 'recalled';
  } | null;
  createdAt: Date;
}

/** Instance toàn cục – dùng để emit từ controller nếu cần */
let ioInstance: Server | null = null;

export const getIO = (): Server => {
  if (!ioInstance) throw new Error('Socket.IO chưa được khởi tạo.');
  return ioInstance;
};

export const initSocket = (server: HTTPServer): void => {
  const io = new Server(server, {
    cors: {
      origin: '*', // Dự án cá nhân – production nên đổi thành domain cụ thể
      methods: ['GET', 'POST'],
    },
  });

  ioInstance = io;

  io.on('connection', (socket: Socket) => {
    console.log(`[Socket] Client kết nối: ${socket.id}`);

    const token = socket.handshake.auth?.token;
    let userIdFromToken: string | null = null;
    let userRole: string | null = null;

    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as JwtUserPayload;
        userIdFromToken = decoded.id ? String(decoded.id) : null;
        userRole = decoded.role;
      } catch (err) {
        // Token không hợp lệ hoặc hết hạn
      }
    }

    const broadcastOnlineUsers = () => {
      const list = Array.from(new Set(onlineUsers.values()));
      io.emit('online_users_list', list);
    };

    // Gửi danh sách online hiện tại cho client vừa kết nối
    socket.emit('online_users_list', Array.from(new Set(onlineUsers.values())));

    // ── 1. Join phòng ────────────────────────────────────────────────────────
    // Khách hàng join phòng của chính mình (roomId = userId).
    // Admin join phòng của khách hàng nào thì truyền userId đó.
    socket.on('join_chat', (userId: string) => {
      if (!userId) return;
      void socket.join(userId);
      console.log(`[Socket] ${socket.id} đã join phòng: ${userId}`);

      if (userRole !== 'admin') {
        onlineUsers.set(socket.id, userId);
        broadcastOnlineUsers();
      }
    });

    // ── 2. Gửi tin nhắn ─────────────────────────────────────────────────────
    socket.on(
      'send_message',
      async (data: {
        userId: string;
        senderType: 'user' | 'admin';
        content: string;
        messageType?: 'text' | 'image' | 'recalled';
        senderName?: string; // tên hiển thị (tùy chọn, để admin_notification)
        replyToId?: string;  // ID tin nhắn cha đang trả lời
      }) => {
        const { userId, senderType, content, messageType, senderName, replyToId } = data;

        if (!userId || !senderType || !content?.trim()) return;

        try {
          const payload = {
            userId,
            senderType,
            content: content.trim(),
            messageType: messageType || 'text',
            isRead: false,
            replyTo: replyToId || null,
          };

          // Lưu DB trước để lấy ID thực tế
          const savedMsg = await Message.create(payload);

          // Populate tin nhắn cha được trả lời
          const populated = await savedMsg.populate('replyTo', 'content senderType messageType');

          // Phát ngay vào room (cả khách + admin đang mở phòng đều nhận)
          io.to(userId).emit('receive_message', populated);

          // Nếu khách gửi → báo tất cả admin biết có tin mới
          if (senderType === 'user') {
            io.emit('admin_notification', {
              userId,
              content: messageType === 'image' ? '[Hình ảnh]' : content.trim(),
              senderName: senderName ?? 'Khách hàng',
            });
          }
        } catch (err) {
          console.error('[Socket] Lỗi lưu message:', err);
        }
      },
    );

    // ── 3. Thu hồi tin nhắn ──────────────────────────────────────────────────
    socket.on('recall_message', async ({ messageId, userId }: { messageId: string; userId: string }) => {
      if (!messageId || !userId) return;
      try {
        const msg = await Message.findById(messageId);
        if (msg) {
          msg.content = 'Tin nhắn đã bị thu hồi';
          msg.messageType = 'recalled';
          await msg.save();
          
          // Phát thông tin thu hồi tới room
          io.to(userId).emit('message_recalled', { messageId, userId });
        }
      } catch (err) {
        console.error('[Socket] Lỗi recall_message:', err);
      }
    });

    // ── 4. Typing indicator ──────────────────────────────────────────────────
    // Client emit: { userId, senderType: 'user'|'admin', isTyping: boolean }
    // Server relay lại vào room để phía kia nhận
    const typingTimers = new Map<string, ReturnType<typeof setTimeout>>();

    socket.on('typing', ({ userId, senderType, isTyping }: { userId: string; senderType: 'user' | 'admin'; isTyping: boolean }) => {
      if (!userId) return;

      // Phát lại vào room (các socket khác trong room sẽ nhận, trừ người gửi)
      socket.to(userId).emit('typing', { userId, senderType, isTyping });

      // Auto-stop sau 5 giây nếu không nhận tín hiệu stop
      const timerKey = `${socket.id}:${userId}`;
      if (isTyping) {
        const existing = typingTimers.get(timerKey);
        if (existing) clearTimeout(existing);
        const t = setTimeout(() => {
          socket.to(userId).emit('typing', { userId, senderType, isTyping: false });
          typingTimers.delete(timerKey);
        }, 5000);
        typingTimers.set(timerKey, t);
      } else {
        const existing = typingTimers.get(timerKey);
        if (existing) { clearTimeout(existing); typingTimers.delete(timerKey); }
      }
    });

    // ── 5. Admin đánh dấu đã đọc toàn bộ tin của 1 user ────────────────────
    socket.on('mark_read', async ({ userId }: { userId: string }) => {
      if (!userId) return;

      try {
        await Message.updateMany(
          { userId, senderType: 'user', isRead: false },
          { $set: { isRead: true } },
        );
        // Thông báo lại cho phòng biết tin đã đọc
        io.to(userId).emit('messages_read', { userId });
      } catch (err) {
        console.error('[Socket] Lỗi mark_read:', err);
      }
    });

    // ── 5. Ngắt kết nối ─────────────────────────────────────────────────────
    socket.on('disconnect', (reason) => {
      console.log(`[Socket] Client ngắt kết nối: ${socket.id} (${reason})`);
      if (onlineUsers.has(socket.id)) {
        onlineUsers.delete(socket.id);
        broadcastOnlineUsers();
      }
    });
  });

  console.log('[Socket.IO] Đã khởi tạo.');
};
