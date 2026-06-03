import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, X, Minus, Send, Smile, Paperclip, Zap, Loader2, Trash2, CornerUpLeft } from 'lucide-react';
import { getAuth } from '../../services/auth.service';
import { connectSocket, disconnectSocket, type MessagePayload } from '../../services/chat.socket';

const API = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000/api';

const EMOJIS = [
  '😀', '😂', '🤣', '😊', '😍', '🥰', '😘', '😜', '😎', '🤔',
  '😭', '😡', '😱', '👍', '👎', '👌', '🙏', '👏', '🔥', '🎉',
  '❤️', '💔', '✨', '🌟', '💯', '✔️', '❌', '❓', '💡', '💵'
];

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

const QUICK_REPLIES = [
  'Xin chào shop! 👋',
  'Tôi cần hỗ trợ đơn hàng',
  'Tư vấn sản phẩm',
  'Chính sách đổi trả',
];

export const ChatWidget: React.FC = () => {
  const auth = getAuth();
  const currentUser = auth?.user;
  const currentUserId = currentUser?.id;
  const token = auth?.token;

  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showQuickReplies, setShowQuickReplies] = useState(true);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
  
  const [adminInfo, setAdminInfo] = useState<{ fullName: string; avatarUrl: string | null }>({
    fullName: 'Hỗ trợ NEXPHONE',
    avatarUrl: null,
  });
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Guard refs – đảm bảo mỗi tác vụ chỉ chạy 1 lần
  const hasLoadedRef = useRef(false);
  const socketSetupRef = useRef(false);
  // Ref theo dõi isOpen để dùng trong socket closure (tránh stale)
  const isOpenRef = useRef(isOpen);
  useEffect(() => { isOpenRef.current = isOpen; }, [isOpen]);

  // ── 0. Tải thông tin Admin khi widget mở ─────────────────────────────────
  useEffect(() => {
    if (!isOpen || !currentUserId || !token) return;
    fetch(`${API}/chat/admin-info`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((json: { data: { fullName: string; avatarUrl: string | null } } | null) => {
        if (json?.data) {
          setAdminInfo({
            fullName: json.data.fullName || 'Hỗ trợ NEXPHONE',
            avatarUrl: json.data.avatarUrl,
          });
        }
      })
      .catch(() => { /* silent */ });
  }, [isOpen, currentUserId, token]);

  // ── 1. Tải lịch sử 1 lần khi widget mở lần đầu ───────────────────────────
  useEffect(() => {
    if (!isOpen || !currentUserId || !token || hasLoadedRef.current) return;
    hasLoadedRef.current = true;

    const uid = String(currentUserId);
    let cancelled = false;

    setIsLoading(true);
    fetch(`${API}/chat/messages/${uid}?limit=50`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((json: { data: MessagePayload[] } | null) => {
        if (cancelled || !json?.data?.length) return;
        setMessages(
          json.data.map((p) => ({
            id: p._id ?? String(Date.now()),
            text: p.content,
            sender: p.senderType,
            timestamp: new Date(p.createdAt),
            status: p.senderType === 'user'
              ? (p.isRead ? 'read' as const : 'sent' as const)
              : undefined,
            messageType: p.messageType || 'text',
            replyTo: p.replyTo ? {
              id: p.replyTo._id,
              text: p.replyTo.content,
              sender: p.replyTo.senderType,
              messageType: p.replyTo.messageType || 'text'
            } : null,
          }))
        );
        setShowQuickReplies(false);
      })
      .catch(() => { /* silent */ })
      .finally(() => { if (!cancelled) setIsLoading(false); });

    return () => { cancelled = true; };
  }, [isOpen, currentUserId, token]);

  // ── 2. Kết nối Socket 1 lần khi widget mở ────────────────────────────────
  useEffect(() => {
    if (!isOpen || !currentUserId || socketSetupRef.current) return;
    socketSetupRef.current = true;

    const socket = connectSocket();
    const uid = String(currentUserId);

    const onConnect = () => {
      setIsConnected(true);
      socket.emit('join_chat', uid);
    };
    const onDisconnect = () => setIsConnected(false);
    const onMessage = (payload: MessagePayload) => {
      setMessages((prev) => [
        ...prev,
        {
          id: payload._id ?? String(Date.now()),
          text: payload.content,
          sender: payload.senderType,
          timestamp: new Date(payload.createdAt),
          status: payload.senderType === 'user'
            ? (payload.isRead ? 'read' as const : 'sent' as const)
            : undefined,
          messageType: payload.messageType || 'text',
          replyTo: payload.replyTo ? {
            id: payload.replyTo._id,
            text: payload.replyTo.content,
            sender: payload.replyTo.senderType,
            messageType: payload.replyTo.messageType || 'text'
          } : null,
        },
      ]);
      if (!isOpenRef.current) setHasNewMessage(true);
    };

    const onMessageRecalled = ({ messageId, userId }: { messageId: string; userId: string }) => {
      if (String(currentUserId) === userId) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === messageId
              ? { ...msg, text: 'Tin nhắn đã bị thu hồi', messageType: 'recalled' as const }
              : msg
          )
        );
      }
    };

    const onRoomCleared = ({ userId }: { userId: string }) => {
      if (String(currentUserId) === userId) {
        setMessages([]);
      }
    };

    const onAdminTyping = ({ senderType, isTyping: typing }: { userId: string; senderType: string; isTyping: boolean }) => {
      if (senderType === 'admin') setIsTyping(typing);
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('receive_message', onMessage);
    socket.on('message_recalled', onMessageRecalled);
    socket.on('room_cleared', onRoomCleared);
    socket.on('typing', onAdminTyping);
    if (socket.connected) onConnect();

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('receive_message', onMessage);
      socket.off('message_recalled', onMessageRecalled);
      socket.off('room_cleared', onRoomCleared);
      socket.off('typing', onAdminTyping);
      socketSetupRef.current = false;
    };
  }, [isOpen, currentUserId, token]);

  // ── Scroll to bottom ──────────────────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const formatTime = (date: Date) =>
    date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

  // ── Gửi tin nhắn ─────────────────────────────────────────────────────────
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const emitTyping = (typing: boolean) => {
    if (!currentUser) return;
    connectSocket().emit('typing', {
      userId: String(currentUser.id),
      senderType: 'user',
      isTyping: typing,
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
    // Emit typing start
    emitTyping(true);
    // Auto-stop sau 3 giây không nhập
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => emitTyping(false), 3000);
  };

  const handleSend = () => {
    if (!message.trim() || !currentUser) return;
    // Dừng typing khi gửi
    emitTyping(false);
    if (typingTimerRef.current) { clearTimeout(typingTimerRef.current); typingTimerRef.current = null; }
    connectSocket().emit('send_message', {
      userId: String(currentUser.id),
      senderType: 'user',
      content: message.trim(),
      messageType: 'text',
      senderName: currentUser.fullName,
      replyToId: replyingTo?.id || undefined,
    });
    setMessage('');
    setReplyingTo(null);
    setShowEmojiPicker(false);
    setShowQuickReplies(false);
    inputRef.current?.focus();
  };

  const handleQuickReply = (text: string) => {
    if (!currentUser) return;
    connectSocket().emit('send_message', {
      userId: String(currentUser.id),
      senderType: 'user',
      content: text,
      messageType: 'text',
      senderName: currentUser.fullName,
    });
    setShowQuickReplies(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleRecallMessage = (messageId: string) => {
    if (!currentUser) return;
    const socket = connectSocket();
    socket.emit('recall_message', { messageId, userId: String(currentUser.id) });
  };

  // ── Xử lý upload ảnh (phía user) ───────────────────────────────────────────
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser) return;

    const formData = new FormData();
    formData.append('image', file);

    setIsUploading(true);
    try {
      const res = await fetch(`${API}/chat/upload`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${auth?.token}`,
        },
        body: formData,
      });
      if (!res.ok) throw new Error('Upload thất bại');
      const json = (await res.json()) as { data: { imageUrl: string } };

      const socket = connectSocket();
      socket.emit('send_message', {
        userId: String(currentUser.id),
        senderType: 'user',
        content: json.data.imageUrl,
        messageType: 'image',
        senderName: currentUser.fullName,
        replyToId: replyingTo?.id || undefined,
      });
      setReplyingTo(null);
      setShowQuickReplies(false);
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

  const toggleOpen = () => {
    if (!isOpen) { setIsOpen(true); setIsMinimized(false); setHasNewMessage(false); }
    else setIsOpen(false);
  };

  if (!currentUser) return null;

  return (
    <>
      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && !isMinimized && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed bottom-24 right-4 sm:right-6 z-[60] w-[calc(100vw-32px)] sm:w-[380px] h-[520px] max-h-[calc(100vh-120px)] flex flex-col rounded-2xl shadow-2xl overflow-hidden border border-neutral-200 dark:border-neutral-800"
          >
            {/* Header */}
            <div className="bg-[#1a2332] px-4 py-3 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                {adminInfo.avatarUrl ? (
                  <img
                    src={adminInfo.avatarUrl.startsWith('http') ? adminInfo.avatarUrl : `${API.replace('/api', '')}${adminInfo.avatarUrl}`}
                    alt="Admin Avatar"
                    className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    A
                  </div>
                )}
                <div>
                  <h3 className="text-white font-semibold text-sm leading-tight">{adminInfo.fullName}</h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-neutral-500'}`} />
                    <span className="text-white/60 text-xs">{isConnected ? 'Đang trực tuyến' : 'Đang kết nối...'}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => setIsMinimized(true)} className="w-8 h-8 rounded-lg flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-colors border-none outline-none"><Minus size={16} /></button>
                <button onClick={() => { setIsOpen(false); disconnectSocket(); }} className="w-8 h-8 rounded-lg flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-colors border-none outline-none"><X size={16} /></button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 bg-[#f0f2f5] dark:bg-[#0d1117] custom-scrollbar space-y-1">
              {isLoading && <div className="text-center py-4 text-xs text-neutral-400">Đang tải...</div>}
              {messages.length === 0 && !isLoading && (
                <div className="flex justify-start mb-1">
                  {adminInfo.avatarUrl ? (
                    <img
                      src={adminInfo.avatarUrl.startsWith('http') ? adminInfo.avatarUrl : `${API.replace('/api', '')}${adminInfo.avatarUrl}`}
                      alt="Admin Avatar"
                      className="w-7 h-7 rounded-full object-cover flex-shrink-0 mr-2 mt-auto mb-1"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-[10px] flex-shrink-0 mr-2 mt-auto mb-1">
                      A
                    </div>
                  )}
                  <div className="bg-white dark:bg-[#1c2333] px-3.5 py-2.5 text-sm text-neutral-800 dark:text-neutral-200 rounded-2xl rounded-bl-md shadow-sm border border-neutral-100 dark:border-neutral-700/50 max-w-[75%]">
                    Xin chào {currentUser.fullName}! 👋 Mình có thể giúp gì cho bạn?
                  </div>
                </div>
              )}
              {messages.map((msg, index) => {
                const showTime = index === 0 || (msg.timestamp.getTime() - messages[index - 1].timestamp.getTime()) > 300000;
                return (
                  <div id={`msg-${msg.id}`} key={msg.id} className="transition-colors duration-500 rounded-lg p-0.5">
                    {showTime && (
                      <div className="text-center py-2">
                        <span className="text-[10px] text-neutral-400 dark:text-neutral-500 bg-white/80 dark:bg-neutral-800/80 px-2 py-0.5 rounded-full">{formatTime(msg.timestamp)}</span>
                      </div>
                    )}
                    <div className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} mb-1.5 group`}>
                      {msg.sender === 'admin' && (
                        adminInfo.avatarUrl ? (
                          <img
                            src={adminInfo.avatarUrl.startsWith('http') ? adminInfo.avatarUrl : `${API.replace('/api', '')}${adminInfo.avatarUrl}`}
                            alt="Admin Avatar"
                            className="w-7 h-7 rounded-full object-cover flex-shrink-0 mr-2 mt-auto mb-1"
                          />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-[10px] flex-shrink-0 mr-2 mt-auto mb-1">
                            A
                          </div>
                        )
                      )}
                      
                      <div className={`max-w-[75%] relative group/bubble ${msg.sender === 'user' ? 'order-1' : ''}`}>
                        {/* Recall button - top right */}
                        {msg.sender === 'user' && msg.messageType !== 'recalled' && (
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
                            className={`absolute -bottom-2.5 z-20 w-5.5 h-5.5 rounded-full bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 shadow-sm flex items-center justify-center text-neutral-500 hover:text-indigo-600 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-all opacity-0 group-hover/bubble:opacity-100 cursor-pointer outline-none animate-fade-in ${msg.sender === 'user' ? '-left-2.5' : '-right-2.5'}`}
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
                            className={`text-[10px] px-2 py-1 mb-1 bg-neutral-200/50 dark:bg-neutral-800/40 border-l-2 border-indigo-500 text-neutral-550 dark:text-neutral-450 rounded-lg max-w-full truncate cursor-pointer hover:bg-neutral-300/30 dark:hover:bg-neutral-700/50 transition-colors`}
                          >
                            <span className="font-semibold block text-[8px] text-neutral-600 dark:text-neutral-400">
                              {msg.replyTo.sender === 'user' ? 'Bạn' : adminInfo.fullName}
                            </span>
                            {msg.replyTo.messageType === 'image' ? '[Hình ảnh]' : msg.replyTo.messageType === 'recalled' ? 'Tin nhắn đã bị thu hồi' : msg.replyTo.text}
                          </div>
                        )}

                        {msg.messageType === 'recalled' ? (
                          <div className={`px-3.5 py-2.5 text-xs italic bg-neutral-200/55 dark:bg-neutral-800/40 text-neutral-450 dark:text-neutral-400/85 rounded-2xl border border-dashed border-neutral-350 dark:border-neutral-700/60 ${msg.sender === 'user' ? 'rounded-br-md' : 'rounded-bl-md'}`}>
                            Tin nhắn đã bị thu hồi
                          </div>
                        ) : msg.messageType === 'image' ? (
                          <div className="rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-700 max-w-xs shadow-sm bg-neutral-100 dark:bg-neutral-800">
                            <img src={msg.text.startsWith('http') ? msg.text : `${API.replace('/api', '')}${msg.text}`}
                              alt="Gửi từ chat" className="w-full max-h-60 object-cover cursor-zoom-in hover:scale-[1.02] transition-transform duration-200"
                              onClick={() => window.open(msg.text.startsWith('http') ? msg.text : `${API.replace('/api', '')}${msg.text}`, '_blank')} />
                          </div>
                        ) : (
                          <div className={`px-3.5 py-2.5 text-sm leading-relaxed ${msg.sender === 'user' ? 'bg-[#1a2332] text-white rounded-2xl rounded-br-md' : 'bg-white dark:bg-[#1c2333] text-neutral-800 dark:text-neutral-200 rounded-2xl rounded-bl-md shadow-sm border border-neutral-100 dark:border-neutral-700/50'}`}>
                            {msg.text}
                          </div>
                        )}
                        {msg.sender === 'user' && (
                          <div className="flex items-center justify-end gap-1 mt-0.5 pr-1">
                            <span className="text-[10px] text-neutral-400">{formatTime(msg.timestamp)}</span>
                            {msg.status === 'read' && <span className="text-[10px] text-blue-500">✓✓</span>}
                            {msg.status === 'delivered' && <span className="text-[10px] text-neutral-400">✓✓</span>}
                            {msg.status === 'sent' && <span className="text-[10px] text-neutral-400">✓</span>}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              {isTyping && (
                <div className="flex justify-start mb-1">
                  {adminInfo.avatarUrl ? (
                    <img
                      src={adminInfo.avatarUrl.startsWith('http') ? adminInfo.avatarUrl : `${API.replace('/api', '')}${adminInfo.avatarUrl}`}
                      alt="Admin Avatar"
                      className="w-7 h-7 rounded-full object-cover flex-shrink-0 mr-2 mt-auto mb-1"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-[10px] flex-shrink-0 mr-2 mt-auto mb-1">
                      A
                    </div>
                  )}
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

            {/* Quick Replies */}
            <AnimatePresence>
              {showQuickReplies && messages.length === 0 && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                  className="bg-[#f0f2f5] dark:bg-[#0d1117] px-4 pb-2 flex-shrink-0">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Zap size={12} className="text-amber-500" />
                    <span className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400">Gợi ý nhanh</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {QUICK_REPLIES.map((reply) => (
                      <button key={reply} onClick={() => handleQuickReply(reply)}
                        className="px-3 py-1.5 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-full text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600 transition-colors outline-none cursor-pointer">
                        {reply}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Input */}
            <div className="bg-white dark:bg-[#161b22] border-t border-neutral-200 dark:border-neutral-800 px-3 py-3 flex-shrink-0 relative">
              {replyingTo && (
                <div className="flex items-center justify-between px-2.5 py-1.5 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-850 rounded-lg mb-2 text-[11px]">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <CornerUpLeft size={10} className="text-indigo-500 flex-shrink-0" />
                    <span className="text-neutral-500 flex-shrink-0">Đang trả lời</span>
                    <span className="font-semibold text-neutral-855 dark:text-neutral-250 truncate">
                      {replyingTo.sender === 'user' ? 'Bạn' : adminInfo.fullName}
                    </span>
                    <span className="text-neutral-405 dark:text-neutral-505 truncate">
                      : "{replyingTo.messageType === 'image' ? '[Hình ảnh]' : replyingTo.text}"
                    </span>
                  </div>
                  <button
                    onClick={() => setReplyingTo(null)}
                    className="p-0.5 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 bg-transparent hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded-full border-none outline-none cursor-pointer flex items-center justify-center"
                  >
                    <X size={10} />
                  </button>
                </div>
              )}

              {/* Emoji Picker Popup */}
              <AnimatePresence>
                {showEmojiPicker && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute bottom-16 right-3 z-50 w-64 h-40 p-2.5 rounded-2xl bg-white/95 dark:bg-neutral-900/95 backdrop-blur-xl border border-neutral-200 dark:border-neutral-800 shadow-xl overflow-y-auto grid grid-cols-6 gap-2 custom-scrollbar"
                  >
                    {EMOJIS.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => handleEmojiSelect(emoji)}
                        className="w-8 h-8 flex items-center justify-center text-base rounded-lg hover:bg-neutral-100 dark:hover:bg-white/[0.08] transition-colors border-none outline-none cursor-pointer"
                      >
                        {emoji}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex items-center gap-2 bg-neutral-100 dark:bg-[#0d1117] rounded-full px-3 py-1 border border-neutral-200 dark:border-neutral-700 focus-within:border-indigo-400 dark:focus-within:border-indigo-500 transition-colors">
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
                  className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors border-none outline-none flex-shrink-0 disabled:opacity-50"
                  title="Gửi hình ảnh"
                >
                  {isUploading ? <Loader2 size={16} className="animate-spin" /> : <Paperclip size={18} />}
                </button>

                <input ref={inputRef} type="text" value={message} onChange={handleInputChange} onKeyDown={handleKeyDown}
                  placeholder="Nhập tin nhắn..."
                  className="flex-1 bg-transparent border-none outline-none text-sm text-neutral-800 dark:text-white placeholder:text-neutral-400 py-1.5 min-w-0" />
                
                <button
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors border-none outline-none flex-shrink-0"
                  title="Chọn biểu cảm"
                >
                  <Smile size={18} />
                </button>

                <button onClick={handleSend} disabled={!message.trim()}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all border-none outline-none flex-shrink-0 ${message.trim() ? 'bg-indigo-600 text-white hover:bg-indigo-700 cursor-pointer' : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-400 cursor-not-allowed'}`}>
                  <Send size={14} />
                </button>
              </div>
              <p className="text-center text-[10px] text-neutral-400 mt-2">Phản hồi trung bình trong vài phút</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Minimized bar */}
      <AnimatePresence>
        {isOpen && isMinimized && (
          <motion.button initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
            onClick={() => setIsMinimized(false)}
            className="fixed bottom-24 right-4 sm:right-6 z-[60] bg-[#1a2332] text-white rounded-full px-4 py-2.5 flex items-center gap-2.5 shadow-lg hover:shadow-xl transition-shadow border-none outline-none cursor-pointer">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-[9px] flex-shrink-0">NP</div>
            <span className="text-sm font-medium">Hỗ trợ NEXPHONE</span>
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400' : 'bg-neutral-500'}`} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Floating Button */}
      <motion.button onClick={toggleOpen} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
        className="fixed bottom-20 right-6 z-50 w-[52px] h-[52px] rounded-full shadow-lg hover:shadow-xl transition-shadow border-none outline-none cursor-pointer flex items-center justify-center bg-[#1a2332] text-white"
        aria-label="Mở hộp thoại chat">
        <AnimatePresence mode="wait">
          {isOpen
            ? <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}><X size={22} /></motion.div>
            : <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}><MessageCircle size={22} /></motion.div>
          }
        </AnimatePresence>
        {hasNewMessage && !isOpen && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full border-2 border-white dark:border-neutral-900 animate-pulse" />
        )}
      </motion.button>
    </>
  );
};
