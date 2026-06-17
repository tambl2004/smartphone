import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search, Send, Phone,
  MoreVertical, ChevronDown, Mail, MapPin, Hash,
  Smile, Paperclip, Loader2, Trash2, CornerUpLeft, X
} from 'lucide-react';
import { getAuth } from '../../services/auth.service';
import { connectSocket, type MessagePayload, type AdminNotification } from '../../services/chat.socket';
import { useRouter } from '@routes/router';

const API = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000/api';

// ── Popular Emojis ─────────────────────────────────────────────────────────────
const EMOJIS = [
  '😀', '😂', '🤣', '😊', '😍', '🥰', '😘', '😜', '😎', '🤔',
  '😭', '😡', '😱', '👍', '👎', '👌', '🙏', '👏', '🔥', '🎉',
  '❤️', '💔', '✨', '🌟', '💯', '✔️', '❌', '❓', '❗', '💡',
  '📱', '💻', '📷', '🛍️', '🎁', '📦', '🚚', '💳', '💵', '⭐'
];

// ── Types ─────────────────────────────────────────────────────────────────────
interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'admin';
  timestamp: Date;
  status?: 'sent' | 'delivered' | 'read';
  messageType?: 'text' | 'image' | 'recalled';
  replyTo?: {
    id: string;
    text: string;
    sender: 'user' | 'admin';
    messageType: 'text' | 'image' | 'recalled';
  } | null;
}

interface ChatRoom {
  userId: string;
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
  lastSenderType: 'user' | 'admin';
  lastMessageType?: 'text' | 'image' | 'recalled';
  customerName?: string;
  customerEmail?: string;
  avatarUrl?: string;
  isOnline?: boolean;
  customerPhone?: string | null;
  customerAddress?: string | null;
}

const QUICK_RESPONSES = [
  'Cảm ơn bạn đã liên hệ! 🌟',
  'Bạn vui lòng chờ mình kiểm tra nhé.',
  'Đơn hàng đang được vận chuyển, dự kiến nhận hàng ngày mai.',
  'Bạn có thể cung cấp mã đơn không?',
];

const renderLastMessagePreview = (room: ChatRoom) => {
  if (!room.lastMessage) return '';
  if (room.lastMessageType === 'image' || room.lastMessage.startsWith('/uploads/')) {
    const sender = room.lastSenderType === 'admin' ? 'Admin' : (room.customerName ?? 'Khách hàng');
    return `${sender} đã gửi cho bạn 1 ảnh`;
  }
  if (room.lastMessageType === 'recalled') {
    return 'Tin nhắn đã bị thu hồi';
  }
  return room.lastMessage;
};

const formatRelativeTime = (date: Date) => {
  const diff = Date.now() - date.getTime();
  if (diff < 60000) return 'Vừa xong';
  if (diff < 3600000) return `${Math.floor(diff / 60000)} phút`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)} giờ`;
  return 'Hôm qua';
};

const formatTime = (date: Date) =>
  date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

// ── Component ─────────────────────────────────────────────────────────────────
export const ChatPage: React.FC = () => {
  const { navigate } = useRouter();
  const auth = getAuth();
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>({});
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'unread' | 'online'>('all');
  const [showInfo, setShowInfo] = useState(true);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showMobileList, setShowMobileList] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set()); // userId đang nhập
  const adminTypingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const selectedUserIdRef = useRef<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  // Dùng ref cho token để effect không cần re-run khi token thay đổi
  const tokenRef = useRef(auth?.token);

  // ── Giữ ref đồng bộ với selectedUserId ─────────────────────────────────────
  useEffect(() => {
    selectedUserIdRef.current = selectedUserId;
  }, [selectedUserId]);

  // ── Tải danh sách phòng khi mount (fetch inline, không qua callback) ────────
  useEffect(() => {
    const token = tokenRef.current;
    let cancelled = false;
    fetch(`${API}/chat/rooms`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.ok ? res.json() : null)
      .then((json: { data: ChatRoom[] } | null) => {
        if (!json || cancelled) return;
        setRooms(
          (json.data ?? []).map((r) => ({
            ...r,
            lastMessageTime: new Date(r.lastMessageTime),
            customerName: r.customerName ?? `User #${r.userId.slice(-6)}`,
            lastMessageType: r.lastMessageType || 'text',
          }))
        );
      })
      .catch(() => { /* silent */ });
    return () => { cancelled = true; };
  }, []);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Hàm tải tin nhắn của 1 phòng (gọi theo sự kiện, không trong effect) ────
  const loadMessages = useCallback(async (userId: string) => {
    try {
      const res = await fetch(`${API}/chat/messages/${userId}?limit=50`, {
        headers: { Authorization: `Bearer ${tokenRef.current}` },
      });
      if (!res.ok) return;
      const json = (await res.json()) as { data: MessagePayload[] };
      setMessages((prev) => ({
        ...prev,
        [userId]: (json.data ?? []).map((p) => ({
          id: p._id ?? String(Date.now()),
          text: p.content,
          sender: p.senderType,
          timestamp: new Date(p.createdAt),
          status: p.isRead ? 'read' : 'sent',
          messageType: p.messageType || 'text',
          replyTo: p.replyTo ? {
            id: p.replyTo._id,
            text: p.replyTo.content,
            sender: p.replyTo.senderType,
            messageType: p.replyTo.messageType || 'text'
          } : null,
        })),
      }));
    } catch { /* silent */ }
  }, []);

  // ── Kết nối Socket.IO (chỉ setup 1 lần) ─────────────────────────────────
  useEffect(() => {
    const socket = connectSocket();

    const handleMessage = (payload: MessagePayload) => {
      const msg: ChatMessage = {
        id: payload._id ?? String(Date.now()),
        text: payload.content,
        sender: payload.senderType,
        timestamp: new Date(payload.createdAt),
        status: 'sent',
        messageType: payload.messageType || 'text',
        replyTo: payload.replyTo ? {
          id: payload.replyTo._id,
          text: payload.replyTo.content,
          sender: payload.replyTo.senderType,
          messageType: payload.replyTo.messageType || 'text'
        } : null,
      };
      setMessages((prev) => ({
        ...prev,
        [payload.userId]: [...(prev[payload.userId] ?? []), msg],
      }));

      // Cập nhật tin nhắn cuối cùng trong danh sách rooms
      setRooms((prev) =>
        prev.map((r) =>
          r.userId === payload.userId
            ? {
              ...r,
              lastMessage: payload.content,
              lastMessageType: payload.messageType || 'text',
              lastMessageTime: new Date(payload.createdAt),
              lastSenderType: payload.senderType,
            }
            : r
        )
      );
    };

    const handleNotification = (n: AdminNotification) => {
      setRooms((prev) => {
        const exists = prev.find((r) => r.userId === n.userId);
        if (exists) {
          return prev.map((r) =>
            r.userId === n.userId
              ? {
                ...r,
                lastMessage: n.content,
                lastMessageType: 'text', // mặc định cho notify
                lastMessageTime: new Date(),
                // Dùng ref thay vì state để tránh stale closure
                unreadCount: selectedUserIdRef.current === n.userId ? 0 : r.unreadCount + 1,
              }
              : r
          );
        }
        return [
          {
            userId: n.userId,
            customerName: n.senderName,
            lastMessage: n.content,
            lastMessageType: 'text',
            lastMessageTime: new Date(),
            unreadCount: 1,
            lastSenderType: 'user',
          },
          ...prev,
        ];
      });
    };

    const handleMessageRecalled = ({ messageId, userId }: { messageId: string; userId: string }) => {
      setMessages((prev) => {
        const userMsgs = prev[userId] ?? [];
        const updatedMsgs = userMsgs.map((msg) =>
          msg.id === messageId
            ? { ...msg, text: 'Tin nhắn đã bị thu hồi', messageType: 'recalled' as const }
            : msg
        );
        return { ...prev, [userId]: updatedMsgs };
      });

      setRooms((prev) =>
        prev.map((r) =>
          r.userId === userId
            ? {
              ...r,
              lastMessage: 'Tin nhắn đã bị thu hồi',
              lastMessageType: 'recalled',
            }
            : r
        )
      );
    };

    const handleRoomCleared = ({ userId }: { userId: string }) => {
      setMessages((prev) => ({
        ...prev,
        [userId]: [],
      }));
      setRooms((prev) =>
        prev.map((r) =>
          r.userId === userId
            ? {
              ...r,
              lastMessage: '',
              lastMessageType: 'text',
            }
            : r
        )
      );
    };

    const handleOnlineList = (list: string[]) => {
      setRooms((prev) =>
        prev.map((r) => ({
          ...r,
          isOnline: list.includes(r.userId),
        }))
      );
    };

    const handleTyping = ({ userId, senderType, isTyping }: { userId: string; senderType: string; isTyping: boolean }) => {
      if (senderType !== 'user') return;
      setTypingUsers((prev) => {
        const next = new Set(prev);
        if (isTyping) next.add(userId); else next.delete(userId);
        return next;
      });
    };

    socket.on('receive_message', handleMessage);
    socket.on('admin_notification', handleNotification);
    socket.on('message_recalled', handleMessageRecalled);
    socket.on('room_cleared', handleRoomCleared);
    socket.on('online_users_list', handleOnlineList);
    socket.on('typing', handleTyping);

    return () => {
      socket.off('receive_message', handleMessage);
      socket.off('admin_notification', handleNotification);
      socket.off('message_recalled', handleMessageRecalled);
      socket.off('room_cleared', handleRoomCleared);
      socket.off('online_users_list', handleOnlineList);
      socket.off('typing', handleTyping);
    };
  }, []);

  // ── Chọn phòng chat ───────────────────────────────────────────────────────
  const handleSelectRoom = (userId: string) => {
    setSelectedUserId(userId);
    setShowMobileList(false);
    setShowEmojiPicker(false);

    const socket = connectSocket();
    socket.emit('join_chat', userId);
    socket.emit('mark_read', { userId });

    setRooms((prev) =>
      prev.map((r) => (r.userId === userId ? { ...r, unreadCount: 0 } : r))
    );

    if (!messages[userId]) void loadMessages(userId);
  };

  // ── Gửi tin nhắn ─────────────────────────────────────────────────────────
  const emitAdminTyping = (typing: boolean) => {
    if (!selectedUserId) return;
    connectSocket().emit('typing', {
      userId: selectedUserId,
      senderType: 'admin',
      isTyping: typing,
    });
  };

  const handleAdminInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
    emitAdminTyping(true);
    if (adminTypingTimerRef.current) clearTimeout(adminTypingTimerRef.current);
    adminTypingTimerRef.current = setTimeout(() => emitAdminTyping(false), 3000);
  };

  const handleSend = () => {
    if (!message.trim() || !selectedUserId) return;
    emitAdminTyping(false);
    if (adminTypingTimerRef.current) { clearTimeout(adminTypingTimerRef.current); adminTypingTimerRef.current = null; }
    const socket = connectSocket();
    socket.emit('send_message', {
      userId: selectedUserId,
      senderType: 'admin',
      content: message.trim(),
      messageType: 'text',
      replyToId: replyingTo?.id || undefined,
    });
    setMessage('');
    setReplyingTo(null);
    setShowEmojiPicker(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleRecallMessage = (messageId: string) => {
    if (!selectedUserId) return;
    const socket = connectSocket();
    socket.emit('recall_message', { messageId, userId: selectedUserId });
  };

  const handleDeleteAllMessages = async () => {
    if (!selectedUserId) return;
    if (!window.confirm('Bạn có chắc chắn muốn xóa toàn bộ tin nhắn trong phòng chat này? Thao tác này không thể hoàn tác.')) return;

    try {
      const res = await fetch(`${API}/chat/rooms/${selectedUserId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${tokenRef.current}` },
      });
      if (res.ok) {
        setMessages((prev) => ({ ...prev, [selectedUserId]: [] }));
        setRooms((prev) =>
          prev.map((r) =>
            r.userId === selectedUserId
              ? { ...r, lastMessage: '', lastMessageType: 'text' }
              : r
          )
        );
      }
    } catch (err) {
      console.error('Lỗi khi xóa toàn bộ tin nhắn:', err);
    }
  };

  // ── Xử lý upload ảnh ──────────────────────────────────────────────────────
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedUserId) return;

    const formData = new FormData();
    formData.append('image', file);

    setIsUploading(true);
    try {
      const res = await fetch(`${API}/chat/upload`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${tokenRef.current}`,
        },
        body: formData,
      });
      if (!res.ok) throw new Error('Upload thất bại');
      const json = (await res.json()) as { data: { imageUrl: string } };

      const socket = connectSocket();
      socket.emit('send_message', {
        userId: selectedUserId,
        senderType: 'admin',
        content: json.data.imageUrl,
        messageType: 'image',
        replyToId: replyingTo?.id || undefined,
      });
      setReplyingTo(null);
    } catch (err) {
      console.error('Lỗi upload hình ảnh:', err);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    setMessage((prev) => prev + emoji);
    setShowEmojiPicker(false);
    inputRef.current?.focus();
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, selectedUserId]);

  const selectedRoom = rooms.find((r) => r.userId === selectedUserId) ?? null;
  const currentMessages = selectedUserId ? (messages[selectedUserId] ?? []) : [];
  const totalUnread = rooms.reduce((s, r) => s + r.unreadCount, 0);

  const filteredRooms = rooms.filter((r) => {
    const q = searchQuery.toLowerCase();
    const match = !q || (r.customerName ?? '').toLowerCase().includes(q) || r.lastMessage.toLowerCase().includes(q);
    if (filterTab === 'unread') return match && r.unreadCount > 0;
    if (filterTab === 'online') return match && r.isOnline;
    return match;
  });

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex h-[calc(100vh-112px)] w-full mx-auto overflow-hidden rounded-2xl border border-neutral-200 dark:border-white/[0.06] shadow-sm bg-white dark:bg-[#0d0d0d]">

      {/* Sidebar – danh sách phòng */}
      <div className={`${showMobileList ? 'flex' : 'hidden'} lg:flex flex-col w-full lg:w-[320px] xl:w-[340px] border-r border-neutral-200 dark:border-white/[0.06] bg-white dark:bg-[#0d0d0d] flex-shrink-0`}>
        <div className="p-4 border-b border-neutral-100 dark:border-white/[0.06] flex-shrink-0">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-black dark:text-white flex items-center gap-2">
              Hộp thư
              {totalUnread > 0 && (
                <span className="text-xs bg-red-500 text-white px-1.5 py-0.5 rounded-full font-bold">{totalUnread} mới</span>
              )}
            </h2>
          </div>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input type="text" placeholder="Tìm hội thoại..." value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-9 pr-3 bg-neutral-100 dark:bg-white/[0.04] border border-neutral-200 dark:border-white/[0.08] rounded-lg text-sm text-black dark:text-white placeholder:text-neutral-400 outline-none focus:border-indigo-500/50 transition-colors" />
          </div>
          <div className="flex items-center gap-1.5 mt-3">
            {(['all', 'unread', 'online'] as const).map((tab) => (
              <button key={tab} onClick={() => setFilterTab(tab)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border-none outline-none ${filterTab === tab ? 'bg-indigo-600 text-white' : 'bg-neutral-100 dark:bg-white/[0.04] text-neutral-500 dark:text-white/50 hover:bg-neutral-200 dark:hover:bg-white/[0.08]'}`}>
                {tab === 'all' ? 'Tất cả' : tab === 'unread' ? 'Chưa đọc' : 'Online'}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {filteredRooms.length === 0 && (
            <div className="p-8 text-center text-sm text-neutral-400">Chưa có hội thoại nào</div>
          )}
          {filteredRooms.map((room) => (
            <button key={room.userId} onClick={() => handleSelectRoom(room.userId)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors border-none outline-none ${selectedUserId === room.userId ? 'bg-indigo-50 dark:bg-indigo-500/[0.08] border-r-2 border-r-indigo-500' : 'hover:bg-neutral-50 dark:hover:bg-white/[0.02]'}`}>
              <div className="relative flex-shrink-0">
                {room.avatarUrl ? (
                  <img
                    src={room.avatarUrl.startsWith('http') ? room.avatarUrl : `${API.replace('/api', '')}${room.avatarUrl}`}
                    alt="Avatar"
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs">
                    {(room.customerName ?? 'U').slice(0, 2).toUpperCase()}
                  </div>
                )}
                {room.isOnline && (
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white dark:border-[#0d0d0d]" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-semibold truncate ${selectedUserId === room.userId ? 'text-indigo-600 dark:text-indigo-400' : 'text-black dark:text-white'}`}>
                    {room.customerName ?? `User #${room.userId.slice(-6)}`}
                  </span>
                  <span className="text-[10px] text-neutral-400 flex-shrink-0 ml-2">
                    {formatRelativeTime(room.lastMessageTime)}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-0.5">
                  <p className="text-xs text-neutral-500 dark:text-white/40 truncate">{renderLastMessagePreview(room)}</p>
                  {room.unreadCount > 0 && (
                    <span className="w-5 h-5 bg-indigo-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center flex-shrink-0 ml-2">
                      {room.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className={`${!showMobileList ? 'flex' : 'hidden'} lg:flex flex-col flex-1 min-w-0 bg-[#f8f9fa] dark:bg-[#0a0a0a]`}>
        {selectedRoom ? (
          <>
            {/* Header */}
            <div className="h-16 px-4 flex items-center justify-between border-b border-neutral-200 dark:border-white/[0.06] bg-white dark:bg-[#0d0d0d] flex-shrink-0">
              <div className="flex items-center gap-3">
                <button onClick={() => setShowMobileList(true)}
                  className="lg:hidden w-8 h-8 rounded-lg flex items-center justify-center text-neutral-500 hover:bg-neutral-100 dark:hover:bg-white/[0.08] border-none outline-none mr-1">
                  <ChevronDown size={18} className="rotate-90" />
                </button>
                <div className="w-9 h-9 rounded-full overflow-hidden bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                  {selectedRoom.avatarUrl ? (
                    <img src={selectedRoom.avatarUrl.startsWith('http') ? selectedRoom.avatarUrl : `${API.replace('/api', '')}${selectedRoom.avatarUrl}`}
                      alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    (selectedRoom.customerName ?? 'U').slice(0, 2).toUpperCase()
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-black dark:text-white leading-tight">
                    {selectedRoom.customerName ?? `User #${selectedRoom.userId.slice(-6)}`}
                  </h3>
                  <div className="flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${selectedRoom.isOnline ? 'bg-emerald-400' : 'bg-neutral-300'}`} />
                    <span className="text-[11px] text-neutral-500">{selectedRoom.isOnline ? 'Đang hoạt động' : 'Ngoại tuyến'}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={handleDeleteAllMessages}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors border-none outline-none mr-1"
                  title="Xóa toàn bộ tin nhắn"
                >
                  <Trash2 size={16} />
                </button>
                {[
                  { Icon: Phone, color: 'text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10' },
                  { Icon: MoreVertical, color: 'text-neutral-500 hover:bg-neutral-100 dark:hover:bg-white/[0.08]' },
                ].map(({ Icon, color }, i) => (
                  <button key={i} onClick={i === 4 ? () => setShowInfo(!showInfo) : undefined}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors border-none outline-none ${color}`}>
                    <Icon size={16} />
                  </button>
                ))}
              </div>
            </div>

            {/* Messages + Info */}
            <div className="flex flex-1 overflow-hidden min-w-0">
              <div className="flex-1 flex flex-col overflow-hidden min-w-0">
                {/* Messages list */}
                <div className="flex-1 overflow-y-auto px-4 lg:px-6 py-4 custom-scrollbar space-y-1">
                  <div className="text-center py-3">
                    <span className="text-[10px] text-neutral-400 bg-white dark:bg-neutral-800 px-3 py-1 rounded-full shadow-sm border border-neutral-100 dark:border-neutral-700">Hôm nay</span>
                  </div>
                  {currentMessages.map((msg) => (
                    <div id={`msg-${msg.id}`} key={msg.id} className={`flex ${msg.sender === 'admin' ? 'justify-end' : 'justify-start'} mb-1.5 group transition-colors duration-500 rounded-lg p-1`}>
                      {msg.sender === 'user' && (
                        <div className="w-7 h-7 rounded-full overflow-hidden bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-[9px] flex-shrink-0 mr-2 mt-auto mb-1">
                          {selectedRoom.avatarUrl ? (
                            <img src={selectedRoom.avatarUrl.startsWith('http') ? selectedRoom.avatarUrl : `${API.replace('/api', '')}${selectedRoom.avatarUrl}`}
                              alt="Avatar" className="w-full h-full object-cover" />
                          ) : (
                            (selectedRoom.customerName ?? 'U').slice(0, 2).toUpperCase()
                          )}
                        </div>
                      )}

                      <div className="max-w-[65%] relative group/bubble">
                        {/* Recall button - top right */}
                        {msg.sender === 'admin' && msg.messageType !== 'recalled' && (
                          <button
                            onClick={() => handleRecallMessage(msg.id)}
                            className="absolute -top-2.5 -right-2.5 z-20 w-5.5 h-5.5 rounded-full bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 shadow-sm flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover/bubble:opacity-100 cursor-pointer outline-none animate-fade-in"
                            title="Thu hồi"
                          >
                            <Trash2 size={10} />
                          </button>
                        )}

                        {/* Reply button */}
                        {msg.messageType !== 'recalled' && (
                          <button
                            onClick={() => setReplyingTo(msg)}
                            className={`absolute -bottom-2.5 z-20 w-5.5 h-5.5 rounded-full bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 shadow-sm flex items-center justify-center text-neutral-500 hover:text-indigo-600 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-all opacity-0 group-hover/bubble:opacity-100 cursor-pointer outline-none animate-fade-in ${msg.sender === 'admin' ? '-left-2.5' : '-right-2.5'}`}
                            title="Trả lời"
                          >
                            <CornerUpLeft size={10} />
                          </button>
                        )}

                        {/* Quote reply content if replying to another message */}
                        {msg.replyTo && (
                          <div
                            onClick={() => {
                              const targetEl = document.getElementById(`msg-${msg.replyTo?.id}`);
                              if (targetEl) {
                                targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                targetEl.classList.add('bg-indigo-50/70', 'dark:bg-indigo-950/30');
                                setTimeout(() => {
                                  targetEl.classList.remove('bg-indigo-50/70', 'dark:bg-indigo-950/30');
                                }, 1550);
                              }
                            }}
                            className={`text-[11px] px-2.5 py-1.5 mb-1 bg-neutral-200/50 dark:bg-neutral-800/40 border-l-2 border-indigo-500 text-neutral-500 dark:text-neutral-450 rounded-lg max-w-full truncate cursor-pointer hover:bg-neutral-300/30 dark:hover:bg-neutral-700/50 transition-colors`}
                          >
                            <span className="font-semibold block text-[9px] text-neutral-600 dark:text-neutral-400">
                              {msg.replyTo.sender === 'admin' ? 'Admin' : (selectedRoom.customerName ?? 'Khách hàng')}
                            </span>
                            {msg.replyTo.messageType === 'image' ? '[Hình ảnh]' : msg.replyTo.messageType === 'recalled' ? 'Tin nhắn đã bị thu hồi' : msg.replyTo.text}
                          </div>
                        )}

                        {msg.messageType === 'recalled' ? (
                          <div className={`px-4 py-2.5 text-xs italic bg-neutral-150 dark:bg-neutral-800/40 text-neutral-450/80 rounded-2xl border border-dashed border-neutral-350 dark:border-neutral-700/60 ${msg.sender === 'admin' ? 'rounded-br-md' : 'rounded-bl-md'}`}>
                            Tin nhắn đã bị thu hồi
                          </div>
                        ) : msg.messageType === 'image' ? (
                          <div className="rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-700 max-w-xs shadow-sm bg-neutral-100 dark:bg-neutral-800">
                            <img src={msg.text.startsWith('http') ? msg.text : `${API.replace('/api', '')}${msg.text}`}
                              alt="Gửi từ chat" className="w-full max-h-60 object-cover cursor-zoom-in hover:scale-[1.02] transition-transform duration-200"
                              onClick={() => setSelectedImage(msg.text.startsWith('http') ? msg.text : `${API.replace('/api', '')}${msg.text}`)} />
                          </div>
                        ) : (
                          <div className={`px-4 py-2.5 text-sm leading-relaxed ${msg.sender === 'admin' ? 'bg-indigo-600 text-white rounded-2xl rounded-br-md' : 'bg-white dark:bg-[#1c2333] text-neutral-800 dark:text-neutral-200 rounded-2xl rounded-bl-md shadow-sm border border-neutral-100 dark:border-neutral-700/50'}`}>
                            {msg.text}
                          </div>
                        )}
                        <div className={`flex items-center gap-1 mt-0.5 ${msg.sender === 'admin' ? 'justify-end pr-1' : 'pl-1'}`}>
                          <span className="text-[10px] text-neutral-400">{formatTime(msg.timestamp)}</span>
                          {msg.sender === 'admin' && msg.status === 'read' && <span className="text-[10px] text-indigo-300">✓✓</span>}
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Typing indicator: hiển thị khi user đang nhập */}
                  {selectedUserId && typingUsers.has(selectedUserId) && (
                    <div className="flex justify-start mb-1">
                      <div className="w-7 h-7 rounded-full overflow-hidden bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-[9px] flex-shrink-0 mr-2 mt-auto mb-1">
                        {selectedRoom?.avatarUrl ? (
                          <img src={selectedRoom.avatarUrl.startsWith('http') ? selectedRoom.avatarUrl : `${API.replace('/api', '')}${selectedRoom.avatarUrl}`}
                            alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          (selectedRoom?.customerName ?? 'U').slice(0, 2).toUpperCase()
                        )}
                      </div>
                      <div className="bg-white dark:bg-[#1c2333] px-4 py-3 rounded-2xl rounded-bl-md shadow-sm border border-neutral-100 dark:border-neutral-700/50">
                        <div className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-neutral-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="w-2 h-2 rounded-full bg-neutral-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="w-2 h-2 rounded-full bg-neutral-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Quick responses */}
                <div className="px-4 lg:px-6 pb-2 flex-shrink-0 overflow-x-auto">
                  <div className="flex gap-2 pb-1">
                    {QUICK_RESPONSES.map((text) => (
                      <button key={text} onClick={() => setMessage(text)}
                        className="flex-shrink-0 px-3 py-1.5 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-full text-xs text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700 hover:border-neutral-300 transition-colors outline-none cursor-pointer whitespace-nowrap">
                        {text}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Input */}
                <div className="px-4 lg:px-6 py-3 bg-white dark:bg-[#0d0d0d] border-t border-neutral-200 dark:border-white/[0.06] flex-shrink-0 relative">
                  {/* Emoji Picker Popup */}
                  <AnimatePresence>
                    {showEmojiPicker && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute bottom-16 left-4 z-50 w-72 h-48 p-3 rounded-2xl bg-white/90 dark:bg-neutral-900/90 backdrop-blur-xl border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-y-auto grid grid-cols-8 gap-2 custom-scrollbar"
                      >
                        {EMOJIS.map((emoji) => (
                          <button
                            key={emoji}
                            onClick={() => handleEmojiSelect(emoji)}
                            className="w-7 h-7 flex items-center justify-center text-lg rounded-lg hover:bg-neutral-100 dark:hover:bg-white/[0.08] transition-colors border-none outline-none cursor-pointer"
                          >
                            {emoji}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {replyingTo && (
                    <div className="flex items-center justify-between px-3 py-2 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg mb-2 text-xs">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <CornerUpLeft size={12} className="text-indigo-500 flex-shrink-0" />
                        <span className="text-neutral-500 flex-shrink-0">Đang trả lời</span>
                        <span className="font-semibold text-neutral-850 dark:text-neutral-200 truncate">
                          {replyingTo.sender === 'admin' ? 'Admin' : (selectedRoom?.customerName ?? 'Khách hàng')}
                        </span>
                        <span className="text-neutral-400 dark:text-neutral-500 truncate">
                          : "{replyingTo.messageType === 'image' ? '[Hình ảnh]' : replyingTo.text}"
                        </span>
                      </div>
                      <button
                        onClick={() => setReplyingTo(null)}
                        className="p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 bg-transparent hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded-full border-none outline-none cursor-pointer flex items-center justify-center"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    {/* File Image Upload */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />

                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="w-9 h-9 rounded-lg flex items-center justify-center text-neutral-500 hover:bg-neutral-100 dark:hover:bg-white/[0.08] border-none outline-none flex-shrink-0 disabled:opacity-50"
                      title="Gửi hình ảnh"
                    >
                      {isUploading ? <Loader2 size={18} className="animate-spin" /> : <Paperclip size={18} />}
                    </button>

                    <button
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className="w-9 h-9 rounded-lg flex items-center justify-center text-neutral-500 hover:bg-neutral-100 dark:hover:bg-white/[0.08] border-none outline-none flex-shrink-0"
                      title="Chọn biểu cảm"
                    >
                      <Smile size={18} />
                    </button>

                    <input ref={inputRef} type="text" value={message}
                      onChange={handleAdminInput} onKeyDown={handleKeyDown}
                      placeholder="Trả lời khách hàng..."
                      className="flex-1 h-10 px-4 bg-neutral-100 dark:bg-white/[0.04] border border-neutral-200 dark:border-white/[0.08] rounded-lg text-sm text-black dark:text-white placeholder:text-neutral-400 outline-none focus:border-indigo-500/50 transition-colors min-w-0" />

                    <button onClick={handleSend} disabled={!message.trim()}
                      className={`h-10 px-5 rounded-lg text-sm font-medium flex items-center gap-2 transition-all border-none outline-none flex-shrink-0 ${message.trim() ? 'bg-indigo-600 text-white hover:bg-indigo-700 cursor-pointer' : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-400 cursor-not-allowed'}`}>
                      <Send size={14} /><span className="hidden sm:inline">Gửi</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Info panel */}
              <AnimatePresence>
                {showInfo && (
                  <motion.div initial={{ width: 0, opacity: 0 }} animate={{ width: 280, opacity: 1 }} exit={{ width: 0, opacity: 0 }} transition={{ duration: 0.2 }}
                    className="hidden xl:flex flex-col border-l border-neutral-200 dark:border-white/[0.06] bg-white dark:bg-[#0d0d0d] overflow-hidden flex-shrink-0">
                    <div className="p-5 flex flex-col items-center border-b border-neutral-100 dark:border-white/[0.06]">
                      <div className="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl mb-3">
                        {selectedRoom.avatarUrl ? (
                          <img src={selectedRoom.avatarUrl.startsWith('http') ? selectedRoom.avatarUrl : `${API.replace('/api', '')}${selectedRoom.avatarUrl}`}
                            alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          (selectedRoom.customerName ?? 'U').slice(0, 2).toUpperCase()
                        )}
                      </div>
                      <h3 className="text-sm font-bold text-black dark:text-white">{selectedRoom.customerName}</h3>
                      <p className="text-xs text-neutral-500 mt-0.5">ID: {selectedRoom.userId}</p>
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => {
                            if (selectedRoom.customerEmail) {
                              navigate(`/admin/customers?email=${encodeURIComponent(selectedRoom.customerEmail)}`);
                            } else {
                              navigate(`/admin/customers?search=${encodeURIComponent(selectedRoom.userId)}`);
                            }
                          }}
                          className="px-3 py-1.5 bg-neutral-100 dark:bg-white/[0.06] rounded-lg text-xs font-medium text-neutral-700 dark:text-white/70 hover:bg-neutral-200 dark:hover:bg-white/[0.1] transition-colors border-none outline-none cursor-pointer"
                        >
                          Hồ sơ
                        </button>
                        <button
                          onClick={() => {
                            if (selectedRoom.customerEmail) {
                              navigate(`/admin/orders?email=${encodeURIComponent(selectedRoom.customerEmail)}`);
                            } else {
                              navigate(`/admin/orders?search=${encodeURIComponent(selectedRoom.userId)}`);
                            }
                          }}
                          className="px-3 py-1.5 bg-neutral-100 dark:bg-white/[0.06] rounded-lg text-xs font-medium text-neutral-700 dark:text-white/70 hover:bg-neutral-200 dark:hover:bg-white/[0.1] transition-colors border-none outline-none cursor-pointer"
                        >
                          Đơn hàng
                        </button>
                      </div>
                    </div>
                    <div className="p-4 flex-1 overflow-y-auto custom-scrollbar">
                      <h4 className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-3">Thông tin</h4>
                      <div className="space-y-3">
                        {[
                          { icon: Mail, label: selectedRoom.customerEmail ?? 'Chưa có' },
                          { icon: MapPin, label: selectedRoom.customerAddress ?? 'Chưa cập nhật' },
                          { icon: Phone, label: selectedRoom.customerPhone ?? 'Chưa cập nhật' },
                          { icon: Hash, label: `Room: ${selectedRoom.userId}` },
                        ].map((item, i) => (
                          <div key={i} className="flex items-start gap-2.5">
                            <item.icon size={14} className="text-neutral-400 mt-0.5 flex-shrink-0" />
                            <span className="text-xs text-neutral-600 dark:text-neutral-400 break-all">{item.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-20 h-20 rounded-2xl bg-neutral-100 dark:bg-white/[0.04] flex items-center justify-center mx-auto mb-4">
                <Send size={32} className="text-neutral-300 dark:text-neutral-600" />
              </div>
              <h3 className="text-lg font-bold text-black dark:text-white">Chọn cuộc hội thoại</h3>
              <p className="text-sm text-neutral-500 mt-1">Chọn một cuộc trò chuyện từ danh sách bên trái</p>
            </div>
          </div>
        )}
      </div>

      {/* Image Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImage(null)}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm cursor-zoom-out"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative max-w-5xl max-h-[90vh] w-full h-full flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 w-10 h-10 bg-black/50 hover:bg-black/80 text-white rounded-full flex items-center justify-center transition-colors border-none outline-none cursor-pointer z-10"
              >
                <X size={20} color="#ffffff" className="text-white" />
              </button>
              <img
                src={selectedImage}
                alt="Phóng to"
                className="w-full h-full object-contain rounded-lg shadow-2xl"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
