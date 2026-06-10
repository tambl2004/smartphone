import React, { useEffect, useState } from 'react';
import { Link } from '@routes/router';
import { motion } from 'motion/react';
import { getAuth } from '@services/auth.service';
import { orderService } from '@services/order.service';
import { formatPrice } from '@utils/format';
import { CheckCircle2, XCircle, Loader2, ArrowRight, ShoppingBag } from 'lucide-react';
import toast from 'react-hot-toast';

export const PaymentResultPage: React.FC = () => {
  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading');
  const [orderDetails, setOrderDetails] = useState<{ orderId: string; amount: number; message: string } | null>(null);
  const [retrying, setRetrying] = useState(false);

  const handleRetryPayment = async () => {
    const auth = getAuth();
    if (!auth?.token || !orderDetails?.orderId || !orderDetails?.amount) {
      toast.error('Vui lòng đăng nhập lại để thanh toán');
      return;
    }
    setRetrying(true);
    const toastId = toast.loading('Đang tạo liên kết thanh toán MoMo...');
    try {
      const payRes = await orderService.createMomoPayment(orderDetails.orderId, orderDetails.amount, auth.token);
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
      setRetrying(false);
    }
  };

  useEffect(() => {
    const verifyPayment = async () => {
      const auth = getAuth();
      if (!auth?.token) {
        setStatus('failed');
        return;
      }

      const searchParams = new URLSearchParams(window.location.search);
      const paramsObj: Record<string, string> = {};
      searchParams.forEach((value, key) => {
        paramsObj[key] = value;
      });

      if (!paramsObj.orderId || !paramsObj.signature) {
        setStatus('failed');
        return;
      }

      try {
        const res = await orderService.verifyMomoPayment(paramsObj, auth.token);
        if (res.success && res.data?.isSuccess) {
          setStatus('success');
          setOrderDetails({
            orderId: res.data.orderId,
            amount: Number(res.data.amount),
            message: res.data.message || 'Thanh toán thành công'
          });
        } else {
          setStatus('failed');
          setOrderDetails({
            orderId: paramsObj.orderId,
            amount: Number(paramsObj.amount || 0),
            message: paramsObj.message || 'Giao dịch không thành công'
          });
        }
      } catch (error) {
        console.error('Error verifying payment:', error);
        setStatus('failed');
        setOrderDetails({
          orderId: paramsObj.orderId || '',
          amount: Number(paramsObj.amount || 0),
          message: paramsObj.message || 'Lỗi kết nối cổng thanh toán'
        });
      }
    };

    void verifyPayment();
  }, []);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0a0a0a] pt-32 pb-24 flex items-center justify-center">
        <div className="flex flex-col items-center justify-center text-center space-y-4">
          <Loader2 className="w-12 h-12 text-[#A50064] animate-spin" strokeWidth={1.5} />
          <h3 className="text-xl font-bold text-black dark:text-white">Đang xác thực giao dịch...</h3>
          <p className="text-sm text-neutral-500 max-w-xs leading-relaxed">
            Vui lòng không đóng trình duyệt hoặc tải lại trang trong khi chúng tôi xử lý kết quả thanh toán từ MoMo.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] pt-32 pb-24 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center text-center px-6 max-w-lg mx-auto space-y-6"
      >
        {status === 'success' ? (
          <>
            <div className="w-24 h-24 rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-4 border border-emerald-100 dark:border-emerald-500/20">
              <CheckCircle2 size={48} strokeWidth={1.5} />
            </div>
            <div className="space-y-3">
              <span className="text-[11px] font-bold tracking-[0.2em] text-emerald-600 uppercase block">THANH TOÁN THÀNH CÔNG</span>
              <h3 className="text-3xl md:text-4xl font-black tracking-tight text-black dark:text-white">
                Cảm ơn bạn đã đặt hàng!
              </h3>
            </div>
            <div className="bg-neutral-50 dark:bg-neutral-900/50 p-6 rounded-2xl border border-neutral-100 dark:border-neutral-900 w-full text-left space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-neutral-500">Mã đơn hàng:</span>
                <strong className="text-black dark:text-white font-mono">{orderDetails?.orderId}</strong>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-neutral-500">Số tiền:</span>
                <strong className="text-black dark:text-white">{formatPrice(orderDetails?.amount || 0)}</strong>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-neutral-500">Cổng thanh toán:</span>
                <span className="text-[#A50064] font-bold">Ví MoMo</span>
              </div>
              <div className="flex justify-between text-sm border-t border-neutral-200 dark:border-neutral-800 pt-3">
                <span className="text-neutral-500">Trạng thái:</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                  Đã thanh toán <CheckCircle2 size={14} />
                </span>
              </div>
            </div>
            <p className="text-neutral-500 dark:text-neutral-400 text-sm max-w-sm leading-relaxed">
              Hệ thống đã ghi nhận thanh toán của bạn. Đơn hàng sẽ được chuyển sang bộ phận vận chuyển để sớm giao tới địa chỉ của bạn.
            </p>
          </>
        ) : (
          <>
            <div className="w-24 h-24 rounded-full bg-red-50 dark:bg-red-500/10 flex items-center justify-center text-red-500 mb-4 border border-red-100 dark:border-red-500/20">
              <XCircle size={48} strokeWidth={1.5} />
            </div>
            <div className="space-y-3">
              <span className="text-[11px] font-bold tracking-[0.2em] text-red-600 uppercase block">GIAO DỊCH THẤT BẠI</span>
              <h3 className="text-3xl md:text-4xl font-black tracking-tight text-black dark:text-white">
                Thanh toán không thành công
              </h3>
            </div>
            <div className="bg-neutral-50 dark:bg-neutral-900/50 p-6 rounded-2xl border border-neutral-100 dark:border-neutral-900 w-full text-left space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-neutral-500">Mã đơn hàng:</span>
                <strong className="text-black dark:text-white font-mono">{orderDetails?.orderId}</strong>
              </div>
              {orderDetails?.amount ? (
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-500">Số tiền:</span>
                  <strong className="text-black dark:text-white">{formatPrice(orderDetails.amount)}</strong>
                </div>
              ) : null}
              <div className="flex justify-between text-sm">
                <span className="text-neutral-500">Chi tiết:</span>
                <span className="text-red-500 font-semibold">{orderDetails?.message || 'Giao dịch bị hủy hoặc xảy ra lỗi'}</span>
              </div>
            </div>
            <p className="text-neutral-500 dark:text-neutral-400 text-sm max-w-sm leading-relaxed">
              Bạn có thể thử thanh toán lại hoặc chọn phương thức thanh toán khác trong trang đơn hàng của tôi.
            </p>
          </>
        )}

        <div className="flex flex-col sm:flex-row gap-3 mt-4 w-full justify-center">
          {status === 'failed' && orderDetails?.orderId && (
            <button
              onClick={handleRetryPayment}
              disabled={retrying}
              className="inline-flex h-14 items-center justify-center bg-[#A50064] text-white px-8 font-bold rounded-2xl hover:opacity-90 transition-opacity text-sm gap-2 tracking-wide disabled:opacity-50"
            >
              Thanh toán lại qua MoMo
            </button>
          )}
          <Link
            to="/orders"
            className="inline-flex h-14 items-center justify-center bg-black text-white dark:bg-white dark:text-black px-8 font-bold rounded-2xl hover:opacity-85 transition-opacity text-sm gap-2 tracking-wide"
          >
            Đơn hàng của tôi <ArrowRight size={16} />
          </Link>
          <Link
            to="/products"
            className="inline-flex h-14 items-center justify-center bg-neutral-100 text-black dark:bg-neutral-900 dark:text-white px-8 font-bold rounded-2xl hover:opacity-85 transition-opacity text-sm gap-2 tracking-wide"
          >
            <ShoppingBag size={16} /> Tiếp tục mua sắm
          </Link>
        </div>
      </motion.div>
    </div>
  );
};
