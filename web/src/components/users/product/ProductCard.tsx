import React from 'react';
import { Product } from '@types';
import { Card } from '@components/common/Card';
import { Button } from '@components/common/Button';
import { formatPrice } from '@utils/format';
import { getDiscountPercentage } from '@utils/helpers';
import { useCart } from '@hooks/useCart';
import { useWishlist } from '@hooks/useWishlist';
import { Link } from '@routes/router';
import { Heart, Eye, ShoppingCart, Star } from 'lucide-react';
import { motion } from 'motion/react';

interface ProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onQuickView }) => {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const isWish = isInWishlist(product.id);
  const discount = getDiscountPercentage(product.originalPrice, product.price);

  return (
    <motion.div className="h-full">
      <Card padding="none" className="h-full flex flex-col group relative">
        <div className="relative aspect-square bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
          <Link to={`/product/${product.id}`} className="absolute inset-0">
            <img 
              src={product.image} 
              alt={product.name} 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
            />
          </Link>
          
          {discount > 0 && (
            <span className="absolute top-3 left-3 bg-red-600 text-white text-[11px] font-bold px-2 py-1 rounded-sm shadow-sm tracking-wide">
              -{discount}%
            </span>
          )}
          
          <button
            className={`absolute top-3 right-3 p-2 rounded-md bg-white/90 dark:bg-black/90 backdrop-blur-md transition-all shadow-sm ${isWish ? 'text-red-500' : 'text-neutral-500 hover:text-black dark:hover:text-white'}`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleWishlist(product);
            }}
          >
            <Heart size={16} className={isWish ? "fill-current" : ""} />
          </button>
        </div>

        <div className="p-5 flex flex-col flex-grow">
          <span className="text-[10px] font-bold text-neutral-400 tracking-widest uppercase mb-1.5">{product.brand}</span>
          <h3 className="text-base font-semibold text-neutral-900 dark:text-white mb-2 line-clamp-2 leading-snug">
            <Link to={`/product/${product.id}`} className="hover:underline">{product.name}</Link>
          </h3>
          
          <div className="flex items-center gap-1 text-xs text-neutral-500 dark:text-neutral-400 mb-4">
            <Star size={13} className="fill-amber-500 text-amber-500 mr-0.5" />
            <span className="font-bold text-neutral-800 dark:text-neutral-200">{product.rating}</span>
            <span className="text-neutral-400 ml-0.5">({product.reviewsCount})</span>
          </div>

          <div className="mt-auto mb-5 flex items-baseline gap-2">
            <span className="text-[17px] font-bold text-black dark:text-white">{formatPrice(product.price)}</span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-[13px] text-neutral-400 line-through">{formatPrice(product.originalPrice)}</span>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              variant="secondary"
              className="flex-none px-0 w-11"
              onClick={() => onQuickView?.(product)}
            >
              <Eye size={18} />
            </Button>
            <Button
              variant="primary"
              className="flex-1 px-0 text-[14px] gap-2"
              onClick={() => addToCart(product, 1)}
            >
              <ShoppingCart size={16} /> Thêm
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};
