import React, { useState } from 'react';
import type { Product } from '@types';
import { Modal } from '@components/common/Modal';
import { Button } from '@components/common/Button';
import { formatPrice } from '@utils/format';
import { getDiscountPercentage } from '@utils/helpers';
import { useCart } from '@hooks/useCart';
import { Star, Plus, Minus } from 'lucide-react';

interface ProductQuickViewProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ProductQuickView: React.FC<ProductQuickViewProps> = ({
  product,
  isOpen,
  onClose
}) => {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);

  if (!product) return null;

  const discount = getDiscountPercentage(product.originalPrice, product.price);

  const handleAddToCart = () => {
    addToCart(product, quantity);
    onClose();
    setQuantity(1);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={product.name}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-1">
        {/* Image side */}
        <div className="relative aspect-square rounded-md overflow-hidden bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex items-center justify-center p-8">
          <img src={product.image} alt={product.name} className="max-h-full object-contain" />
          {discount > 0 && (
            <span className="absolute top-4 left-4 bg-red-600 text-white text-xs font-bold px-2.5 py-1 rounded">
              -{discount}%
            </span>
          )}
        </div>

        {/* Info side */}
        <div className="flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral-500 dark:text-neutral-400">
              <span>Hãng: <strong className="text-black dark:text-white font-semibold">{product.brand}</strong></span>
              <span className="text-neutral-300 dark:text-neutral-800">|</span>
              <div className="flex items-center gap-1">
                <Star size={14} className="fill-amber-400 text-amber-400" />
                <span><strong className="text-black dark:text-white font-semibold">{product.rating}</strong> ({product.reviewsCount} đánh giá)</span>
              </div>
            </div>

            <div className="flex items-baseline gap-3">
              <span className="text-2xl font-bold text-black dark:text-white">{formatPrice(product.price)}</span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-sm text-neutral-400 dark:text-neutral-600 line-through">{formatPrice(product.originalPrice)}</span>
              )}
            </div>

            <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
              {product.description}
            </p>

            <div className="space-y-2 pt-2">
              <h5 className="text-xs font-bold uppercase tracking-wider text-black dark:text-white">Thông số kĩ thuật nổi bật:</h5>
              <ul className="text-xs space-y-1.5 text-neutral-500 dark:text-neutral-400 pl-4 list-disc">
                {Object.entries(product.specs).slice(0, 3).map(([key, val]) => (
                  <li key={key}>
                    <strong>{key}:</strong> {val as string}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="flex items-center gap-4 pt-4 border-t border-neutral-100 dark:border-neutral-900">
            {/* Quantity Selector */}
            <div className="flex items-center border border-neutral-200 dark:border-neutral-800 rounded bg-white dark:bg-black h-11">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-10 h-full flex items-center justify-center hover:bg-neutral-50 dark:hover:bg-neutral-900 text-neutral-500 transition-colors"
              >
                <Minus size={14} />
              </button>
              <span className="w-12 text-center text-sm font-bold text-black dark:text-white">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                className="w-10 h-full flex items-center justify-center hover:bg-neutral-50 dark:hover:bg-neutral-900 text-neutral-500 transition-colors"
              >
                <Plus size={14} />
              </button>
            </div>

            <Button variant="primary" onClick={handleAddToCart} className="flex-1 h-11">
              Thêm vào giỏ hàng
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
