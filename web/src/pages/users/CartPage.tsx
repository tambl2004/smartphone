import React from 'react';
import { useCart } from '@hooks/useCart';
import { formatPrice } from '@utils/format';
import { Link } from '@routes/router';
import { CartItem } from '@types';
import { ShoppingCart, Trash2, ArrowLeft, Plus, Minus, CreditCard } from 'lucide-react';

export const CartPage: React.FC = () => {
  const {
    items,
    cartTotal,
    removeFromCart,
    updateQuantity,
    clearCart
  } = useCart();

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-24 px-6 max-w-md mx-auto">
        <div className="w-16 h-16 rounded-full bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center mb-6">
          <ShoppingCart size={32} className="text-neutral-400 dark:text-neutral-600" />
        </div>
        <h3 className="text-2xl font-bold tracking-tight text-black dark:text-white mb-2">
          Giỏ hàng của bạn trống
        </h3>
        <p className="text-neutral-500 dark:text-neutral-400 mb-8 text-sm">
          Hãy cùng tìm kiếm và khám phá thêm nhiều mẫu điện thoại mới nhé!
        </p>
        <Link 
          to="/products" 
          className="inline-flex h-11 items-center justify-center bg-black text-white dark:bg-white dark:text-black px-6 font-semibold rounded-md hover:opacity-85 transition-opacity text-sm shadow-sm"
        >
          Quay lại cửa hàng
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] w-full mx-auto px-6 py-12">
      <div className="flex items-center gap-3 mb-10">
        <ShoppingCart size={24} className="text-black dark:text-white" />
        <h2 className="text-3xl font-bold tracking-tight text-black dark:text-white">
          Giỏ hàng của bạn ({items.length} sản phẩm)
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Items List */}
        <div className="lg:col-span-8 space-y-6">
          <div className="divide-y divide-neutral-100 dark:divide-neutral-900 border-t border-b border-neutral-100 dark:divide-neutral-900">
            {items.map((item: CartItem) => (
              <div key={item.product.id} className="py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-1">
                  <Link to={`/product/${item.product.id}`} className="w-20 h-20 rounded bg-neutral-50 dark:bg-neutral-900 flex-shrink-0 overflow-hidden border border-neutral-200 dark:border-neutral-800 flex items-center justify-center">
                    <img src={item.product.image} alt={item.product.name} className="w-16 h-16 object-contain" />
                  </Link>
                  
                  <div className="space-y-1">
                    <h4 className="font-bold text-base text-black dark:text-white hover:opacity-75 transition-opacity">
                      <Link to={`/product/${item.product.id}`}>{item.product.name}</Link>
                    </h4>
                    <span className="text-xs text-neutral-400 dark:text-neutral-500 uppercase tracking-widest block">{item.product.brand}</span>
                    <span className="text-sm font-semibold text-neutral-600 dark:text-neutral-400">Đơn giá: {formatPrice(item.product.price)}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between w-full sm:w-auto gap-8">
                  {/* Quantity selector */}
                  <div className="flex items-center border border-neutral-200 dark:border-neutral-800 rounded bg-white dark:bg-black h-9">
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                      className="w-8 h-full flex items-center justify-center hover:bg-neutral-50 dark:hover:bg-neutral-900 text-neutral-500 transition-colors"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-10 text-center text-sm font-bold text-black dark:text-white">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      className="w-8 h-full flex items-center justify-center hover:bg-neutral-50 dark:hover:bg-neutral-900 text-neutral-500 transition-colors"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  <span className="font-bold text-black dark:text-white min-w-[100px] text-right">
                    {formatPrice(item.product.price * item.quantity)}
                  </span>

                  <button
                    onClick={() => removeFromCart(item.product.id)}
                    className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-900 rounded-full text-neutral-400 hover:text-black dark:hover:text-white transition-colors"
                    title="Xóa sản phẩm"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4">
            <button 
              onClick={clearCart} 
              className="inline-flex h-10 items-center justify-center border border-neutral-200 dark:border-neutral-800 hover:border-black dark:hover:border-white text-black dark:text-white px-5 font-semibold rounded-md transition-colors text-sm gap-2"
            >
              <Trash2 size={15} /> Xóa toàn bộ giỏ hàng
            </button>
            <Link 
              to="/products" 
              className="inline-flex h-10 items-center justify-center bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-900 dark:hover:bg-neutral-800 text-black dark:text-white px-5 font-semibold rounded-md transition-colors text-sm gap-2"
            >
              <ArrowLeft size={15} /> Tiếp tục mua sắm
            </Link>
          </div>
        </div>

        {/* Right Side: Totals Card */}
        <div className="lg:col-span-4 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-900 rounded-lg p-6 space-y-6">
          <h3 className="text-lg font-bold text-black dark:text-white border-b border-neutral-200 dark:border-neutral-900 pb-4">
            Hóa đơn tạm tính
          </h3>
          
          <div className="space-y-3">
            <div className="flex justify-between text-sm text-neutral-500 dark:text-neutral-400">
              <span>Tạm tính:</span>
              <span className="font-semibold text-black dark:text-white">{formatPrice(cartTotal)}</span>
            </div>
            <div className="flex justify-between text-sm text-neutral-500 dark:text-neutral-400">
              <span>Phí vận chuyển:</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">Miễn phí</span>
            </div>
          </div>

          <div className="border-t border-neutral-200 dark:border-neutral-900 pt-4 flex justify-between items-end">
            <span className="text-sm font-semibold text-black dark:text-white">Tổng cộng:</span>
            <span className="text-2xl font-bold text-black dark:text-white">{formatPrice(cartTotal)}</span>
          </div>
          
          <Link 
            to="/checkout" 
            className="flex h-12 w-full items-center justify-center bg-black text-white dark:bg-white dark:text-black font-semibold rounded-md hover:opacity-85 transition-opacity text-sm gap-2 shadow-sm"
          >
            <CreditCard size={16} /> Tiến hành thanh toán
          </Link>
        </div>
      </div>
    </div>
  );
};
