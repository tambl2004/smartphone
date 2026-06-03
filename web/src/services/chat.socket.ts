/**
 * Socket.IO – Client Singleton
 *
 * Dùng pattern singleton để đảm bảo toàn bộ app chỉ có 1 kết nối socket.
 * Tự động gắn JWT token vào handshake nếu user đã đăng nhập.
 */

import { io, Socket } from 'socket.io-client';
import { getAuth } from './auth.service';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL ?? 'http://localhost:5000';

let socket: Socket | null = null;

/** Lấy (hoặc tạo) socket instance. */
export const getSocket = (): Socket => {
  // Trả về socket đã tạo ngay cả khi đang connecting (không check .connected)
  // Tránh tạo nhiều kết nối song song trong quá trình handshake
  if (socket) return socket;

  const auth = getAuth();

  socket = io(SOCKET_URL, {
    autoConnect: false,
    transports: ['websocket'],
    auth: {
      token: auth?.token ?? '',
    },
  });

  return socket;
};

/** Kết nối socket (gọi khi user đăng nhập / mở widget). */
export const connectSocket = (): Socket => {
  const s = getSocket();
  if (!s.connected) s.connect();
  return s;
};

/** Ngắt kết nối socket (gọi khi user đăng xuất). */
export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export type MessagePayload = {
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
  createdAt: string | Date;
};

export type AdminNotification = {
  userId: string;
  content: string;
  senderName: string;
};
