import React, { useState } from 'react';
import { useCart } from '@hooks/useCart';
import { Button } from '@components/common/Button';
import { Input } from '@components/common/Input';
import { formatPrice } from '@utils/format';
import { Link } from '@routes/router';
import { CartItem } from '@types';
import { CheckCircle2, Package, Banknote, Landmark, ArrowRight, ClipboardList, Sparkles } from 'lucide-react';

export const CheckoutPage: React.FC = () => {
  const { items, cartTotal, clearCart } = useCart();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    paymentMethod: 'cod'
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isOrdered, setIsOrdered] = useState(false);
  const [orderCode, setOrderCode] = useState('');

  if (isOrdered) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-24 px-6 max-w-lg mx-auto space-y-6">
        <div className="w-20 h-20 rounded-full bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center text-emerald-500">
          <CheckCircle2 size={44} />
        </div>
        <div className="space-y-2">
          <h3 className="text-3xl font-bold tracking-tight text-black dark:text-white">Đặt hàng thành công!</h3>
          <p className="text-base text-neutral-600 dark:text-neutral-400">
            Mã đơn hàng của bạn là: <strong className="text-black dark:text-white font-extrabold">{orderCode}</strong>
          </p>
        </div>
        <p className="text-neutral-500 dark:text-neutral-400 text-sm max-w-sm">
          Chúng tôi sẽ liên hệ với bạn qua số điện thoại để xác nhận đơn giao hàng trong vòng 15 phút.
        </p>
        <Link 
          to="/" 
          className="inline-flex h-11 items-center justify-center bg-black text-white dark:bg-white dark:text-black px-8 font-semibold rounded-md hover:opacity-85 transition-opacity text-sm gap-2 shadow-sm"
        >
          Quay lại trang chủ <ArrowRight size={16} />
        </Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-24 px-6 max-w-md mx-auto">
        <div className="w-16 h-16 rounded-full bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center mb-6">
          <Package size={32} className="text-neutral-400 dark:text-neutral-600" />
        </div>
        <h3 className="text-2xl font-bold tracking-tight text-black dark:text-white mb-2">
          Không có sản phẩm để thanh toán
        </h3>
        <p className="text-neutral-500 dark:text-neutral-400 mb-8 text-sm">
          Vui lòng thêm sản phẩm vào giỏ hàng trước khi thực hiện thanh toán.
        </p>
        <Link 
          to="/products" 
          className="inline-flex h-11 items-center justify-center bg-black text-white dark:bg-white dark:text-black px-6 font-semibold rounded-md hover:opacity-85 transition-opacity text-sm shadow-sm"
        >
          Xem sản phẩm
        </Link>
      </div>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Vui lòng nhập họ tên';
    if (!formData.phone.trim()) newErrors.phone = 'Vui lòng nhập số điện thoại';
    if (!formData.email.trim()) newErrors.email = 'Vui lòng nhập email';
    if (!formData.address.trim()) newErrors.address = 'Vui lòng nhập địa chỉ giao hàng';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const code = 'DH' + Math.floor(100000 + Math.random() * 900000);
    setOrderCode(code);
    setIsOrdered(true);
    clearCart();
  };

  return (
    <div className="max-w-[1400px] w-full mx-auto px-6 py-12">
      <div className="flex items-center gap-3 mb-10">
        <ClipboardList size={24} className="text-black dark:text-white" />
        <h2 className="text-3xl font-bold tracking-tight text-black dark:text-white">Thông tin thanh toán</h2>
      </div>

      <form onSubmit={handleFormSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Customer Info Form */}
        <div className="lg:col-span-8 bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded-lg p-6 space-y-6">
          <h3 className="text-lg font-bold text-black dark:text-white border-b border-neutral-100 dark:border-neutral-900 pb-4">
            Thông tin người nhận
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Họ và tên"
              name="name"
              placeholder="Nguyễn Văn A"
              value={formData.name}
              onChange={handleInputChange}
              error={errors.name}
            />

            <Input
              label="Số điện thoại"
              name="phone"
              placeholder="0987654321"
              value={formData.phone}
              onChange={handleInputChange}
              error={errors.phone}
            />
          </div>

          <Input
            label="Email"
            name="email"
            type="text"
            placeholder="nguyenvana@gmail.com"
            value={formData.email}
            onChange={handleInputChange}
            error={errors.email}
          />

          <Input
            label="Địa chỉ giao hàng"
            name="address"
            placeholder="Số nhà, Tên đường, Quận/Huyện, Tỉnh/Thành phố"
            value={formData.address}
            onChange={handleInputChange}
            error={errors.address}
          />

          <div className="space-y-3 pt-4">
            <h4 className="text-sm font-bold text-black dark:text-white">Phương thức thanh toán</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <label className={`flex items-center gap-3 p-4 border rounded-md cursor-pointer transition-colors ${formData.paymentMethod === 'cod' ? 'border-black dark:border-white bg-neutral-50 dark:bg-neutral-900' : 'border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900'}`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cod"
                  checked={formData.paymentMethod === 'cod'}
                  onChange={() => setFormData((prev) => ({ ...prev, paymentMethod: 'cod' }))}
                  className="accent-black dark:accent-white"
                />
                <div className="flex items-center gap-2 text-sm font-medium text-black dark:text-white">
                  <Banknote size={18} />
                  <span>Thanh toán khi nhận hàng (COD)</span>
                </div>
              </label>

              <label className={`flex items-center gap-3 p-4 border rounded-md cursor-pointer transition-colors ${formData.paymentMethod === 'bank' ? 'border-black dark:border-white bg-neutral-50 dark:bg-neutral-900' : 'border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900'}`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="bank"
                  checked={formData.paymentMethod === 'bank'}
                  onChange={() => setFormData((prev) => ({ ...prev, paymentMethod: 'bank' }))}
                  className="accent-black dark:accent-white"
                />
                <div className="flex items-center gap-2 text-sm font-medium text-black dark:text-white">
                  <Landmark size={18} />
                  <span>Chuyển khoản ngân hàng</span>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right: Checkout Items Breakdown */}
        <div className="lg:col-span-4 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-900 rounded-lg p-6 space-y-6">
          <h3 className="text-lg font-bold text-black dark:text-white border-b border-neutral-200 dark:border-neutral-900 pb-4">
            Tóm tắt đơn hàng
          </h3>

          <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
            {items.map((item: CartItem) => (
              <div key={item.product.id} className="flex gap-4 items-center justify-between text-sm">
                <div className="flex gap-3 items-center flex-1">
                  <div className="w-12 h-12 rounded bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 flex items-center justify-center p-1">
                    <img src={item.product.image} alt={item.product.name} className="w-10 h-10 object-contain" />
                  </div>
                  <div className="space-y-0.5">
                    <span className="font-bold text-black dark:text-white block line-clamp-1">{item.product.name}</span>
                    <span className="text-xs text-neutral-400 dark:text-neutral-500">
                      {item.quantity} x {formatPrice(item.product.price)}
                    </span>
                  </div>
                </div>
                <div className="font-semibold text-black dark:text-white">
                  {formatPrice(item.product.price * item.quantity)}
                </div>
              </div>
            ))}
          </div>

          <hr className="border-neutral-200 dark:border-neutral-900" />

          <div className="space-y-2.5">
            <div className="flex justify-between text-sm text-neutral-500 dark:text-neutral-400">
              <span>Tạm tính:</span>
              <span className="font-semibold text-black dark:text-white">{formatPrice(cartTotal)}</span>
            </div>
            <div className="flex justify-between text-sm text-neutral-500 dark:text-neutral-400">
              <span>Phí vận chuyển:</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">Miễn phí</span>
            </div>
          </div>

          <hr className="border-neutral-200 dark:border-neutral-900" />

          <div className="flex justify-between items-end">
            <span className="text-sm font-semibold text-black dark:text-white">Tổng tiền:</span>
            <span className="text-xl font-bold text-black dark:text-white">{formatPrice(cartTotal)}</span>
          </div>

          <Button type="submit" variant="primary" fullWidth size="lg" className="w-full flex items-center justify-center gap-2">
            <Sparkles size={16} /> Xác nhận đặt hàng
          </Button>
        </div>
      </form>
    </div>
  );
};
