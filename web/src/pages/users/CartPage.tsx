import React, { useState, useEffect } from 'react';
import { useCart } from '@hooks/useCart';
import { formatPrice } from '@utils/format';
import { Link, useRouter } from '@routes/router';
import { CartItem } from '@types';
import { ShoppingCart, Trash2, ArrowLeft, Plus, Minus, CreditCard, Check } from 'lucide-react';
import { motion } from 'motion/react';

export const CartPage: React.FC = () => {
  const { items, removeFromCart, updateQuantity, clearCart } = useCart();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const { navigate } = useRouter();

  // Khởi tạo: mặc định chọn tất cả sản phẩm
  useEffect(() => {
    if (items.length === 0) {
      setSelectedIds([]);
      return;
    }
    setSelectedIds(prev => {
      if (prev.length === 0) {
        return items.map(item => item.product.id);
      }
      return prev.filter(id => items.some(item => item.product.id === id));
    });
  }, [items]);

  const selectedItems = items.filter(item => selectedIds.includes(item.product.id));
  const selectedTotal = selectedItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const isAllSelected = items.length > 0 && selectedIds.length === items.length;

  const toggleSelectAll = () => {
    if (isAllSelected) setSelectedIds([]);
    else setSelectedIds(items.map(item => item.product.id));
  };

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleCheckout = () => {
    if (selectedIds.length === 0) {
      alert("Vui lòng chọn ít nhất 1 sản phẩm để thanh toán.");
      return;
    }
    // Ở đây nếu có logic truyền mảng sản phẩm đã chọn sang trang checkout, thì ta xử lý.
    // Tạm thời gọi navigate tới trang checkout.
    navigate('/checkout');
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0a0a0a] pt-32 pb-24 flex items-center justify-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center max-w-lg px-6">
          <div className="w-24 h-24 rounded-full bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center mx-auto mb-8 border border-neutral-100 dark:border-neutral-800">
            <ShoppingCart size={36} className="text-neutral-300 dark:text-neutral-700" strokeWidth={1.5} />
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-black dark:text-white mb-6">
            Giỏ hàng trống
          </h1>
          <p className="text-neutral-500 text-lg font-medium mb-10 leading-relaxed">
            Hãy cùng tìm kiếm và khám phá thêm nhiều mẫu điện thoại mới nhé!
          </p>
          <Link
            to="/products"
            className="inline-flex h-14 items-center justify-center bg-black text-white dark:bg-white dark:text-black px-10 font-bold rounded-2xl hover:opacity-85 transition-opacity text-sm tracking-wide"
          >
            Khám phá sản phẩm
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] pt-32 pb-32">
      <div className="max-w-[1400px] w-full mx-auto px-6">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6"
        >
          <div>
            <span className="text-[11px] font-bold tracking-[0.2em] text-neutral-400 uppercase block mb-3">NEXPHONE / GIỎ HÀNG</span>

          </div>
          <div className="md:text-right">
            <p className="text-xs font-bold text-neutral-500 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-900 inline-flex items-center justify-center px-4 py-2 rounded-full uppercase tracking-widest">
              {items.length} sản phẩm
            </p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Side: Items List */}
          <div className="lg:col-span-8 space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-900/50 rounded-xl"
            >
              <div className="flex items-center gap-3">
                <button
                  onClick={toggleSelectAll}
                  className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${isAllSelected ? 'bg-black border-black dark:bg-white dark:border-white' : 'border-neutral-300 dark:border-neutral-700'
                    }`}
                >
                  {isAllSelected && <Check size={12} className="text-white dark:text-black" strokeWidth={3} />}
                </button>
                <span className="text-sm font-bold text-black dark:text-white cursor-pointer select-none" onClick={toggleSelectAll}>Chọn tất cả ({items.length})</span>
              </div>
              <button
                onClick={clearCart}
                className="text-xs font-bold text-red-500 hover:text-red-600 flex items-center gap-2 transition-colors"
              >
                <Trash2 size={14} /> Xóa tất cả
              </button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col gap-4"
            >
              {items.map((item: CartItem, index) => {
                const isSelected = selectedIds.includes(item.product.id);
                return (
                  <motion.div
                    key={item.product.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className={`flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-2xl border transition-colors duration-300 ${isSelected ? 'border-black dark:border-white bg-white dark:bg-[#0a0a0a]' : 'border-neutral-100 dark:border-neutral-900 bg-neutral-50 dark:bg-neutral-900/50'
                      }`}
                  >
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                      <button
                        onClick={() => toggleSelect(item.product.id)}
                        className={`w-5 h-5 flex-shrink-0 rounded flex items-center justify-center border transition-colors ${isSelected ? 'bg-black border-black dark:bg-white dark:border-white' : 'border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#0a0a0a]'
                          }`}
                      >
                        {isSelected && <Check size={12} className="text-white dark:text-black" strokeWidth={3} />}
                      </button>

                      <Link to={`/product/${item.product.id}`} className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-white dark:bg-black flex-shrink-0 overflow-hidden flex items-center justify-center p-2 relative group">
                        <img src={item.product.image} alt={item.product.name} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500" />
                      </Link>

                      {/* Mobile Title */}
                      <div className="flex-1 space-y-1 sm:hidden">
                        <h4 className="font-bold text-sm text-black dark:text-white leading-snug">
                          <Link to={`/product/${item.product.id}`}>{item.product.name}</Link>
                        </h4>
                        <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block">{item.product.brand}</span>
                        <span className="text-sm font-bold text-neutral-600 dark:text-neutral-400 block">{formatPrice(item.product.price)}</span>
                      </div>
                    </div>

                    {/* Desktop Title */}
                    <div className="hidden sm:block flex-1 space-y-1">
                      <h4 className="font-bold text-base text-black dark:text-white hover:underline leading-snug tracking-tight">
                        <Link to={`/product/${item.product.id}`}>{item.product.name}</Link>
                      </h4>
                      <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block">{item.product.brand}</span>
                      <span className="text-sm font-bold text-neutral-500 dark:text-neutral-400">{formatPrice(item.product.price)}</span>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4 ml-9 sm:ml-0">
                      {/* Quantity selector */}
                      <div className="flex items-center rounded-lg bg-neutral-100 dark:bg-neutral-900 p-0.5 border border-neutral-200 dark:border-neutral-800">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          className="w-7 h-7 rounded-md flex items-center justify-center bg-white dark:bg-black shadow-sm text-black dark:text-white hover:opacity-75 transition-opacity"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="w-8 text-center text-sm font-bold text-black dark:text-white">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          className="w-7 h-7 rounded-md flex items-center justify-center bg-white dark:bg-black shadow-sm text-black dark:text-white hover:opacity-75 transition-opacity"
                        >
                          <Plus size={12} />
                        </button>
                      </div>

                      <span className="font-bold text-base text-black dark:text-white min-w-[100px] text-right tracking-tight">
                        {formatPrice(item.product.price * item.quantity)}
                      </span>

                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        className="p-2.5 bg-red-50 dark:bg-red-500/10 hover:bg-red-500 hover:text-white rounded-lg text-red-500 transition-colors"
                        title="Xóa sản phẩm"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="pt-2">
              <Link
                to="/products"
                className="inline-flex h-10 items-center justify-center text-neutral-500 hover:text-black dark:hover:text-white font-bold transition-colors text-sm gap-2"
              >
                <ArrowLeft size={16} /> Tiếp tục mua sắm
              </Link>
            </motion.div>
          </div>

          {/* Right Side: Totals Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="lg:col-span-4"
          >
            <div className="sticky top-28 bg-neutral-50 dark:bg-neutral-900/50 rounded-2xl p-6 md:p-8 space-y-6">
              <h3 className="text-lg font-black tracking-tight text-black dark:text-white border-b border-neutral-200 dark:border-neutral-800 pb-3">
                Thanh toán
              </h3>

              <div className="space-y-3">
                <div className="flex justify-between text-sm font-bold">
                  <span className="text-neutral-500">Đã chọn:</span>
                  <span className="text-black dark:text-white">{selectedIds.length} sản phẩm</span>
                </div>
                <div className="flex justify-between text-sm font-bold">
                  <span className="text-neutral-500">Tạm tính:</span>
                  <span className="text-black dark:text-white">{formatPrice(selectedTotal)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold">
                  <span className="text-neutral-500">Phí vận chuyển:</span>
                  <span className="text-emerald-600 dark:text-emerald-400">Miễn phí</span>
                </div>
              </div>

              <div className="border-t border-neutral-200 dark:border-neutral-800 pt-5 mt-5">
                <div className="flex justify-between items-end mb-1.5">
                  <span className="text-sm font-bold text-black dark:text-white">Tổng cộng:</span>
                  <span className="text-2xl font-black tracking-tight text-black dark:text-white">{formatPrice(selectedTotal)}</span>
                </div>
                <p className="text-xs font-medium text-neutral-400 text-right mb-6">(Đã bao gồm VAT)</p>
              </div>

              <button
                onClick={handleCheckout}
                disabled={selectedIds.length === 0}
                className="w-full inline-flex h-12 items-center justify-center gap-2 bg-black text-white dark:bg-white dark:text-black font-bold rounded-xl hover:opacity-85 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed text-sm tracking-wide shadow-sm"
              >
                <CreditCard size={18} /> Thanh toán
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
