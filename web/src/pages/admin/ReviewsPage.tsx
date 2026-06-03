import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import toast from 'react-hot-toast';
import { Star, Trash2, Search, Loader2, User, Package, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import { apiClient, type AdminReview, type ListParams } from '@services/api-client';
import { getAuth } from '@services/auth.service';

const StarDisplay: React.FC<{ rating: number; size?: number }> = ({ rating, size = 16 }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map(star => (
      <Star
        key={star}
        size={size}
        className={`${star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-neutral-300 dark:text-neutral-600'}`}
      />
    ))}
  </div>
);

export const ReviewsPage: React.FC = () => {
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [ratingFilter, setRatingFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchReviews = useCallback(async () => {
    const auth = getAuth();
    if (!auth?.token) return;
    setLoading(true);
    try {
      const params: ListParams = { page, limit: 10, search: searchQuery || undefined };
      if (ratingFilter !== 'all') {
        params.rating = Number(ratingFilter);
      }
      const res = await apiClient.getReviews(params, auth.token);
      if (res.success && res.data) {
        setReviews(res.data.items);
        setMeta(res.data.meta);
      }
    } catch (error) {
      console.error('Failed to load reviews', error);
    } finally {
      setLoading(false);
    }
  }, [page, searchQuery, ratingFilter]);

  useEffect(() => {
    const load = async () => {
      await Promise.resolve();
      await fetchReviews();
    };
    void load();
  }, [fetchReviews]);

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa đánh giá này?')) return;
    const auth = getAuth();
    if (!auth?.token) return;
    setDeletingId(id);
    try {
      const res = await apiClient.deleteReview(id, auth.token);
      if (res.success) {
        toast.success('Đã xóa đánh giá');
        void fetchReviews();
      } else {
        toast.error(res.message || 'Không thể xóa');
      }
    } catch {
      toast.error('Lỗi khi xóa đánh giá');
    } finally {
      setDeletingId(null);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    void fetchReviews();
  };

  const BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api').replace('/api', '');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Quản lý đánh giá</h1>
          <p className="text-sm opacity-60 mt-1">Quản lý đánh giá sản phẩm từ khách hàng</p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="bg-yellow-100 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 px-3 py-1.5 rounded-lg font-bold">
            {meta.total} đánh giá
          </span>
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
            placeholder="Tìm kiếm theo tên khách hàng, sản phẩm, nhận xét..."
            className="w-full h-10 pl-10 pr-4 bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] rounded-xl text-sm outline-none focus:border-indigo-500/50 text-gray-900 dark:text-white placeholder:text-gray-400"
          />
        </form>
        <select
          value={ratingFilter}
          onChange={(e) => { setRatingFilter(e.target.value); setPage(1); }}
          className="h-10 px-3 bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] rounded-xl text-sm outline-none focus:border-indigo-500/50 text-gray-900 dark:text-white appearance-none cursor-pointer min-w-[140px]"
        >
          <option value="all" className="bg-white dark:bg-[#1A1A1A]">Tất cả sao</option>
          <option value="5" className="bg-white dark:bg-[#1A1A1A]">5 sao</option>
          <option value="4" className="bg-white dark:bg-[#1A1A1A]">4 sao</option>
          <option value="3" className="bg-white dark:bg-[#1A1A1A]">3 sao</option>
          <option value="2" className="bg-white dark:bg-[#1A1A1A]">2 sao</option>
          <option value="1" className="bg-white dark:bg-[#1A1A1A]">1 sao</option>
        </select>
      </div>

      {/* Reviews Table */}
      <div className="bg-white dark:bg-[#141414] border border-gray-100 dark:border-white/[0.06] rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 opacity-50">
            <Loader2 size={28} className="animate-spin mb-3" />
            <p className="text-sm">Đang tải đánh giá...</p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Star size={40} className="text-neutral-300 dark:text-neutral-700 mb-4" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Chưa có đánh giá</h3>
            <p className="text-sm opacity-50">Chưa có đánh giá nào từ khách hàng.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-white/[0.04]">
                    <th className="text-left text-xs font-semibold uppercase tracking-wider opacity-50 px-6 py-4">Khách hàng</th>
                    <th className="text-left text-xs font-semibold uppercase tracking-wider opacity-50 px-6 py-4">Sản phẩm</th>
                    <th className="text-left text-xs font-semibold uppercase tracking-wider opacity-50 px-6 py-4">Đánh giá</th>
                    <th className="text-left text-xs font-semibold uppercase tracking-wider opacity-50 px-6 py-4">Nhận xét</th>
                    <th className="text-left text-xs font-semibold uppercase tracking-wider opacity-50 px-6 py-4">Đơn hàng</th>
                    <th className="text-left text-xs font-semibold uppercase tracking-wider opacity-50 px-6 py-4">Ngày</th>
                    <th className="text-right text-xs font-semibold uppercase tracking-wider opacity-50 px-6 py-4"></th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {reviews.map((review, idx) => (
                      <motion.tr
                        key={review.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ delay: idx * 0.03 }}
                        className="border-b border-gray-50 dark:border-white/[0.02] hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-neutral-800 flex items-center justify-center flex-shrink-0 overflow-hidden">
                              {review.userAvatar ? (
                                <img
                                  src={review.userAvatar.startsWith('http') ? review.userAvatar : `${BASE_URL}${review.userAvatar.startsWith('/') ? '' : '/'}${review.userAvatar}`}
                                  alt={review.userName}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <User size={14} className="text-gray-400" />
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-gray-900 dark:text-white">{review.userName || 'Ẩn danh'}</p>
                              <p className="text-xs text-gray-500">{review.userEmail}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-neutral-800 overflow-hidden flex-shrink-0">
                              {review.productImage ? (
                                <img
                                  src={review.productImage.startsWith('http') ? review.productImage : `${BASE_URL}${review.productImage.startsWith('/') ? '' : '/'}${review.productImage}`}
                                  alt={review.productName}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <Package size={16} className="m-3 text-gray-400" />
                              )}
                            </div>
                            <span className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[160px]">{review.productName}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <StarDisplay rating={review.rating} size={14} />
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-600 dark:text-gray-400 truncate max-w-[200px]">
                            {review.comment || <span className="italic opacity-50">Không có nhận xét</span>}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-xs font-mono text-indigo-500">{review.orderCode}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-500">{new Date(review.createdAt).toLocaleDateString('vi-VN')}</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-1">
                            <a
                              href={`/product/${review.productId}#reviews-section`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-all inline-flex items-center"
                              title="Xem chi tiết sản phẩm"
                            >
                              <ExternalLink size={16} />
                            </a>
                            <button
                              onClick={() => handleDelete(review.id)}
                              disabled={deletingId === review.id}
                              className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all disabled:opacity-50 outline-none border-none bg-transparent cursor-pointer"
                              title="Xóa đánh giá"
                            >
                              {deletingId === review.id ? (
                                <Loader2 size={16} className="animate-spin" />
                              ) : (
                                <Trash2 size={16} />
                              )}
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {meta.totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 dark:border-white/[0.04]">
                <p className="text-sm text-gray-500">
                  Hiển thị {(meta.page - 1) * meta.limit + 1}-{Math.min(meta.page * meta.limit, meta.total)} / {meta.total} đánh giá
                </p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="w-9 h-9 rounded-lg flex items-center justify-center border border-gray-200 dark:border-white/[0.08] text-gray-500 hover:text-gray-900 dark:hover:text-white disabled:opacity-30 transition-all bg-transparent outline-none"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  {Array.from({ length: meta.totalPages }, (_, i) => i + 1)
                    .filter(p => p === 1 || p === meta.totalPages || Math.abs(p - page) <= 1)
                    .map((p, i, arr) => (
                      <React.Fragment key={p}>
                        {i > 0 && arr[i - 1] !== p - 1 && (
                          <span className="px-1 text-gray-400">...</span>
                        )}
                        <button
                          onClick={() => setPage(p)}
                          className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-medium transition-all border outline-none ${
                            p === page
                              ? 'bg-indigo-600 text-white border-indigo-600'
                              : 'border-gray-200 dark:border-white/[0.08] text-gray-600 dark:text-gray-400 hover:border-gray-300 bg-transparent'
                          }`}
                        >
                          {p}
                        </button>
                      </React.Fragment>
                    ))
                  }
                  <button
                    onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}
                    disabled={page >= meta.totalPages}
                    className="w-9 h-9 rounded-lg flex items-center justify-center border border-gray-200 dark:border-white/[0.08] text-gray-500 hover:text-gray-900 dark:hover:text-white disabled:opacity-30 transition-all bg-transparent outline-none"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
