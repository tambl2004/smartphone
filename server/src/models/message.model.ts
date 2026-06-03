/**
 * Message Model – MongoDB / Mongoose
 *
 * Thiết kế đơn giản: mỗi khách hàng có 1 phòng chat duy nhất.
 * roomId = userId của khách hàng → không cần collection Conversation riêng.
 */

import { Schema, model, Document } from 'mongoose';

export interface IMessage extends Document {
  /** ID của khách hàng từ MySQL – đồng thời là roomId của phòng chat */
  userId: string;
  /** Loại người gửi – dùng để phân màu bubble chat trên UI */
  senderType: 'user' | 'admin';
  /** Nội dung tin nhắn hoặc URL ảnh nếu là image */
  content: string;
  /** Loại tin nhắn: văn bản, hình ảnh, hoặc bị thu hồi */
  messageType?: 'text' | 'image' | 'recalled';
  /** Tin nhắn đã được đọc chưa (phía người nhận) */
  isRead: boolean;
  /** ID của tin nhắn được trả lời nếu có */
  replyTo?: string | IMessage | null;
  /** Timestamp tự động bởi Mongoose */
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    userId: {
      type: String,   // MySQL integer ID được gửi dưới dạng string
      required: true,
      index: true,
    },
    senderType: {
      type: String,
      enum: ['user', 'admin'],
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 5000,
    },
    messageType: {
      type: String,
      enum: ['text', 'image', 'recalled'],
      default: 'text',
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    replyTo: {
      type: Schema.Types.ObjectId,
      ref: 'Message',
      default: null,
    },
  },
  {
    timestamps: true, // tự thêm createdAt + updatedAt
  },
);

// Index kép: load tin nhắn của 1 user sắp xếp theo thời gian cực nhanh
MessageSchema.index({ userId: 1, createdAt: -1 });

export const Message = model<IMessage>('Message', MessageSchema);
