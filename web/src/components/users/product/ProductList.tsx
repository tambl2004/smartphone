import React from 'react';
import { Product } from '@types';
import { ProductCard } from './ProductCard';
import { Search } from 'lucide-react';
import { motion } from 'motion/react';

interface ProductListProps {
  products: Product[];
  isLoading: boolean;
}

export const ProductList: React.FC<ProductListProps> = ({
  products,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, idx) => (
          <div key={idx} className="h-[420px] bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-md p-4 flex flex-col animate-pulse">
            <div className="aspect-square bg-neutral-200 dark:bg-neutral-800 rounded-md mb-4" />
            <div className="h-3 w-1/3 bg-neutral-200 dark:bg-neutral-800 rounded mb-2" />
            <div className="h-5 w-3/4 bg-neutral-200 dark:bg-neutral-800 rounded mb-4" />
            <div className="h-5 w-1/4 bg-neutral-200 dark:bg-neutral-800 rounded mt-auto" />
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Search size={48} className="text-neutral-300 dark:text-neutral-700 mb-4" />
        <h3 className="text-xl font-bold mb-2 text-black dark:text-white">No products found</h3>
        <p className="text-neutral-500">Try adjusting your filters or search terms.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product, idx) => (
        <motion.div
          key={product.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.05 }}
        >
          <ProductCard product={product} />
        </motion.div>
      ))}
    </div>
  );
};
