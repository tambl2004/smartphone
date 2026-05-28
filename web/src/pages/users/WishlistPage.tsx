import React from 'react';
import { useWishlist } from '@hooks/useWishlist';
import { useCart } from '@hooks/useCart';
import { Link } from '@routes/router';
import { Product } from '@types';
import { Heart, X, Star, ShoppingCart, Eye } from 'lucide-react';
import { motion } from 'motion/react';
import { formatPrice } from '@utils/format';

const API_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api').replace('/api', '');

const getProductImage = (prod: Product): string => {
  if (!prod.images || prod.images.length === 0) return 'https://placehold.co/200x200?text=No+Image';
  const primary = prod.images.find((img) => img.isPrimary) ?? prod.images[0];
  if (primary.imageUrl.startsWith('http')) return primary.imageUrl;
  return `${API_URL}${primary.imageUrl}`;
};

export const WishlistPage: React.FC = () => {
  const { items, toggleWishlist, syncFromServer } = useWishlist();
  const { addToCart } = useCart();

  React.useEffect(() => {
    void syncFromServer();
  }, [syncFromServer]);

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0a0a0a] pt-32 pb-24 flex items-center justify-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center max-w-lg px-6">
          <div className="w-24 h-24 rounded-full bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center mx-auto mb-8 border border-neutral-100 dark:border-neutral-800">
            <Heart size={36} className="text-neutral-300 dark:text-neutral-700" strokeWidth={1.5} />
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-black dark:text-white mb-6">
            Chưa có mục yêu thích
          </h1>
          <p className="text-neutral-500 text-lg font-medium mb-10 leading-relaxed">
            Hãy lướt qua bộ sưu tập của chúng tôi và lưu lại những sản phẩm bạn ưng ý nhất.
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
      <div className="max-w-[1200px] w-full mx-auto px-6">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-6"
        >
          <div>
            <span className="text-[11px] font-bold tracking-[0.2em] text-neutral-400 uppercase block mb-4">NEXPHONE / YÊU THÍCH</span>

          </div>
          <div className="md:text-right">
            <p className="text-xs font-bold text-neutral-500 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-900 inline-flex items-center justify-center px-4 py-2.5 rounded-full uppercase tracking-widest">
              {items.length} sản phẩm
            </p>
          </div>
        </motion.div>

        {/* Product List */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-col gap-6"
        >
          {items.map((prod: Product, i) => (
            <motion.div
              key={prod.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="group flex flex-col sm:flex-row gap-4 sm:gap-6 p-4 sm:p-5 rounded-2xl bg-neutral-50 dark:bg-neutral-900/50 hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors duration-500 relative"
            >
              {/* Image */}
              <div className="w-full sm:w-32 lg:w-40 aspect-[4/3] sm:aspect-square bg-white dark:bg-black rounded-xl overflow-hidden relative flex-shrink-0">
                <Link to={`/product/${prod.id}`}>
                  <img src={getProductImage(prod)} alt={prod.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                </Link>
                <button
                  onClick={() => toggleWishlist(prod)}
                  className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center rounded-full bg-white/80 dark:bg-black/80 backdrop-blur-md text-red-500 hover:bg-red-500 hover:text-white transition-colors shadow-sm"
                  aria-label="Xóa khỏi yêu thích"
                >
                  <X size={14} strokeWidth={2.5} />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 flex flex-col justify-center py-1">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-1 block">{prod.brand}</span>
                    <h3 className="text-lg md:text-xl font-bold text-black dark:text-white mb-2 leading-tight tracking-tight">
                      <Link to={`/product/${prod.id}`} className="hover:underline">{prod.name}</Link>
                    </h3>
                    <div className="flex items-center gap-1 text-xs text-neutral-500 mb-2 md:mb-0">
                      <Star size={13} className="fill-amber-500 text-amber-500" />
                      <span className="font-bold text-neutral-800 dark:text-neutral-200">{prod.rating}</span>
                      <span className="text-neutral-400">({prod.reviewsCount} đánh giá)</span>
                    </div>
                  </div>

                  {/* Price block for Desktop */}
                  <div className="hidden md:flex flex-col items-end">
                    <span className="text-lg font-bold tracking-tight text-black dark:text-white">{formatPrice(prod.price)}</span>
                    {prod.originalPrice && prod.originalPrice > prod.price && (
                      <span className="text-xs font-medium text-neutral-400 line-through mt-0.5">{formatPrice(prod.originalPrice)}</span>
                    )}
                  </div>
                </div>

                {/* Price block for Mobile */}
                <div className="md:hidden flex items-baseline gap-2 mb-4 mt-2">
                  <span className="text-lg font-bold tracking-tight text-black dark:text-white">{formatPrice(prod.price)}</span>
                  {prod.originalPrice && prod.originalPrice > prod.price && (
                    <span className="text-xs font-medium text-neutral-400 line-through">{formatPrice(prod.originalPrice)}</span>
                  )}
                </div>

                {/* Action buttons */}
                <div className="mt-auto md:mt-4 flex gap-3">
                  <button
                    onClick={() => addToCart(prod, 1)}
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 bg-black text-white dark:bg-white dark:text-black px-6 py-2.5 rounded-xl font-bold hover:opacity-85 transition-opacity text-xs tracking-wide shadow-sm"
                  >
                    <ShoppingCart size={14} /> Thêm vào giỏ
                  </button>
                  <Link
                    to={`/product/${prod.id}`}
                    className="flex-none inline-flex items-center justify-center w-10 sm:w-auto sm:px-5 py-2.5 rounded-xl font-bold border border-neutral-200 dark:border-neutral-800 hover:border-black dark:hover:border-white transition-colors text-black dark:text-white text-xs shadow-sm"
                  >
                    <span className="hidden sm:inline">Xem chi tiết</span>
                    <Eye size={16} className="sm:hidden" />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </div>
  );
};
