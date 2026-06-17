import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'motion/react';
import toast from 'react-hot-toast';
import { Package, Clock, CheckCircle2, Truck, XCircle, ArrowRight, X, Printer, ArrowLeft, Star, MessageSquare } from 'lucide-react';
import { getAuth } from '@services/auth.service';
import { orderService, OrderRecord } from '@services/order.service';
import { apiClient, type OrderReviewItem } from '@services/api-client';
import { formatPrice, formatDate } from '@utils/format';
import { Link } from '@routes/router';
import { exportOrderInvoice } from '@utils/exportPdf';

const statusMap: Record<string, { label: string, color: string, icon: React.ReactNode }> = {
  pending: { label: 'Chờ xác nhận', color: 'text-amber-600 bg-amber-50 dark:bg-amber-500/10 dark:text-amber-400 border-amber-200 dark:border-amber-500/20', icon: <Clock size={14} /> },
  confirmed: { label: 'Đã xác nhận', color: 'text-blue-600 bg-blue-50 dark:bg-blue-500/10 dark:text-blue-400 border-blue-200 dark:border-blue-500/20', icon: <CheckCircle2 size={14} /> },
  shipping: { label: 'Đang giao', color: 'text-purple-600 bg-purple-50 dark:bg-purple-500/10 dark:text-purple-400 border-purple-200 dark:border-purple-500/20', icon: <Truck size={14} /> },
  delivered: { label: 'Đã giao', color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20', icon: <CheckCircle2 size={14} /> },
  cancelled: { label: 'Đã hủy', color: 'text-red-600 bg-red-50 dark:bg-red-500/10 dark:text-red-400 border-red-200 dark:border-red-500/20', icon: <XCircle size={14} /> },
};

const formatDateTime = (dateString?: string | Date): string => {
  if (!dateString) return '';
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${hours}:${minutes} ${day}-${month}-${year}`;
};

const OrderStatusStepper: React.FC<{ status: string; createdAt: string; updatedAt?: string }> = ({ status, createdAt, updatedAt }) => {
  const steps = [
    {
      key: 'pending',
      label: 'Đơn Hàng Đã Đặt',
      icon: Clock,
    },
    {
      key: 'confirmed',
      label: 'Đã Xác Nhận',
      icon: CheckCircle2,
    },
    {
      key: 'shipping',
      label: 'Chờ Lấy Hàng',
      icon: Truck,
    },
    {
      key: 'delivered',
      label: 'Đang Giao / Hoàn Thành',
      icon: Package,
    },
  ];

  const getActiveIndex = (status: string) => {
    switch (status) {
      case 'pending': return 0;
      case 'confirmed': return 1;
      case 'shipping': return 2;
      case 'delivered': return 3;
      default: return -1;
    }
  };

  const activeIndex = getActiveIndex(status);

  if (status === 'cancelled') {
    return (
      <div className="w-full bg-neutral-50 dark:bg-neutral-900/30 border-b border-neutral-100 dark:border-neutral-800 p-6">
        <div className="max-w-4xl mx-auto flex items-center gap-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-2xl p-5">
          <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-500 flex-shrink-0">
            <XCircle size={24} />
          </div>
          <div>
            <h5 className="font-bold text-red-600 dark:text-red-400 text-base">Đơn hàng đã hủy</h5>
            <p className="text-xs text-red-500/80 dark:text-red-400/70 mt-0.5">
              Đơn hàng này đã bị hủy vào lúc {updatedAt ? formatDateTime(updatedAt) : formatDateTime(createdAt)}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-neutral-50 dark:bg-neutral-900/30 border-b border-neutral-100 dark:border-neutral-800 p-6 md:p-8">
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6 md:gap-4 relative">
        {/* Progress Line for Desktop */}
        <div className="hidden md:block absolute top-[24px] left-[50px] right-[50px] h-[3px] bg-neutral-200 dark:bg-neutral-800 -z-0">
          <div 
            className="h-full bg-emerald-500 transition-all duration-500 ease-in-out"
            style={{ width: `${(activeIndex / (steps.length - 1)) * 100}%` }}
          />
        </div>

        {steps.map((step, index) => {
          const StepIcon = step.icon;
          const isCompleted = index <= activeIndex;
          const isActive = index === activeIndex;

          // Compute sublabels with actual database timestamps
          let sublabel = '';
          if (step.key === 'pending') {
            sublabel = formatDateTime(createdAt);
          } else if (step.key === 'confirmed' && (status === 'confirmed' || status === 'shipping' || status === 'delivered')) {
            sublabel = status === 'confirmed' && updatedAt ? formatDateTime(updatedAt) : 'Đã xác nhận thanh toán';
          } else if (step.key === 'shipping' && (status === 'shipping' || status === 'delivered')) {
            sublabel = status === 'shipping' && updatedAt ? formatDateTime(updatedAt) : 'Đã giao cho ĐVVC';
          } else if (step.key === 'delivered' && status === 'delivered') {
            sublabel = updatedAt ? formatDateTime(updatedAt) : 'Giao thành công';
          }

          return (
            <div key={step.key} className="flex md:flex-col items-center gap-4 md:gap-2 flex-1 w-full relative z-10">
              {/* Vertical line for mobile */}
              {index < steps.length - 1 && (
                <div className="md:hidden absolute left-[22px] top-[44px] bottom-[-24px] w-[3px] bg-neutral-200 dark:bg-neutral-800 -z-1">
                  <div 
                    className="w-full bg-emerald-500 transition-all duration-500 ease-in-out"
                    style={{ height: isCompleted && index < activeIndex ? '100%' : '0%' }}
                  />
                </div>
              )}

              {/* Circle Icon */}
              <div 
                className={`w-12 h-12 rounded-full flex items-center justify-center border-4 transition-all duration-500 ${
                  isCompleted 
                    ? 'bg-emerald-500 border-white dark:border-neutral-900 text-white shadow-lg shadow-emerald-500/20' 
                    : 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-400'
                } ${isActive ? 'scale-110 ring-4 ring-emerald-500/20' : ''}`}
              >
                <StepIcon size={18} className={isActive ? 'animate-pulse' : ''} />
              </div>

              {/* Labels */}
              <div className="flex flex-col md:items-center text-left md:text-center min-w-0">
                <span 
                  className={`text-sm font-bold transition-colors duration-300 ${
                    isCompleted ? 'text-black dark:text-white' : 'text-neutral-400'
                  }`}
                >
                  {step.label}
                </span>
                {sublabel && (
                  <span className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-0.5 max-w-[150px]">
                    {sublabel}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/** Interactive star rating component */
const StarRating: React.FC<{
  value: number;
  onChange?: (val: number) => void;
  readonly?: boolean;
  size?: number;
}> = ({ value, onChange, readonly = false, size = 20 }) => {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(star)}
          onMouseEnter={() => !readonly && setHover(star)}
          onMouseLeave={() => !readonly && setHover(0)}
          className={`transition-transform ${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'} bg-transparent border-none outline-none p-0`}
        >
          <Star
            size={size}
            className={`transition-colors ${
              star <= (hover || value) 
                ? 'text-yellow-400 fill-yellow-400' 
                : 'text-neutral-300 dark:text-neutral-600'
            }`}
          />
        </button>
      ))}
    </div>
  );
};

export const UserOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<OrderRecord | null>(null);

  // Review state
  const [reviewMode, setReviewMode] = useState(false);
  const [existingReviews, setExistingReviews] = useState<OrderReviewItem[]>([]);
  const [reviewRatings, setReviewRatings] = useState<Record<number, number>>({});
  const [reviewComments, setReviewComments] = useState<Record<number, string>>({});
  const [submittingReview, setSubmittingReview] = useState(false);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [retryingPaymentId, setRetryingPaymentId] = useState<number | null>(null);
  const [cancellingOrderId, setCancellingOrderId] = useState<number | null>(null);

  const handleCancelOrder = async (orderId: number) => {
    const confirmCancel = window.confirm('Bạn có chắc chắn muốn hủy đơn hàng này không?');
    if (!confirmCancel) return;

    const auth = getAuth();
    if (!auth?.token) {
      toast.error('Vui lòng đăng nhập lại để thực hiện');
      return;
    }

    setCancellingOrderId(orderId);
    try {
      const res = await orderService.cancelOrder(orderId, auth.token);
      if (res.success) {
        toast.success('Hủy đơn hàng thành công');
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order.id === orderId ? { ...order, status: 'cancelled' } : order
          )
        );
        setSelectedOrder(prev => prev && prev.id === orderId ? { ...prev, status: 'cancelled' } : prev);
      } else {
        toast.error(res.message || 'Không thể hủy đơn hàng');
      }
    } catch {
      toast.error('Lỗi kết nối khi hủy đơn hàng');
    } finally {
      setCancellingOrderId(null);
    }
  };

  const handleOrderRetryPayment = async (order: OrderRecord) => {
    const auth = getAuth();
    if (!auth?.token) {
      toast.error('Vui lòng đăng nhập lại để thanh toán');
      return;
    }
    setRetryingPaymentId(order.id);
    const toastId = toast.loading('Đang tạo liên kết thanh toán MoMo...');
    try {
      const payRes = await orderService.createMomoPayment(
        order.orderCode,
        Number(order.totalAmount),
        auth.token
      );
      toast.dismiss(toastId);
      if (payRes.success && payRes.data?.payUrl) {
        toast.success('Đang chuyển hướng sang cổng thanh toán MoMo...');
        window.location.replace(payRes.data.payUrl);
      } else {
        toast.error(payRes.message || 'Lỗi khi tạo yêu cầu thanh toán MoMo');
      }
    } catch {
      toast.dismiss(toastId);
      toast.error('Lỗi kết nối khi kết nối cổng thanh toán');
    } finally {
      setRetryingPaymentId(null);
    }
  };

  useEffect(() => {
    const fetchOrders = async () => {
      const auth = getAuth();
      if (!auth?.token) {
        setLoading(false);
        return;
      }
      try {
        const data = await orderService.getMyOrders(auth.token);
        setOrders(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    void fetchOrders();
  }, []);

  // Fetch existing reviews when opening an order detail modal
  const fetchOrderReviews = useCallback(async (orderId: number) => {
    const auth = getAuth();
    if (!auth?.token) return;
    setLoadingReviews(true);
    try {
      const res = await apiClient.getOrderReviews(orderId, auth.token);
      if (res.success && res.data) {
        setExistingReviews(res.data.items);
      }
    } catch {
      // silently fail
    } finally {
      setLoadingReviews(false);
    }
  }, []);

  const openOrderDetail = useCallback((order: OrderRecord) => {
    setSelectedOrder(order);
    setReviewMode(false);
    setExistingReviews([]);
    setReviewRatings({});
    setReviewComments({});
    if (order.status === 'delivered') {
      void fetchOrderReviews(order.id);
    }
  }, [fetchOrderReviews]);

  const handleSubmitReviews = async () => {
    const auth = getAuth();
    if (!auth?.token || !selectedOrder) return;

    const items = (selectedOrder.items || []).map(item => ({
      productId: item.productId,
      rating: reviewRatings[item.productId] || 5,
      comment: reviewComments[item.productId] || '',
    }));

    setSubmittingReview(true);
    try {
      const res = await apiClient.submitReviews(
        { orderId: selectedOrder.id, items },
        auth.token
      );
      if (res.success) {
        toast.success('Đánh giá đã được gửi thành công!');
        setReviewMode(false);
        // Refresh reviews
        void fetchOrderReviews(selectedOrder.id);
      } else {
        toast.error(res.message || 'Không thể gửi đánh giá');
      }
    } catch {
      toast.error('Lỗi khi gửi đánh giá');
    } finally {
      setSubmittingReview(false);
    }
  };

  // Helper to check if a product has been reviewed
  const getProductReview = (productId: number) => {
    return existingReviews.find(r => r.productId === productId);
  };

  const isOrderReviewed = selectedOrder?.items?.every(item => getProductReview(item.productId));

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] pt-32 pb-32">
      <div className="max-w-[1000px] w-full mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 md:mb-12"
        >
          <span className="text-[11px] font-bold tracking-[0.2em] text-neutral-400 uppercase block mb-3">NEXPHONE / TÀI KHOẢN</span>
          <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-black dark:text-white leading-[1]">
            Đơn hàng<br /><span className="text-neutral-300 dark:text-neutral-700">của tôi</span>
          </h1>
        </motion.div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse bg-neutral-100 dark:bg-neutral-900 rounded-2xl h-32 w-full"></div>
            ))}
          </div>
        ) : orders.length > 0 ? (
          <div className="space-y-4">
            {orders.map((order, idx) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 transition-all hover:border-black dark:hover:border-neutral-600"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-4 border-b border-neutral-200 dark:border-neutral-800">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-bold text-black dark:text-white text-lg">{order.orderCode}</span>
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${statusMap[order.status]?.color || 'bg-neutral-100 text-neutral-600'}`}>
                        {statusMap[order.status]?.icon}
                        {statusMap[order.status]?.label || order.status}
                      </span>
                    </div>
                    <p className="text-sm text-neutral-500">Đặt ngày: {formatDate(order.createdAt)}</p>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-sm text-neutral-500 mb-1">Tổng tiền</p>
                    <p className="font-black text-black dark:text-white text-xl tracking-tight">{formatPrice(order.totalAmount)}</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="text-sm text-neutral-500 flex items-center gap-2">
                    <Package size={16} /> {order.items?.length || 0} sản phẩm
                  </div>
                  <div className="flex items-center gap-4">
                    {order.status === 'pending' && (
                      <button
                        disabled={cancellingOrderId !== null}
                        onClick={(e) => {
                          e.stopPropagation();
                          void handleCancelOrder(order.id);
                        }}
                        className="text-sm font-bold text-red-500 hover:opacity-75 transition-opacity disabled:opacity-50"
                      >
                        {cancellingOrderId === order.id ? 'Đang hủy...' : 'Hủy đơn'}
                      </button>
                    )}
                    {order.status === 'pending' && order.paymentMethod === 'momo' && (
                      <button
                        disabled={retryingPaymentId !== null}
                        onClick={(e) => {
                          e.stopPropagation();
                          void handleOrderRetryPayment(order);
                        }}
                        className="text-sm font-bold text-[#A50064] hover:opacity-75 transition-opacity disabled:opacity-50"
                      >
                        {retryingPaymentId === order.id ? 'Đang xử lý...' : 'Thanh toán lại'}
                      </button>
                    )}
                    <button 
                      onClick={() => openOrderDetail(order)}
                      className="text-sm font-bold text-black dark:text-white hover:opacity-70 transition-opacity"
                    >
                      Xem chi tiết
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center text-center py-20 bg-neutral-50 dark:bg-neutral-900/30 rounded-3xl border border-dashed border-neutral-200 dark:border-neutral-800">
            <div className="w-20 h-20 rounded-full bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center text-neutral-400 mb-6">
              <Package size={40} strokeWidth={1} />
            </div>
            <h3 className="text-2xl font-black tracking-tight text-black dark:text-white mb-2">Chưa có đơn hàng</h3>
            <p className="text-neutral-500 max-w-md mb-8">Bạn chưa đặt mua sản phẩm nào. Khám phá các dòng điện thoại cao cấp của chúng tôi ngay hôm nay.</p>
            <Link to="/products" className="inline-flex h-12 items-center justify-center bg-black text-white dark:bg-white dark:text-black px-8 font-bold rounded-xl hover:opacity-85 transition-opacity text-sm gap-2">
              Khám phá sản phẩm <ArrowRight size={16} />
            </Link>
          </motion.div>
        )}
      </div>

      {selectedOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white dark:bg-neutral-900 rounded-3xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
          >
            <div className="p-6 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between bg-white dark:bg-neutral-900 z-10 flex-shrink-0">
              <div>
                <h3 className="text-xl font-black text-black dark:text-white mb-1">Chi tiết đơn hàng</h3>
                <p className="text-sm text-neutral-500">Mã đơn: <strong className="text-black dark:text-white">{selectedOrder.orderCode}</strong></p>
              </div>
              <button 
                onClick={() => setSelectedOrder(null)}
                className="w-10 h-10 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-500 hover:text-black dark:hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col min-h-0">
              <OrderStatusStepper 
                status={selectedOrder.status} 
                createdAt={selectedOrder.createdAt} 
                updatedAt={selectedOrder.updatedAt} 
              />
              
              <div className="flex flex-col lg:flex-row lg:overflow-hidden lg:flex-1 min-h-0">
              <div className="w-full lg:w-1/2 flex flex-col border-r border-neutral-100 dark:border-neutral-800">
                <div className="p-6 lg:overflow-y-auto lg:custom-scrollbar flex-1">
                  <div className="mb-8">
                    <h4 className="text-sm font-bold text-black dark:text-white uppercase tracking-wider mb-4">Thông tin giao hàng</h4>
                    <div className="bg-neutral-50 dark:bg-neutral-800/50 rounded-2xl p-5 space-y-4 text-sm">
                      <div className="flex flex-col gap-1">
                        <span className="text-neutral-500 text-xs font-bold uppercase tracking-wider">Người nhận</span>
                        <span className="font-semibold text-black dark:text-white">{selectedOrder.customerName}</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-neutral-500 text-xs font-bold uppercase tracking-wider">Điện thoại</span>
                        <span className="font-semibold text-black dark:text-white">{selectedOrder.customerPhone}</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-neutral-500 text-xs font-bold uppercase tracking-wider">Địa chỉ</span>
                        <span className="font-semibold text-black dark:text-white leading-relaxed">{selectedOrder.shippingAddress}</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-neutral-500 text-xs font-bold uppercase tracking-wider">Thanh toán</span>
                        <span className="font-semibold text-black dark:text-white uppercase">{selectedOrder.paymentMethod === 'cod' ? 'Thanh toán khi nhận hàng' : selectedOrder.paymentMethod}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="w-full lg:w-1/2 flex flex-col bg-neutral-50/50 dark:bg-neutral-800/20">
                <div className="p-6 lg:overflow-y-auto lg:custom-scrollbar flex-1">
                  <h4 className="text-sm font-bold text-black dark:text-white uppercase tracking-wider mb-4">Sản phẩm ({selectedOrder.items?.length || 0})</h4>
                  <div className="space-y-4">
                    {selectedOrder.items?.map((item, i) => {
                      const existingReview = getProductReview(item.productId);
                      return (
                        <div key={i} className="border-b border-neutral-100 dark:border-neutral-800 last:border-0 pb-4 last:pb-0">
                          <div className="flex items-center gap-4 py-1">
                            <div className="w-16 h-16 rounded-xl bg-white dark:bg-neutral-800 overflow-hidden flex-shrink-0 border border-neutral-100 dark:border-neutral-700">
                              {item.productImage ? (
                                <img 
                                  src={item.productImage.startsWith('http') ? item.productImage : (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api').replace('/api', '') + (item.productImage.startsWith('/') ? '' : '/') + item.productImage} 
                                  alt={item.productName} 
                                  className="w-full h-full object-cover" 
                                />
                              ) : (
                                <Package className="w-8 h-8 m-4 text-neutral-300" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-black dark:text-white truncate">{item.productName}</p>
                              <p className="text-xs text-neutral-500 mt-1">Số lượng: {item.quantity}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-black text-black dark:text-white">{formatPrice(item.lineTotal)}</p>
                            </div>
                          </div>

                          {/* Review section - only for delivered orders */}
                          {selectedOrder.status === 'delivered' && !loadingReviews && (
                            <div className="mt-2 ml-20">
                              {existingReview ? (
                                // Already reviewed - show rating
                                <div className="flex items-center gap-2">
                                  <StarRating value={existingReview.rating} readonly size={16} />
                                  {existingReview.comment && (
                                    <span className="text-xs text-neutral-500 italic truncate max-w-[180px]">"{existingReview.comment}"</span>
                                  )}
                                </div>
                              ) : reviewMode ? (
                                // In review mode - show star picker + comment
                                <div className="space-y-2 bg-neutral-100 dark:bg-neutral-800/60 rounded-xl p-3">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-semibold text-neutral-500">Đánh giá:</span>
                                    <StarRating
                                      value={reviewRatings[item.productId] || 5}
                                      onChange={(val) => setReviewRatings(prev => ({ ...prev, [item.productId]: val }))}
                                      size={18}
                                    />
                                  </div>
                                  <textarea
                                    placeholder="Viết nhận xét (tùy chọn)..."
                                    value={reviewComments[item.productId] || ''}
                                    onChange={(e) => setReviewComments(prev => ({ ...prev, [item.productId]: e.target.value }))}
                                    className="w-full text-sm bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg p-2.5 resize-none h-16 outline-none focus:border-black dark:focus:border-white transition-colors text-black dark:text-white placeholder:text-neutral-400"
                                  />
                                </div>
                              ) : (
                                // Not reviewed yet - show hint
                                <span className="text-xs text-neutral-400 italic">Chưa đánh giá</span>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="p-6 border-t border-neutral-100 dark:border-neutral-800 bg-white/50 dark:bg-neutral-900/50 flex flex-col gap-3 backdrop-blur-sm">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-neutral-500">Tạm tính:</span>
                    <span className="font-semibold text-black dark:text-white">{formatPrice(selectedOrder.subtotalAmount || 0)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-neutral-500">
                      Giảm giá {selectedOrder.promotionCode ? <span className="font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 px-1.5 py-0.5 rounded-md ml-1">{selectedOrder.promotionCode}</span> : ''}:
                    </span>
                    <span className="font-semibold text-emerald-600">-{formatPrice(selectedOrder.discountAmount || 0)}</span>
                  </div>
                  <div className="flex justify-between items-center mt-2 pt-3 border-t border-neutral-200 dark:border-neutral-700">
                    <span className="font-bold text-black dark:text-white">Tổng thanh toán:</span>
                    <span className="text-2xl font-black text-black dark:text-white tracking-tight">{formatPrice(selectedOrder.totalAmount)}</span>
                  </div>
                </div>
              </div>
            </div>
            </div>

            <div className="p-4 bg-white dark:bg-neutral-900 flex justify-between items-center flex-wrap gap-3 border-t border-neutral-100 dark:border-neutral-800 flex-shrink-0">
              <button 
                onClick={() => setSelectedOrder(null)}
                className="inline-flex h-12 items-center justify-center bg-neutral-100 text-black dark:bg-neutral-800 dark:text-white px-6 font-bold rounded-xl hover:opacity-85 transition-opacity text-sm gap-2"
              >
                <ArrowLeft size={16} /> Quay lại
              </button>
              
              <div className="flex items-center gap-3">
                {selectedOrder.status === 'pending' && (
                  <button
                    disabled={cancellingOrderId !== null}
                    onClick={() => void handleCancelOrder(selectedOrder.id)}
                    className="inline-flex h-12 items-center justify-center bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400 px-6 font-bold rounded-xl hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors text-sm gap-2 disabled:opacity-50"
                  >
                    {cancellingOrderId === selectedOrder.id ? 'Đang hủy...' : 'Hủy đơn hàng'}
                  </button>
                )}
                {selectedOrder.status === 'pending' && selectedOrder.paymentMethod === 'momo' && (
                  <button
                    disabled={retryingPaymentId !== null}
                    onClick={() => void handleOrderRetryPayment(selectedOrder)}
                    className="inline-flex h-12 items-center justify-center bg-[#A50064] text-white px-6 font-bold rounded-xl hover:opacity-95 transition-opacity text-sm gap-2 disabled:opacity-50"
                  >
                    {retryingPaymentId === selectedOrder.id ? 'Đang xử lý...' : 'Thanh toán lại qua MoMo'}
                  </button>
                )}
                {/* Review button - only for delivered orders */}
                {selectedOrder.status === 'delivered' && !loadingReviews && (
                  <>
                    {!isOrderReviewed && !reviewMode && (
                      <button
                        onClick={() => {
                          setReviewMode(true);
                          // Initialize all ratings to 5
                          const initialRatings: Record<number, number> = {};
                          selectedOrder.items?.forEach(item => {
                            initialRatings[item.productId] = 5;
                          });
                          setReviewRatings(initialRatings);
                        }}
                        className="inline-flex h-12 items-center justify-center bg-yellow-400 text-black px-6 font-bold rounded-xl hover:bg-yellow-500 transition-colors text-sm gap-2"
                      >
                        <Star size={16} /> Đánh giá
                      </button>
                    )}
                    {reviewMode && (
                      <>
                        <button
                          onClick={() => setReviewMode(false)}
                          className="inline-flex h-12 items-center justify-center bg-neutral-100 text-black dark:bg-neutral-800 dark:text-white px-6 font-bold rounded-xl hover:opacity-85 transition-opacity text-sm"
                        >
                          Hủy
                        </button>
                        <button
                          onClick={handleSubmitReviews}
                          disabled={submittingReview}
                          className="inline-flex h-12 items-center justify-center bg-yellow-400 text-black px-6 font-bold rounded-xl hover:bg-yellow-500 transition-colors text-sm gap-2 disabled:opacity-50"
                        >
                          <MessageSquare size={16} /> {submittingReview ? 'Đang gửi...' : 'Gửi đánh giá'}
                        </button>
                      </>
                    )}
                  </>
                )}

                <button 
                  onClick={async () => {
                    const toastId = toast.loading('Đang tải font và tạo hóa đơn...');
                    try {
                      await exportOrderInvoice(selectedOrder);
                      toast.success('Đã tải xuống hóa đơn PDF', { id: toastId });
                    } catch (e) {
                      console.error(e);
                      toast.error('Lỗi khi tải font chữ hoặc tạo hóa đơn', { id: toastId });
                    }
                  }}
                  className="inline-flex h-12 items-center justify-center bg-black text-white dark:bg-white dark:text-black px-6 font-bold rounded-xl hover:opacity-85 transition-opacity text-sm gap-2"
                >
                  <Printer size={16} /> In hóa đơn
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
