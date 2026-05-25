import React from 'react';
import { useWishlist } from '@hooks/useWishlist';
import { ProductCard } from '@/components/users/product/ProductCard';
import { Link } from '@routes/router';
import { Product } from '@types';
import { Heart } from 'lucide-react';

export const WishlistPage: React.FC = () => {
  const { items } = useWishlist();

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-24 px-6 max-w-md mx-auto">
        <div className="w-16 h-16 rounded-full bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center mb-6">
          <Heart size={32} className="text-neutral-400 dark:text-neutral-600" />
        </div>
        <h3 className="text-2xl font-bold tracking-tight text-black dark:text-white mb-2">
          Danh sách yêu thích trống
        </h3>
        <p className="text-neutral-500 dark:text-neutral-400 mb-8 text-sm">
          Lưu lại những mẫu điện thoại bạn thích ở đây để dễ dàng so sánh và mua sắm sau nhé.
        </p>
        <Link 
          to="/products" 
          className="inline-flex h-11 items-center justify-center bg-black text-white dark:bg-white dark:text-black px-6 font-semibold rounded-md hover:opacity-85 transition-opacity text-sm shadow-sm"
        >
          Khám phá cửa hàng
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] w-full mx-auto px-6 py-12">
      <div className="flex items-center gap-3 mb-10">
        <Heart size={24} className="text-black dark:text-white" />
        <h2 className="text-3xl font-bold tracking-tight text-black dark:text-white">
          Sản phẩm yêu thích ({items.length})
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {items.map((prod: Product) => (
          <ProductCard key={prod.id} product={prod} />
        ))}
      </div>
    </div>
  );
};
