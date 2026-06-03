import React, { useState, useEffect, useCallback } from 'react';
import { Product } from '@types';
import { getProductById } from '@services/product.service';
import { useParams } from '@routes/router';
import { formatPrice } from '@utils/format';
import { useCart } from '@hooks/useCart';
import { useWishlist } from '@hooks/useWishlist';
import { Button } from '@components/common/Button';
import { ProductImageGallery } from '@/components/users/product/ProductImageGallery';
import { Heart, Minus, Plus, ShoppingCart, ShieldCheck, ArrowLeft, Star, User, Loader2, HelpCircle, MessageSquare, Send, CheckCircle2 } from 'lucide-react';
import { Link } from '@routes/router';
import { motion } from 'motion/react';
import { apiClient, type ProductReview, type ProductQuestion } from '@services/api-client';
import { getAuth } from '@services/auth.service';
import toast from 'react-hot-toast';

/** Read-only star display */
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

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams('/product/:id');
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  // Reviews
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);

  // Q&A
  const [questions, setQuestions] = useState<ProductQuestion[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [newQuestion, setNewQuestion] = useState('');
  const [submittingQuestion, setSubmittingQuestion] = useState(false);
  const [replyingToId, setReplyingToId] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);
  const [showQuestionForm, setShowQuestionForm] = useState(false);

  const renderReplyContent = (content: string, question: ProductQuestion) => {
    const names = new Set<string>();
    if (question.userName) names.add(question.userName);
    if (question.replies) {
      question.replies.forEach(r => {
        if (r.userName) names.add(r.userName);
      });
    }
    names.add('Khách hàng');
    names.add('Admin');
    names.add('Quản trị viên');
    names.add('QTV');

    const sortedNames = Array.from(names).sort((a, b) => b.length - a.length);
    const escapeRegExp = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const namePattern = sortedNames.map(escapeRegExp).join('|');

    const regex = new RegExp(`^@(${namePattern})(:?\\s+|$)(.*)`, 'i');
    const match = content.match(regex);

    if (match) {
      const mentionName = match[1];
      const rest = match[3];
      return (
        <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
          <span className="text-indigo-600 dark:text-indigo-400 font-bold mr-1">
            @{mentionName}
          </span>
          {rest}
        </p>
      );
    }

    const fallbackMatch = content.match(/^(@[^\s:]+):?\s*(.*)/);
    if (fallbackMatch) {
      const mention = fallbackMatch[1];
      const rest = fallbackMatch[2];
      return (
        <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
          <span className="text-indigo-600 dark:text-indigo-400 font-bold mr-1">
            {mention}
          </span>
          {rest}
        </p>
      );
    }

    return <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">{content}</p>;
  };

  const fetchQuestions = useCallback(async () => {
    if (!id) return;
    setLoadingQuestions(true);
    try {
      const res = await apiClient.getProductQuestions(Number(id));
      if (res.success && res.data) {
        setQuestions(res.data.items);
      }
    } catch {
      // ignore
    } finally {
      setLoadingQuestions(false);
    }
  }, [id]);

  useEffect(() => {
    if (!id) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsLoading(true);
    void getProductById(Number(id)).then((prod) => {
      if (prod) {
        setProduct(prod);
      }
      setIsLoading(false);
    });
  }, [id]);

  // Fetch reviews and questions
  useEffect(() => {
    if (!id) return;
    const load = async () => {
      setLoadingReviews(true);
      try {
        const res = await apiClient.getProductReviews(Number(id));
        if (res.success && res.data) {
          setReviews(res.data.items);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingReviews(false);
      }
      await fetchQuestions();
    };
    void load();
  }, [id, fetchQuestions]);

  const handleAskQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    const auth = getAuth();
    if (!auth?.token) {
      toast.error('Vui lòng đăng nhập để đặt câu hỏi.');
      return;
    }
    if (!newQuestion.trim()) return;

    setSubmittingQuestion(true);
    try {
      const res = await apiClient.submitQuestion({
        productId: Number(id),
        content: newQuestion,
        parentId: null
      }, auth.token);

      if (res.success) {
        toast.success('Câu hỏi của bạn đã được gửi thành công!');
        setNewQuestion('');
        setShowQuestionForm(false);
        void fetchQuestions();
      } else {
        toast.error(res.message || 'Không thể gửi câu hỏi.');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Lỗi khi gửi câu hỏi.';
      toast.error(msg);
    } finally {
      setSubmittingQuestion(false);
    }
  };

  const handleAskReply = async (parentId: number) => {
    const auth = getAuth();
    if (!auth?.token) {
      toast.error('Vui lòng đăng nhập để phản hồi.');
      return;
    }
    if (!replyContent.trim()) return;

    setSubmittingReply(true);
    try {
      const res = await apiClient.submitQuestion({
        productId: Number(id),
        content: replyContent,
        parentId: parentId
      }, auth.token);

      if (res.success) {
        toast.success('Gửi phản hồi thành công!');
        setReplyContent('');
        setReplyingToId(null);
        void fetchQuestions();
      } else {
        toast.error(res.message || 'Không thể gửi phản hồi.');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Lỗi khi gửi phản hồi.';
      toast.error(msg);
    } finally {
      setSubmittingReply(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pt-32 px-6 max-w-[1400px] mx-auto animate-pulse flex flex-col md:flex-row gap-12">
        <div className="w-full md:w-1/2 bg-neutral-200 dark:bg-neutral-800 rounded-md aspect-square"></div>
        <div className="w-full md:w-1/2 space-y-6">
          <div className="h-10 bg-neutral-200 dark:bg-neutral-800 rounded w-3/4"></div>
          <div className="h-6 bg-neutral-200 dark:bg-neutral-800 rounded w-1/4"></div>
          <div className="h-32 bg-neutral-200 dark:bg-neutral-800 rounded w-full"></div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen pt-40 px-6 text-center">
        <h3 className="text-2xl font-bold mb-4 text-black dark:text-white">Không tìm thấy sản phẩm</h3>
        <Link to="/products" className="text-neutral-500 hover:text-black dark:hover:text-white underline">Quay lại cửa hàng</Link>
      </div>
    );
  }

  const discount = product.discountPercent ?? 0;
  const isWish = isInWishlist(product.id);

  // Calculate rating distribution
  const ratingDistribution = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: reviews.filter(r => r.rating === star).length,
    percent: reviews.length > 0 ? (reviews.filter(r => r.rating === star).length / reviews.length) * 100 : 0,
  }));

  const avgRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : Number(product.rating);

  const BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api').replace('/api', '');

  return (
    <div className="pt-24 pb-20">
      <div className="max-w-[1400px] mx-auto px-6">
        <Link to="/products" className="inline-flex items-center text-sm font-semibold tracking-wide text-neutral-500 hover:text-black dark:hover:text-white mb-10 transition-colors uppercase">
          <ArrowLeft size={16} className="mr-2" /> Quay lại cửa hàng
        </Link>

        <div className="flex flex-col lg:flex-row gap-12 xl:gap-24">
          {/* Left Side: Image Gallery */}
          <div className="w-full lg:w-1/2 flex flex-col">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className=""
            >
              <ProductImageGallery images={product.images} productName={product.name} />
            </motion.div>

            {/* Reviews Section */}
            <div id="reviews-section" className="mt-12">
              <h3 className="text-xl font-bold mb-6 tracking-tight text-black dark:text-white">
                Đánh giá từ khách hàng ({reviews.length})
              </h3>

              {loadingReviews ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 size={24} className="animate-spin text-neutral-400" />
                </div>
              ) : reviews.length > 0 ? (
                <div className="space-y-8">
                  {/* Rating Summary */}
                  <div className="bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                      <div className="text-center sm:text-left">
                        <div className="text-5xl font-black text-black dark:text-white tracking-tighter">{avgRating.toFixed(1)}</div>
                        <StarDisplay rating={Math.round(avgRating)} size={20} />
                        <p className="text-sm text-neutral-500 mt-1">{reviews.length} đánh giá</p>
                      </div>

                      <div className="flex-1 w-full space-y-2">
                        {ratingDistribution.map(({ star, count, percent }) => (
                          <div key={star} className="flex items-center gap-3">
                            <span className="text-sm font-semibold text-neutral-500 w-6">{star}★</span>
                            <div className="flex-1 h-2.5 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${percent}%` }}
                                transition={{ duration: 0.6, delay: (5 - star) * 0.1 }}
                                className="h-full bg-yellow-400 rounded-full"
                              />
                            </div>
                            <span className="text-xs font-semibold text-neutral-400 w-8 text-right">{count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Individual Reviews */}
                  <div className="space-y-4">
                    {reviews.map((review, idx) => (
                      <motion.div
                        key={review.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-2xl p-5"
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-full bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center flex-shrink-0 overflow-hidden">
                            {review.userAvatar ? (
                              <img
                                src={review.userAvatar.startsWith('http') ? review.userAvatar : `${BASE_URL}${review.userAvatar.startsWith('/') ? '' : '/'}${review.userAvatar}`}
                                alt={review.userName}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <User size={18} className="text-neutral-400" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h5 className="text-sm font-bold text-black dark:text-white">{review.userName || 'Khách hàng'}</h5>
                              <span className="text-xs text-neutral-400">{new Date(review.createdAt).toLocaleDateString('vi-VN')}</span>
                            </div>
                            <StarDisplay rating={review.rating} size={14} />
                            {review.comment && (
                              <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2 leading-relaxed">{review.comment}</p>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-neutral-50 dark:bg-neutral-900/30 rounded-2xl border border-dashed border-neutral-200 dark:border-neutral-800 py-12 text-center">
                  <Star size={32} className="mx-auto mb-3 text-neutral-300 dark:text-neutral-700" />
                  <p className="text-neutral-500 font-medium">Chưa có đánh giá nào cho sản phẩm này</p>
                  <p className="text-sm text-neutral-400 mt-1">Hãy là người đầu tiên đánh giá sản phẩm!</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Side: Product Info */}
          <div className="w-full lg:w-1/2 flex flex-col pt-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="mb-4 text-[11px] font-bold uppercase tracking-widest text-neutral-400">
                {product.brand}
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter mb-6 text-black dark:text-white leading-[1.1]">
                {product.name}
              </h1>

              <div className="flex items-center gap-4 text-sm mb-8">
                <div className="flex items-center gap-1 text-yellow-500 font-bold">
                  <Star size={16} className="fill-current" /> {avgRating.toFixed(1)} <span className="text-neutral-500 ml-1 font-medium">({reviews.length || product.reviewsCount} đánh giá)</span>
                </div>
                <div className="w-1.5 h-1.5 bg-neutral-300 dark:bg-neutral-700 rounded-full"></div>
                <div className={`font-bold tracking-wide text-xs uppercase ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {product.stock > 0 ? 'Còn hàng' : 'Hết hàng'}
                </div>
              </div>

              <div className="flex items-end gap-4 mb-8">
                <span className="text-4xl font-bold text-black dark:text-white leading-none">{formatPrice(product.price)}</span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <>
                    <span className="text-xl text-neutral-400 line-through leading-none mb-0.5">{formatPrice(product.originalPrice)}</span>
                    <span className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-bold px-2 py-1 rounded-sm shadow-sm tracking-wide mb-1.5">
                      Tiết kiệm {discount}%
                    </span>
                  </>
                )}
              </div>

              <p className="text-neutral-500 leading-relaxed mb-12 text-lg font-medium">
                {product.description}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-12 pb-12 border-b border-neutral-200 dark:border-neutral-800">
                <div className="flex items-center border border-neutral-300 dark:border-neutral-700 rounded-md h-14 bg-white dark:bg-neutral-900 w-full sm:w-36 justify-between px-4">
                  <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="text-neutral-400 hover:text-black dark:hover:text-white transition-colors">
                    <Minus size={20} />
                  </button>
                  <span className="font-bold text-lg text-black dark:text-white">{quantity}</span>
                  <button onClick={() => setQuantity(q => Math.min(product.stock, q + 1))} className="text-neutral-400 hover:text-black dark:hover:text-white transition-colors">
                    <Plus size={20} />
                  </button>
                </div>

                <Button
                  size="lg"
                  className="flex-1 text-lg"
                  onClick={() => addToCart(product, quantity)}
                  disabled={product.stock <= 0}
                >
                  <ShoppingCart size={20} className="mr-3" /> Thêm vào giỏ hàng
                </Button>

                <Button
                  variant="secondary"
                  size="lg"
                  className={`w-14 sm:w-14 px-0 border-neutral-300 dark:border-neutral-700 ${isWish ? 'text-red-500 hover:text-red-600 bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900' : ''}`}
                  onClick={() => toggleWishlist(product)}
                >
                  <Heart size={20} className={isWish ? 'fill-current' : ''} />
                </Button>
              </div>

              {/* Guarantees */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-14">
                <div className="flex items-start gap-4">
                  <ShieldCheck className="text-neutral-400 mt-1" size={28} />
                  <div>
                    <h4 className="font-bold text-sm mb-1 text-black dark:text-white tracking-wide">Bảo hành 1 năm</h4>
                    <p className="text-xs font-medium text-neutral-500 leading-relaxed">Bao gồm bảo hành chính hãng từ nhà sản xuất.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <ShoppingCart className="text-neutral-400 mt-1" size={28} />
                  <div>
                    <h4 className="font-bold text-sm mb-1 text-black dark:text-white tracking-wide">Giao hàng miễn phí</h4>
                    <p className="text-xs font-medium text-neutral-500 leading-relaxed">Giao hàng tiêu chuẩn miễn phí cho tất cả dòng máy flagship.</p>
                  </div>
                </div>
              </div>

              {/* Specs */}
              {product.specs && product.specs.length > 0 && (
                <div className="mb-14">
                  <h3 className="text-xl font-bold mb-6 tracking-tight text-black dark:text-white">Thông số kỹ thuật chi tiết</h3>
                  <div className="border border-neutral-200 dark:border-neutral-800 rounded-md overflow-hidden">
                    {product.specs.map((spec, idx) => (
                      <div key={spec.specName} className={`flex px-6 py-5 ${idx !== 0 ? 'border-t border-neutral-200 dark:border-neutral-800' : ''} ${idx % 2 === 0 ? 'bg-neutral-50 dark:bg-neutral-900/50' : 'bg-white dark:bg-neutral-900'}`}>
                        <div className="w-1/3 text-xs font-bold uppercase tracking-wider text-neutral-500">{spec.specName}</div>
                        <div className="w-2/3 text-sm text-black dark:text-white font-semibold">{spec.specValue}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}



              {/* Q&A Section */}
              <div id="qna-section" className="mt-16 pt-16 border-t border-neutral-200 dark:border-neutral-800">
                <h3 className="text-xl font-bold mb-6 tracking-tight text-black dark:text-white flex items-center gap-2">
                  <HelpCircle size={22} className="text-neutral-500" />
                  Hỏi đáp về sản phẩm ({questions.length})
                </h3>

                {/* Ask a Question Form */}
                {!showQuestionForm ? (
                  <div className="mb-8 flex justify-between items-center bg-neutral-50 dark:bg-neutral-900/40 rounded-2xl p-3 border border-neutral-200 dark:border-neutral-800">
                    <p className="text-xs text-neutral-500 font-medium">Bạn có thắc mắc về sản phẩm? Hãy đặt câu hỏi.</p>
                    <button
                      onClick={() => setShowQuestionForm(true)}
                      className="inline-flex h-10 items-center justify-center bg-black text-white dark:bg-white dark:text-black px-6 font-bold rounded-xl hover:opacity-85 transition-all text-xs gap-1.5 active:scale-95 cursor-pointer"
                    >
                      Đặt câu hỏi
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleAskQuestion} className="mb-10 bg-neutral-50 dark:bg-neutral-900/40 rounded-2xl p-5 border border-neutral-200 dark:border-neutral-800">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="text-sm font-bold text-black dark:text-white">Đặt câu hỏi của bạn</h4>
                      <button
                        type="button"
                        onClick={() => setShowQuestionForm(false)}
                        className="text-xs text-neutral-400 hover:text-black dark:hover:text-white font-bold bg-transparent border-none outline-none cursor-pointer"
                      >
                        Hủy
                      </button>
                    </div>
                    <div className="flex gap-3">
                      <textarea
                        placeholder="Nhập nội dung câu hỏi (ví dụ: Sản phẩm này có hỗ trợ sạc nhanh không?)..."
                        value={newQuestion}
                        onChange={(e) => setNewQuestion(e.target.value)}
                        rows={3}
                        className="flex-1 text-sm bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl p-3 resize-none outline-none focus:border-black dark:focus:border-white transition-colors text-black dark:text-white placeholder:text-neutral-400"
                        autoFocus
                      />
                    </div>
                    <div className="flex justify-between items-center mt-3">
                      <span className="text-xs text-neutral-400">Tối đa 3 câu hỏi/ngày. Tránh spam nội dung quảng cáo.</span>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setShowQuestionForm(false)}
                          className="inline-flex h-10 items-center justify-center bg-neutral-200 text-neutral-700 dark:bg-neutral-850 dark:text-neutral-300 px-4 font-bold rounded-xl hover:opacity-85 transition-opacity text-xs cursor-pointer border-none"
                        >
                          Hủy
                        </button>
                        <button
                          type="submit"
                          disabled={submittingQuestion || !newQuestion.trim()}
                          className="inline-flex h-10 items-center justify-center bg-black text-white dark:bg-white dark:text-black px-5 font-bold rounded-xl hover:opacity-85 transition-opacity text-xs gap-1.5 disabled:opacity-50 cursor-pointer"
                        >
                          {submittingQuestion ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
                          Gửi câu hỏi
                        </button>
                      </div>
                    </div>
                  </form>
                )}

                {/* Questions List */}
                {loadingQuestions ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 size={24} className="animate-spin text-neutral-400" />
                  </div>
                ) : questions.length > 0 ? (
                  <div className="space-y-6">
                    {questions.map((question, idx) => (
                      <motion.div
                        key={question.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-2xl p-5 shadow-sm"
                      >
                        {/* Root Question */}
                        <div className="relative flex items-start gap-4">
                          {question.replies && question.replies.length > 0 && (
                            <div className="absolute top-10 left-5 bottom-0 w-px bg-neutral-300 dark:bg-neutral-700" />
                          )}
                          <div className="w-10 h-10 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center flex-shrink-0 overflow-hidden">
                            {question.userAvatar ? (
                              <img
                                src={question.userAvatar.startsWith('http') ? question.userAvatar : `${BASE_URL}${question.userAvatar.startsWith('/') ? '' : '/'}${question.userAvatar}`}
                                alt={question.userName}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <User size={18} className="text-neutral-400" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h5 className="text-sm font-bold text-black dark:text-white flex items-center gap-1.5">
                                {question.userName || 'Khách hàng'}
                                {question.userRole === 'admin' && (
                                  <span className="inline-flex items-center gap-0.5 text-[10px] font-bold bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded">
                                    <CheckCircle2 size={10} className="fill-current" /> Quản trị viên
                                  </span>
                                )}
                              </h5>
                              <span className="text-xs text-neutral-400">{new Date(question.createdAt).toLocaleDateString('vi-VN')}</span>
                            </div>
                            <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-200 leading-relaxed mt-1">{question.content}</p>

                            <div className="mt-3 flex items-center gap-3">
                              <button
                                onClick={() => {
                                  if (replyingToId === question.id) {
                                    setReplyingToId(null);
                                  } else {
                                    setReplyingToId(question.id);
                                    setReplyContent('');
                                  }
                                }}
                                className="text-xs font-bold text-neutral-500 hover:text-black dark:hover:text-white flex items-center gap-1 transition-colors bg-transparent border-none outline-none p-0 cursor-pointer"
                              >
                                <MessageSquare size={12} />
                                Phản hồi
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Replies Thread */}
                        {question.replies && question.replies.length > 0 && (
                          <div className="mt-4 pl-6 ml-5 space-y-4 relative">
                            {question.replies.map((reply, replyIdx) => (
                              <div key={reply.id} className="relative flex items-start gap-3">
                                {/* Vertical tree line segments */}
                                {replyIdx === 0 ? (
                                  question.replies.length === 1 ? (
                                    <div className="absolute left-[-24px] top-[-32px] w-px h-[48px] bg-neutral-300 dark:bg-neutral-700" />
                                  ) : (
                                    <div className="absolute left-[-24px] top-[-32px] bottom-0 w-px bg-neutral-300 dark:bg-neutral-700" />
                                  )
                                ) : replyIdx === question.replies.length - 1 ? (
                                  <div className="absolute left-[-24px] top-[-16px] h-[32px] w-px bg-neutral-300 dark:bg-neutral-700" />
                                ) : (
                                  <div className="absolute left-[-24px] top-[-16px] bottom-0 w-px bg-neutral-300 dark:bg-neutral-700" />
                                )}

                                {/* Connector line */}
                                <div className="absolute top-4 -left-[24px] w-[24px] h-px bg-neutral-300 dark:bg-neutral-700" />

                                <div className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center flex-shrink-0 overflow-hidden">
                                  {reply.userAvatar ? (
                                    <img
                                      src={reply.userAvatar.startsWith('http') ? reply.userAvatar : `${BASE_URL}${reply.userAvatar.startsWith('/') ? '' : '/'}${reply.userAvatar}`}
                                      alt={reply.userName}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <User size={14} className="text-neutral-400" />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between mb-1">
                                    <h6 className="text-xs font-bold text-black dark:text-white flex items-center gap-1.5">
                                      {reply.userName || 'Khách hàng'}
                                      {reply.userRole === 'admin' && (
                                        <span className="inline-flex items-center gap-0.5 text-[9px] font-bold bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-1 py-0.5 rounded">
                                          <CheckCircle2 size={9} className="fill-current" /> Quản trị viên
                                        </span>
                                      )}
                                    </h6>
                                    <span className="text-[10px] text-neutral-400">{new Date(reply.createdAt).toLocaleDateString('vi-VN')}</span>
                                  </div>
                                  {renderReplyContent(reply.content, question)}

                                  <div className="mt-1 flex items-center gap-3">
                                    <button
                                      onClick={() => {
                                        setReplyingToId(question.id);
                                        setReplyContent(`@${reply.userName || 'Khách hàng'}: `);
                                      }}
                                      className="text-[10px] font-bold text-neutral-400 hover:text-black dark:hover:text-white flex items-center gap-0.5 transition-colors bg-transparent border-none outline-none p-0 cursor-pointer"
                                    >
                                      <MessageSquare size={10} />
                                      Phản hồi
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Inline Reply Form */}
                        {replyingToId === question.id && (
                          <div className="mt-4 pl-6 ml-5">
                            <div className="flex gap-2">
                              <input
                                type="text"
                                placeholder="Viết phản hồi..."
                                value={replyContent}
                                onChange={(e) => setReplyContent(e.target.value)}
                                className="flex-1 text-xs bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg px-3 py-2 outline-none focus:border-black dark:focus:border-white transition-colors text-black dark:text-white placeholder:text-neutral-400"
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    void handleAskReply(question.id);
                                  }
                                }}
                              />
                              <button
                                onClick={() => void handleAskReply(question.id)}
                                disabled={submittingReply || !replyContent.trim()}
                                className="inline-flex h-8 w-8 items-center justify-center bg-black text-white dark:bg-white dark:text-black rounded-lg hover:opacity-85 transition-opacity disabled:opacity-50 flex-shrink-0"
                              >
                                {submittingReply ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
                              </button>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-neutral-50 dark:bg-neutral-900/30 rounded-2xl border border-dashed border-neutral-200 dark:border-neutral-800 py-12 text-center">
                    <HelpCircle size={32} className="mx-auto mb-3 text-neutral-300 dark:text-neutral-700" />
                    <p className="text-neutral-500 font-medium">Chưa có câu hỏi nào cho sản phẩm này</p>
                    <p className="text-sm text-neutral-400 mt-1">Hãy đặt câu hỏi đầu tiên!</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};
