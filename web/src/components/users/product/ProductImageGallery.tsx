import React, { useState } from 'react';
import type { ProductImage } from '@types';
import { motion, AnimatePresence } from 'motion/react';

const API_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api').replace('/api', '');

interface ProductImageGalleryProps {
  images: ProductImage[];
  productName: string;
}

export const ProductImageGallery: React.FC<ProductImageGalleryProps> = ({ images, productName }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  // Sort: primary first, then by sort_order
  const sorted = [...images].sort((a, b) => (b.isPrimary - a.isPrimary) || (a.sortOrder - b.sortOrder));
  const galleryImages = sorted.length > 0
    ? sorted.map((img) => img.imageUrl.startsWith('http') ? img.imageUrl : `${API_URL}${img.imageUrl}`)
    : ['https://placehold.co/600x600?text=No+Image'];

  return (
    <div className="flex flex-col gap-4">
      {/* Main Image */}
      <div className="w-full aspect-square bg-neutral-50 dark:bg-neutral-900 rounded-md overflow-hidden relative border border-neutral-200 dark:border-neutral-800">
        <AnimatePresence mode="wait">
          <motion.img
            key={activeIndex}
            src={galleryImages[activeIndex]}
            alt={`${productName} - Ảnh ${activeIndex + 1}`}
            className="w-full h-full object-cover"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            loading="eager"
          />
        </AnimatePresence>
      </div>

      {/* Thumbnails */}
      {galleryImages.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-1">
          {galleryImages.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIndex(idx)}
              className={`flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 transition-all ${
                idx === activeIndex
                  ? 'border-black dark:border-white ring-2 ring-black/10 dark:ring-white/10'
                  : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-400 dark:hover:border-neutral-500'
              }`}
            >
              <img
                src={img}
                alt={`${productName} - Thumbnail ${idx + 1}`}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
