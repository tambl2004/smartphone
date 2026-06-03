import type { Request, Response } from 'express';
import { Message } from '../models/message.model.js';
import { sendSuccess, sendError } from '../utils/api-response.js';
import { getDb } from '../models/mysql.js';
import { getIO } from '../sockets/chat.socket.js';

// ── Lấy tin nhắn của 1 phòng ─────────────────────────────────────────────────
export const getMessages = async (req: Request, res: Response): Promise<void> => {
  const userId = String(req.params.userId ?? '').trim();
  const limit = Math.min(Number(req.query.limit ?? 50), 100);
  const before = req.query.before ? new Date(req.query.before as string) : new Date();

  if (!userId) {
    sendError(res, 400, 'userId không hợp lệ');
    return;
  }

  try {
    const msgs = await Message.find({
      userId,
      createdAt: { $lt: before },
    })
      .populate('replyTo', 'content senderType messageType')
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    sendSuccess(res, 200, 'OK', msgs.reverse());
  } catch (err) {
    console.error('[Chat] getMessages error:', err);
    sendError(res, 500, 'Lỗi server');
  }
};

// ── Danh sách phòng chat (admin) ──────────────────────────────────────────────
export const getChatRooms = async (_req: Request, res: Response): Promise<void> => {
  try {
    const rooms = await Message.aggregate([
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: '$userId',
          lastMessage: { $first: '$content' },
          lastMessageTime: { $first: '$createdAt' },
          lastSenderType: { $first: '$senderType' },
          lastMessageType: { $first: '$messageType' },
          unreadCount: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ['$senderType', 'user'] }, { $eq: ['$isRead', false] }] },
                1,
                0,
              ],
            },
          },
        },
      },
      {
        $project: {
          userId: '$_id',
          _id: 0,
          lastMessage: 1,
          lastMessageTime: 1,
          lastSenderType: 1,
          lastMessageType: 1,
          unreadCount: 1,
        },
      },
      { $sort: { lastMessageTime: -1 } },
    ]);

    // Lấy thông tin khách hàng từ MySQL để hiển thị đúng Tên + Ảnh đại diện + Điện thoại + Địa chỉ mặc định
    if (rooms.length > 0) {
      const userIds = rooms.map((r) => Number(r.userId)).filter((id) => !isNaN(id));
      if (userIds.length > 0) {
        const [mysqlUsers] = await getDb().query(
          'SELECT id, full_name AS fullName, email, phone, avatar_url AS avatarUrl FROM users WHERE id IN (?)',
          [userIds]
        );

        const [mysqlAddresses] = await getDb().query(
          `SELECT user_id AS userId, province_name AS provinceName, district_name AS districtName, ward_name AS wardName, street_address AS streetAddress 
           FROM user_addresses WHERE user_id IN (?) AND is_default = 1`,
          [userIds]
        );

        const addressMap = new Map<number, string>();
        for (const addr of (mysqlAddresses as any[])) {
          const fullAddr = [addr.streetAddress, addr.wardName, addr.districtName, addr.provinceName]
            .filter(Boolean)
            .join(', ');
          addressMap.set(addr.userId, fullAddr);
        }

        const userMap = new Map<number, any>();
        for (const u of (mysqlUsers as any[])) {
          userMap.set(u.id, u);
        }

        for (const room of rooms) {
          const u = userMap.get(Number(room.userId));
          if (u) {
            room.customerName = u.fullName;
            room.customerEmail = u.email;
            room.avatarUrl = u.avatarUrl;
            room.customerPhone = u.phone;
            room.customerAddress = addressMap.get(u.id) || null;
          } else {
            room.customerName = `Khách hàng #${room.userId}`;
          }
        }
      }
    }

    sendSuccess(res, 200, 'OK', rooms);
  } catch (err) {
    console.error('[Chat] getChatRooms error:', err);
    sendError(res, 500, 'Lỗi server');
  }
};

// ── Lấy thông tin công khai của admin (dành cho client widget) ──────────────
export const getAdminInfo = async (_req: Request, res: Response): Promise<void> => {
  try {
    const [rows] = await getDb().query(
      "SELECT full_name AS fullName, avatar_url AS avatarUrl FROM users WHERE role = 'admin' LIMIT 1"
    );
    const admin = (rows as any[])[0] ?? { fullName: 'Hỗ trợ NEXPHONE', avatarUrl: null };
    sendSuccess(res, 200, 'OK', admin);
  } catch (err) {
    console.error('[Chat] getAdminInfo error:', err);
    sendError(res, 500, 'Lỗi server');
  }
};

// ── Admin đánh dấu đã đọc ─────────────────────────────────────────────────────
export const markRoomAsRead = async (req: Request, res: Response): Promise<void> => {
  const userId = String(req.params.userId ?? '').trim();

  if (!userId) {
    sendError(res, 400, 'userId không hợp lệ');
    return;
  }

  try {
    await Message.updateMany(
      { userId, senderType: 'user', isRead: false },
      { $set: { isRead: true } },
    );
    sendSuccess(res, 200, 'Đã đánh dấu đã đọc', null);
  } catch (err) {
    console.error('[Chat] markRoomAsRead error:', err);
    sendError(res, 500, 'Lỗi server');
  }
};

// ── Upload hình ảnh chat ──────────────────────────────────────────────────────
export const uploadChatImage = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      sendError(res, 400, 'Không tìm thấy file ảnh');
      return;
    }
    const imageUrl = `/uploads/${req.file.filename}`;
    sendSuccess(res, 200, 'Tải ảnh lên thành công', { imageUrl });
  } catch (err) {
    console.error('[Chat] uploadChatImage error:', err);
    sendError(res, 500, 'Lỗi server');
  }
};

// ── Xóa toàn bộ tin nhắn (chỉ Admin) ──────────────────────────────────────────
export const clearRoomMessages = async (req: Request, res: Response): Promise<void> => {
  const userId = String(req.params.userId ?? '').trim();

  if (!userId) {
    sendError(res, 400, 'userId không hợp lệ');
    return;
  }

  try {
    await Message.deleteMany({ userId });
    
    // Phát socket cho room biết là phòng đã bị xóa toàn bộ tin nhắn
    try {
      const io = getIO();
      io.to(userId).emit('room_cleared', { userId });
    } catch (err) {
      console.warn('[Chat] Socket IO not available or failed to emit room_cleared:', err);
    }

    sendSuccess(res, 200, 'Đã xóa toàn bộ tin nhắn', null);
  } catch (err) {
    console.error('[Chat] clearRoomMessages error:', err);
    sendError(res, 500, 'Lỗi server');
  }
};
