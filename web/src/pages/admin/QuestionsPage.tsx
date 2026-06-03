import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import toast from 'react-hot-toast';
import { HelpCircle, Trash2, Search, Loader2, User, Package, ChevronLeft, ChevronRight, ExternalLink, Send } from 'lucide-react';
import { apiClient, type AdminQuestion, type ListParams } from '@services/api-client';
import { getAuth } from '@services/auth.service';

const statusMap: Record<string, { label: string, color: string }> = {
  pending: { label: 'Chờ phản hồi', color: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border-amber-200 dark:border-amber-500/20' },
  answered: { label: 'Đã phản hồi', color: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20' },
  new_message: { label: 'Có tin nhắn mới', color: 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400 border-red-200 dark:border-red-500/20 animation-pulse' }
};

export const QuestionsPage: React.FC = () => {
  const [questions, setQuestions] = useState<AdminQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Thread detail modal
  const [selectedQuestion, setSelectedQuestion] = useState<AdminQuestion | null>(null);
  const [threadLoading, setThreadLoading] = useState(false);
  const [thread, setThread] = useState<AdminQuestion | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);

  const fetchQuestions = useCallback(async () => {
    const auth = getAuth();
    if (!auth?.token) return;
    setLoading(true);
    try {
      const params: ListParams = { page, limit: 10, search: searchQuery || undefined };
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }
      const res = await apiClient.getAdminQuestions(params, auth.token);
      if (res.success && res.data) {
        setQuestions(res.data.items);
        setMeta(res.data.meta);
      }
    } catch (error) {
      console.error('Failed to load questions', error);
    } finally {
      setLoading(false);
    }
  }, [page, searchQuery, statusFilter]);

  useEffect(() => {
    const load = async () => {
      await fetchQuestions();
    };
    void load();
  }, [fetchQuestions]);

  const fetchThread = useCallback(async (id: number) => {
    const auth = getAuth();
    if (!auth?.token) return;
    setThreadLoading(true);
    try {
      const res = await apiClient.getQuestionThread(id, auth.token);
      if (res.success && res.data) {
        setThread(res.data);
      }
    } catch {
      toast.error('Không thể tải chi tiết cuộc hỏi đáp');
    } finally {
      setThreadLoading(false);
    }
  }, []);

  const handleOpenThread = (q: AdminQuestion) => {
    setSelectedQuestion(q);
    setThread(null);
    void fetchThread(q.id);
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim() || !selectedQuestion) return;
    const auth = getAuth();
    if (!auth?.token) return;

    setSubmittingReply(true);
    try {
      const res = await apiClient.submitQuestion({
        productId: selectedQuestion.productId,
        content: replyContent.trim(),
        parentId: selectedQuestion.id
      }, auth.token);

      if (res.success) {
        toast.success('Đã gửi phản hồi thành công');
        setReplyContent('');
        // Reload thread
        void fetchThread(selectedQuestion.id);
        // Reload list
        void fetchQuestions();
      } else {
        toast.error(res.message || 'Lỗi khi gửi phản hồi');
      }
    } catch {
      toast.error('Lỗi khi gửi phản hồi');
    } finally {
      setSubmittingReply(false);
    }
  };

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Bạn có chắc chắn muốn xóa câu hỏi và tất cả phản hồi liên quan?')) return;
    const auth = getAuth();
    if (!auth?.token) return;
    setDeletingId(id);
    try {
      const res = await apiClient.deleteQuestion(id, auth.token);
      if (res.success) {
        toast.success('Đã xóa câu hỏi thành công');
        if (selectedQuestion?.id === id) {
          setSelectedQuestion(null);
        }
        void fetchQuestions();
      } else {
        toast.error(res.message || 'Không thể xóa');
      }
    } catch {
      toast.error('Lỗi khi xóa câu hỏi');
    } finally {
      setDeletingId(null);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    void fetchQuestions();
  };

  const BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api').replace('/api', '');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Quản lý hỏi đáp (Q&A)</h1>
          <p className="text-sm opacity-60 mt-1">Trả lời thắc mắc của khách hàng về các sản phẩm</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-[#141414] border border-gray-100 dark:border-white/[0.06] rounded-2xl p-4 flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearch} className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm theo tên khách hàng, sản phẩm, nội dung..."
            className="w-full h-10 pl-10 pr-4 bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] rounded-xl text-sm outline-none focus:border-indigo-500/50 text-gray-900 dark:text-white placeholder:text-gray-400"
          />
        </form>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="h-10 px-3 bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] rounded-xl text-sm outline-none focus:border-indigo-500/50 text-gray-900 dark:text-white appearance-none cursor-pointer min-w-[160px]"
        >
          <option value="all" className="bg-white dark:bg-[#1A1A1A]">Tất cả trạng thái</option>
          <option value="pending" className="bg-white dark:bg-[#1A1A1A]">Chờ phản hồi</option>
          <option value="new_message" className="bg-white dark:bg-[#1A1A1A]">Có tin nhắn mới</option>
          <option value="answered" className="bg-white dark:bg-[#1A1A1A]">Đã phản hồi</option>
        </select>
      </div>

      {/* Main Layout: List and Thread Detail side-by-side or stacked */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left: Questions list */}
        <div className={`flex-1 bg-white dark:bg-[#141414] border border-gray-100 dark:border-white/[0.06] rounded-2xl overflow-hidden ${selectedQuestion ? 'lg:max-w-[50%]' : ''} transition-all duration-300`}>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 opacity-50">
              <Loader2 size={28} className="animate-spin mb-3" />
              <p className="text-sm">Đang tải danh sách câu hỏi...</p>
            </div>
          ) : questions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <HelpCircle size={40} className="text-neutral-300 dark:text-neutral-700 mb-4" />
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Chưa có câu hỏi</h3>
              <p className="text-sm opacity-50">Tất cả thắc mắc của khách hàng sẽ hiển thị ở đây.</p>
            </div>
          ) : (
            <>
              <div className="divide-y divide-gray-50 dark:divide-white/[0.02]">
                {questions.map((q) => {
                  const isActive = selectedQuestion?.id === q.id;
                  const config = statusMap[q.status] || { label: q.status, color: 'bg-gray-100 text-gray-800' };
                  return (
                    <div
                      key={q.id}
                      onClick={() => handleOpenThread(q)}
                      className={`p-5 cursor-pointer hover:bg-gray-50/50 dark:hover:bg-white/[0.01] transition-all flex flex-col gap-3 ${
                        isActive ? 'bg-indigo-50/20 dark:bg-indigo-500/5 border-l-4 border-indigo-600' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-neutral-800 overflow-hidden flex items-center justify-center">
                            {q.userAvatar ? (
                              <img
                                src={q.userAvatar.startsWith('http') ? q.userAvatar : `${BASE_URL}${q.userAvatar.startsWith('/') ? '' : '/'}${q.userAvatar}`}
                                alt={q.userName}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <User size={10} className="text-gray-400" />
                            )}
                          </div>
                          <span className="text-xs font-semibold text-gray-900 dark:text-white">{q.userName || 'Ẩn danh'}</span>
                          <span className="text-[10px] text-gray-400">{new Date(q.createdAt).toLocaleDateString('vi-VN')}</span>
                        </div>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${config.color}`}>
                          {config.label}
                        </span>
                      </div>

                      <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 line-clamp-2">{q.content}</p>

                      <div className="flex items-center justify-between mt-1 pt-2 border-t border-gray-50 dark:border-white/[0.02]">
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Package size={12} className="opacity-60" />
                          <span className="truncate max-w-[200px]">{q.productName}</span>
                        </div>
                        <button
                          onClick={(e) => handleDelete(q.id, e)}
                          disabled={deletingId === q.id}
                          className="p-1 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors bg-transparent border-none outline-none cursor-pointer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              {meta.totalPages > 1 && (
                <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100 dark:border-white/[0.04]">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page <= 1}
                      className="w-8 h-8 rounded-lg flex items-center justify-center border border-gray-200 dark:border-white/[0.08] text-gray-500 hover:text-gray-900 dark:hover:text-white disabled:opacity-30 transition-all bg-transparent outline-none cursor-pointer"
                    >
                      <ChevronLeft size={14} />
                    </button>
                    <span className="text-xs text-gray-500 px-2">{page} / {meta.totalPages}</span>
                    <button
                      onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}
                      disabled={page >= meta.totalPages}
                      className="w-8 h-8 rounded-lg flex items-center justify-center border border-gray-200 dark:border-white/[0.08] text-gray-500 hover:text-gray-900 dark:hover:text-white disabled:opacity-30 transition-all bg-transparent outline-none cursor-pointer"
                    >
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Right: Thread details & Reply form */}
        <AnimatePresence>
          {selectedQuestion && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex-1 bg-white dark:bg-[#141414] border border-gray-100 dark:border-white/[0.06] rounded-2xl overflow-hidden flex flex-col min-h-[500px]"
            >
              {/* Product Context header */}
              <div className="p-4 border-b border-gray-100 dark:border-white/[0.04] bg-gray-50 dark:bg-white/[0.01] flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-neutral-800 overflow-hidden flex-shrink-0">
                    {selectedQuestion.productImage ? (
                      <img
                        src={selectedQuestion.productImage.startsWith('http') ? selectedQuestion.productImage : `${BASE_URL}${selectedQuestion.productImage.startsWith('/') ? '' : '/'}${selectedQuestion.productImage}`}
                        alt={selectedQuestion.productName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Package size={16} className="m-3 text-gray-400" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Sản phẩm thắc mắc</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate max-w-[240px]">{selectedQuestion.productName}</p>
                  </div>
                </div>

                <a
                  href={`/product/${selectedQuestion.productId}#qna-section`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-9 items-center justify-center bg-indigo-600 text-white px-4 font-bold rounded-lg hover:bg-indigo-700 transition-colors text-xs gap-1.5"
                >
                  Xem chi tiết sản phẩm <ExternalLink size={12} />
                </a>
              </div>

              {/* Chat thread box */}
              <div className="flex-1 p-5 overflow-y-auto max-h-[400px] min-h-[300px] space-y-4">
                {threadLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 size={24} className="animate-spin text-gray-400" />
                  </div>
                ) : thread ? (
                  <>
                    {/* Root question bubble */}
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {thread.userAvatar ? (
                          <img
                            src={thread.userAvatar.startsWith('http') ? thread.userAvatar : `${BASE_URL}${thread.userAvatar.startsWith('/') ? '' : '/'}${thread.userAvatar}`}
                            alt={thread.userName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User size={14} className="text-gray-400" />
                        )}
                      </div>
                      <div className="bg-gray-100 dark:bg-white/[0.04] rounded-2xl p-4 max-w-[85%]">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold text-gray-900 dark:text-white">{thread.userName || 'Khách hàng'}</span>
                          <span className="text-[10px] text-gray-400">{new Date(thread.createdAt).toLocaleDateString('vi-VN')}</span>
                        </div>
                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 leading-relaxed">{thread.content}</p>
                      </div>
                    </div>

                    {/* Replies list */}
                    {thread.replies?.map((reply) => {
                      const isAdmin = reply.userRole === 'admin';
                      return (
                        <div key={reply.id} className={`flex items-start gap-3 ${isAdmin ? 'flex-row-reverse' : ''}`}>
                          <div className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center flex-shrink-0 overflow-hidden">
                            {reply.userAvatar ? (
                              <img
                                src={reply.userAvatar.startsWith('http') ? reply.userAvatar : `${BASE_URL}${reply.userAvatar.startsWith('/') ? '' : '/'}${reply.userAvatar}`}
                                alt={reply.userName}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <User size={14} className="text-gray-400" />
                            )}
                          </div>
                          <div className={`rounded-2xl p-4 max-w-[85%] ${
                            isAdmin 
                              ? 'bg-indigo-600 text-white' 
                              : 'bg-gray-100 dark:bg-white/[0.04] text-gray-800 dark:text-gray-200'
                          }`}>
                            <div className="flex items-center gap-2 mb-1 justify-between">
                              <span className="text-xs font-bold">{reply.userName || (isAdmin ? 'Quản trị viên' : 'Khách hàng')}</span>
                              <span className="text-[10px] opacity-60">{new Date(reply.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            <p className="text-sm leading-relaxed">{reply.content}</p>
                          </div>
                        </div>
                      );
                    })}
                  </>
                ) : null}
              </div>

              {/* Reply form */}
              <form onSubmit={handleSendReply} className="p-4 border-t border-gray-100 dark:border-white/[0.04] bg-gray-50 dark:bg-[#1C1C1C] flex gap-2">
                <input
                  type="text"
                  placeholder="Nhập nội dung phản hồi của admin..."
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  className="flex-1 h-10 px-4 bg-white dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] rounded-xl text-sm outline-none focus:border-indigo-500/50 text-gray-900 dark:text-white"
                />
                <button
                  type="submit"
                  disabled={submittingReply || !replyContent.trim()}
                  className="inline-flex h-10 px-5 items-center justify-center bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors text-xs gap-1.5 disabled:opacity-50"
                >
                  {submittingReply ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
                  Phản hồi
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
