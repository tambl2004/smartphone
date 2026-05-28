import React, { useState, useEffect } from 'react';
import { useCart } from '@hooks/useCart';
import { formatPrice } from '@utils/format';
import { Link } from '@routes/router';
import { CartItem } from '@types';
import { CheckCircle2, Banknote, CreditCard, ArrowRight, Sparkles, MapPin, Ticket, Search } from 'lucide-react';
import { motion } from 'motion/react';
import toast from 'react-hot-toast';
import { getMyAddresses, Address } from '@services/address.service';
import { promotionService, Promotion } from '@services/promotion.service';
import { getAuth } from '@services/auth.service';
import { orderService, OrderPayload } from '@services/order.service';

const API_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api').replace('/api', '');

const getProductImage = (item: CartItem): string => {
  if (!item.product.images || item.product.images.length === 0) return 'https://placehold.co/100x100?text=No+Image';
  const primary = item.product.images.find((img) => img.isPrimary) ?? item.product.images[0];
  if (primary.imageUrl.startsWith('http')) return primary.imageUrl;
  return `${API_URL}${primary.imageUrl}`;
};

const generateOrderCode = () => 'DH' + Math.floor(100000 + Math.random() * 900000);

export const CheckoutPage: React.FC = () => {
  const { items, cartTotal, clearCart } = useCart();
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'momo'>('cod');
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);

  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<Promotion | null>(null);
  
  const [isOrdered, setIsOrdered] = useState(false);
  const [orderCode, setOrderCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [applyingPromo, setApplyingPromo] = useState(false);

  useEffect(() => {
    const fetchAddresses = async () => {
      const res = await getMyAddresses();
      if (res.ok && res.data) {
        const defaultAddr = res.data.find(a => a.isDefault) || res.data[0];
        if (defaultAddr) setSelectedAddress(defaultAddr);
      }
      setLoading(false);
    };
    void fetchAddresses();
  }, []);

  const handleApplyPromo = async () => {
    if (!promoCodeInput.trim()) {
      toast.error('Vui lòng nhập mã giảm giá');
      return;
    }
    const auth = getAuth();
    if (!auth?.token) {
      toast.error('Vui lòng đăng nhập để sử dụng mã');
      return;
    }
    
    setApplyingPromo(true);
    try {
      const res = await promotionService.validatePromotion(promoCodeInput.trim().toUpperCase(), cartTotal, auth.token);
      if (res.success && res.data?.promo) {
        setAppliedPromo(res.data.promo);
        toast.success('Áp dụng mã giảm giá thành công!');
        setPromoCodeInput('');
      } else {
        toast.error(res.message || 'Mã giảm giá không hợp lệ');
        setAppliedPromo(null);
      }
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Có lỗi xảy ra khi kiểm tra mã';
      toast.error(msg);
      setAppliedPromo(null);
    } finally {
      setApplyingPromo(false);
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    toast.success('Đã gỡ mã giảm giá');
  };

  let discountAmount = 0;
  if (appliedPromo) {
    if (appliedPromo.discountType === 'percent') {
      discountAmount = cartTotal * (appliedPromo.discountValue / 100);
      if (appliedPromo.maxDiscountAmount) {
        discountAmount = Math.min(discountAmount, appliedPromo.maxDiscountAmount);
      }
    } else {
      discountAmount = appliedPromo.discountValue;
    }
  }

  const finalTotal = Math.max(0, cartTotal - discountAmount);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAddress) {
      toast.error('Vui lòng chọn địa chỉ giao hàng');
      return;
    }
    if (items.length === 0) {
      toast.error('Giỏ hàng trống');
      return;
    }
    
    const auth = getAuth();
    if (!auth?.token) {
      toast.error('Vui lòng đăng nhập để thanh toán');
      return;
    }

    const code = generateOrderCode();
    
    const payload: OrderPayload = {
      orderCode: code,
      customerName: selectedAddress.fullName,
      customerEmail: auth.user.email,
      customerPhone: selectedAddress.phone,
      shippingAddress: `${selectedAddress.streetAddress}, ${selectedAddress.wardName}, ${selectedAddress.districtName}, ${selectedAddress.provinceName}`,
      subtotalAmount: cartTotal,
      discountAmount: discountAmount,
      totalAmount: finalTotal,
      paymentMethod: paymentMethod,
      promotionId: appliedPromo ? appliedPromo.id : undefined,
      promotionCode: appliedPromo ? appliedPromo.code : undefined,
      cartItems: items.map(i => ({
        productId: i.product.id,
        productName: i.product.name,
        productImage: getProductImage(i).replace(API_URL, ''),
        quantity: i.quantity,
        unitPrice: i.product.price,
        lineTotal: i.product.price * i.quantity
      }))
    };

    try {
      const res = await orderService.placeOrder(payload, auth.token);
      if (res.success) {
        setOrderCode(code);
        setIsOrdered(true);
        clearCart();
        toast.success('Đặt hàng thành công!');
      } else {
        toast.error(res.message || 'Có lỗi xảy ra khi đặt hàng');
      }
    } catch {
      toast.error('Lỗi kết nối khi đặt hàng');
    }
  };

  if (isOrdered) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0a0a0a] pt-32 pb-24 flex items-center justify-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center text-center px-6 max-w-lg mx-auto space-y-6">
          <div className="w-24 h-24 rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-4 border border-emerald-100 dark:border-emerald-500/20">
            <CheckCircle2 size={48} strokeWidth={1.5} />
          </div>
          <div className="space-y-3">
            <h3 className="text-3xl md:text-4xl font-black tracking-tight text-black dark:text-white">Đặt hàng thành công!</h3>
            <p className="text-lg text-neutral-600 dark:text-neutral-400">
              Mã đơn hàng: <strong className="text-black dark:text-white font-black">{orderCode}</strong>
            </p>
          </div>
          <p className="text-neutral-500 dark:text-neutral-400 text-sm max-w-sm leading-relaxed">
            Chúng tôi sẽ liên hệ với bạn qua số điện thoại để xác nhận đơn giao hàng trong vòng 15 phút.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 mt-4">
            <Link
              to="/orders"
              className="inline-flex h-14 items-center justify-center bg-black text-white dark:bg-white dark:text-black px-10 font-bold rounded-2xl hover:opacity-85 transition-opacity text-sm gap-2 tracking-wide"
            >
              Xem đơn hàng của tôi <ArrowRight size={16} />
            </Link>
            <Link
              to="/"
              className="inline-flex h-14 items-center justify-center bg-neutral-100 text-black dark:bg-neutral-900 dark:text-white px-10 font-bold rounded-2xl hover:opacity-85 transition-opacity text-sm tracking-wide"
            >
              Trang chủ
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0a0a0a] pt-32 pb-24 flex items-center justify-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center text-center px-6 max-w-md mx-auto">
          <div className="w-24 h-24 rounded-full bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center text-neutral-400 mb-8">
            <Banknote size={48} strokeWidth={1} />
          </div>
          <h3 className="text-2xl font-black tracking-tight text-black dark:text-white mb-3">Chưa có sản phẩm nào</h3>
          <p className="text-neutral-500 text-base font-medium mb-10 leading-relaxed">
            Vui lòng thêm sản phẩm vào giỏ hàng trước khi thực hiện thanh toán.
          </p>
          <Link
            to="/products"
            className="inline-flex h-14 items-center justify-center bg-black text-white dark:bg-white dark:text-black px-10 font-bold rounded-2xl hover:opacity-85 transition-opacity text-sm tracking-wide"
          >
            Quay lại cửa hàng
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] pt-32 pb-32">
      <div className="max-w-[1200px] w-full mx-auto px-6">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <span className="text-[11px] font-bold tracking-[0.2em] text-neutral-400 uppercase block mb-3">NEXPHONE / THANH TOÁN</span>
          <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-black dark:text-white leading-[1]">
            Xác nhận<br /><span className="text-neutral-300 dark:text-neutral-700">đơn hàng</span>
          </h1>
        </motion.div>

        <form onSubmit={handleFormSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">

          {/* Left Column */}
          <div className="lg:col-span-7 space-y-8">

            {/* Address Block */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-black text-black dark:text-white flex items-center gap-2">
                  <MapPin size={20} /> Địa chỉ nhận hàng
                </h3>
                <Link to="/profile?tab=address" className="text-sm font-bold text-neutral-500 hover:text-black dark:hover:text-white transition-colors">
                  Thay đổi
                </Link>
              </div>
              <div className="bg-neutral-50 dark:bg-neutral-900/50 p-6 rounded-2xl border border-neutral-100 dark:border-neutral-900">
                {loading ? (
                  <div className="animate-pulse flex flex-col gap-2">
                    <div className="h-5 bg-neutral-200 dark:bg-neutral-800 rounded w-1/3"></div>
                    <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-2/3 mt-2"></div>
                  </div>
                ) : selectedAddress ? (
                  <div className="flex flex-col gap-2">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="font-bold text-black dark:text-white text-base">{selectedAddress.fullName}</span>
                      <span className="w-1 h-1 rounded-full bg-neutral-300 dark:bg-neutral-700 hidden sm:block"></span>
                      <span className="font-bold text-neutral-600 dark:text-neutral-400">{selectedAddress.phone}</span>
                      {selectedAddress.isDefault && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 uppercase tracking-wider">Mặc định</span>
                      )}
                    </div>
                    <p className="text-sm text-neutral-500 leading-relaxed mt-1">
                      {selectedAddress.streetAddress}, {selectedAddress.wardName}, {selectedAddress.districtName}, {selectedAddress.provinceName}
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-neutral-500 mb-3">Bạn chưa có địa chỉ nhận hàng nào</p>
                    <Link to="/profile?tab=address" className="inline-block px-4 py-2 bg-black text-white dark:bg-white dark:text-black rounded-lg text-sm font-medium">
                      Thêm địa chỉ ngay
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Vouchers */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <h3 className="text-lg font-black text-black dark:text-white flex items-center gap-2 mb-4">
                <Ticket size={20} /> Khuyến mãi & Mã giảm giá
              </h3>
              
              <div className="bg-neutral-50 dark:bg-neutral-900/50 p-6 rounded-2xl border border-neutral-100 dark:border-neutral-900">
                {!appliedPromo ? (
                  <div className="flex gap-3">
                    <div className="relative flex-1">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search size={18} className="text-neutral-400" />
                      </div>
                      <input
                        type="text"
                        value={promoCodeInput}
                        onChange={(e) => setPromoCodeInput(e.target.value.toUpperCase())}
                        placeholder="Nhập mã giảm giá..."
                        className="w-full h-12 pl-10 pr-4 bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded-xl text-sm outline-none focus:border-black dark:focus:border-white transition-colors uppercase"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleApplyPromo}
                      disabled={applyingPromo || !promoCodeInput.trim()}
                      className="h-12 px-6 bg-black text-white dark:bg-white dark:text-black font-bold rounded-xl text-sm disabled:opacity-50 transition-opacity whitespace-nowrap"
                    >
                      {applyingPromo ? 'Đang xử lý...' : 'Áp dụng'}
                    </button>
                  </div>
                ) : (
                  <div className="relative p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-500/10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                        <Ticket size={18} />
                      </div>
                      <div>
                        <div className="font-bold text-sm text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                          {appliedPromo.code}
                          <CheckCircle2 size={14} />
                        </div>
                        <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-0.5">
                          Đã giảm {formatPrice(discountAmount)} cho đơn hàng này
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemovePromo}
                      className="text-xs font-bold text-neutral-500 hover:text-red-500 transition-colors"
                    >
                      Xóa mã
                    </button>
                  </div>
                )}
                <p className="text-xs text-neutral-500 mt-4 italic">
                  * Chỉ áp dụng 1 mã khuyến mãi trên mỗi đơn hàng.
                </p>
              </div>
            </motion.div>

            {/* Payment Method */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <h3 className="text-lg font-black text-black dark:text-white flex items-center gap-2 mb-4">
                <CreditCard size={20} /> Phương thức thanh toán
              </h3>
              <div className="space-y-3">
                <label onClick={() => setPaymentMethod('cod')} className={`flex items-center p-5 rounded-2xl border cursor-pointer transition-all duration-300 ${paymentMethod === 'cod' ? 'border-black dark:border-white bg-neutral-50 dark:bg-neutral-900/50' : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#0a0a0a] hover:border-neutral-400 dark:hover:border-neutral-600'}`}>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-4 ${paymentMethod === 'cod' ? 'border-black dark:border-white' : 'border-neutral-300 dark:border-neutral-700'}`}>
                    {paymentMethod === 'cod' && <div className="w-2.5 h-2.5 rounded-full bg-black dark:bg-white" />}
                  </div>
                  <div className="w-10 h-10 rounded-full bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center mr-4">
                    <Banknote size={18} className="text-black dark:text-white" />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-black dark:text-white">Thanh toán khi nhận hàng (COD)</div>
                    <div className="text-xs text-neutral-500 mt-0.5">Thanh toán bằng tiền mặt khi giao hàng</div>
                  </div>
                </label>

                <label onClick={() => setPaymentMethod('momo')} className={`flex items-center p-5 rounded-2xl border cursor-pointer transition-all duration-300 ${paymentMethod === 'momo' ? 'border-[#A50064] bg-[#A50064]/5 dark:border-[#A50064] dark:bg-[#A50064]/10' : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#0a0a0a] hover:border-[#A50064]/50'}`}>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-4 ${paymentMethod === 'momo' ? 'border-[#A50064]' : 'border-neutral-300 dark:border-neutral-700'}`}>
                    {paymentMethod === 'momo' && <div className="w-2.5 h-2.5 rounded-full bg-[#A50064]" />}
                  </div>
                  <div className="w-10 h-10 rounded-full bg-[#A50064]/10 flex items-center justify-center mr-4">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM15.5 15.5H14C12.9 15.5 12 14.6 12 13.5V10.5C12 9.4 12.9 8.5 14 8.5H15.5C16.6 8.5 17.5 9.4 17.5 10.5V13.5C17.5 14.6 16.6 15.5 15.5 15.5ZM10 15.5H8.5C7.4 15.5 6.5 14.6 6.5 13.5V10.5C6.5 9.4 7.4 8.5 8.5 8.5H10C11.1 8.5 12 9.4 12 10.5V13.5C12 14.6 11.1 15.5 10 15.5ZM15.5 10H14V14H15.5V10ZM10 10H8.5V14H10V10Z" fill="#A50064" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-bold text-sm text-[#A50064]">Ví MoMo</div>
                    <div className="text-xs text-neutral-500 mt-0.5">Thanh toán nhanh chóng qua ứng dụng MoMo</div>
                  </div>
                </label>
              </div>
            </motion.div>

          </div>

          {/* Right Column: Order Summary */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="lg:col-span-5">
            <div className="sticky top-28 bg-neutral-50 dark:bg-neutral-900/50 rounded-2xl p-6 md:p-8 border border-neutral-100 dark:border-neutral-900">
              <h3 className="text-lg font-black tracking-tight text-black dark:text-white border-b border-neutral-200 dark:border-neutral-800 pb-4 mb-6">
                Tóm tắt đơn hàng
              </h3>

              <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar mb-6">
                {items.map((item: CartItem) => (
                  <div key={item.product.id} className="flex gap-4 items-center">
                    <div className="w-16 h-16 rounded-xl bg-white dark:bg-black border border-neutral-100 dark:border-neutral-800 flex items-center justify-center p-2 shrink-0">
                      <img src={getProductImage(item)} alt={item.product.name} className="w-full h-full object-contain" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-sm text-black dark:text-white truncate">{item.product.name}</h4>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">SL: {item.quantity}</p>
                    </div>
                    <div className="font-bold text-sm text-black dark:text-white whitespace-nowrap">
                      {formatPrice(item.product.price * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3 pt-6 border-t border-neutral-200 dark:border-neutral-800">
                <div className="flex justify-between text-sm font-bold">
                  <span className="text-neutral-500">Tạm tính:</span>
                  <span className="text-black dark:text-white">{formatPrice(cartTotal)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold">
                  <span className="text-neutral-500">Phí vận chuyển:</span>
                  <span className="text-emerald-600 dark:text-emerald-400">Miễn phí</span>
                </div>
                {appliedPromo && (
                  <div className="flex justify-between text-sm font-bold text-red-500">
                    <span>Khuyến mãi ({appliedPromo.code}):</span>
                    <span>-{formatPrice(discountAmount)}</span>
                  </div>
                )}
              </div>

              <div className="border-t border-neutral-200 dark:border-neutral-800 pt-5 mt-5">
                <div className="flex justify-between items-end mb-1.5">
                  <span className="text-sm font-bold text-black dark:text-white">Tổng thanh toán:</span>
                  <span className="text-3xl font-black tracking-tight text-black dark:text-white">{formatPrice(finalTotal)}</span>
                </div>
                <p className="text-xs font-medium text-neutral-400 text-right mb-6">(Đã bao gồm VAT)</p>
              </div>

              <button
                type="submit"
                disabled={!selectedAddress}
                className="w-full inline-flex h-14 items-center justify-center gap-2 bg-black text-white dark:bg-white dark:text-black font-bold rounded-xl hover:opacity-85 transition-opacity text-sm tracking-wide shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Sparkles size={18} /> Đặt hàng ngay
              </button>
            </div>
          </motion.div>
        </form>
      </div>
    </div>
  );
};
