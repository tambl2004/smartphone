import React, { useState, useEffect } from 'react';
import { Product } from '@types';
import { mockApi } from '@services/mockApi';
import { useParams } from '@routes/router';
import { formatPrice } from '@utils/format';
import { getDiscountPercentage } from '@utils/helpers';
import { useCart } from '@hooks/useCart';
import { useWishlist } from '@hooks/useWishlist';
import { Button } from '@components/common/Button';
import { ProductImageGallery } from '@/components/users/product/ProductImageGallery';
import { Heart, Minus, Plus, ShoppingCart, ShieldCheck, ArrowLeft, Star } from 'lucide-react';
import { Link } from '@routes/router';
import { motion } from 'motion/react';

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams('/product/:id');
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    mockApi.getProductById(id).then((prod: Product | null) => {
      if (prod) {
        setProduct(prod);
      }
      setIsLoading(false);
    });
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen pt-32 px-6 max-w-[1400px] mx-auto animate-pulse flex flex-col md:flex-row gap-12">
        <div className="w-full md:w-1/2 bg-neutral-200 dark:bg-neutral-800 rounded-md aspect-square"></div>
        <div className="w-full md:w-1/2 space-y-6">
          <div className="h-10 bg-neutral-200 dark:bg-neutral-800 rounded w-3/4"></div>
          <div className="h-6 bg-neutral-200 dark:bg-neutral-800 rounded w-1/4"></div>
          <div className="h-32 bg-neutral-200 dark:bg-neutral-800 rounded w-full"></div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen pt-40 px-6 text-center">
        <h3 className="text-2xl font-bold mb-4 text-black dark:text-white">Không tìm thấy sản phẩm</h3>
        <Link to="/products" className="text-neutral-500 hover:text-black dark:hover:text-white underline">Quay lại cửa hàng</Link>
      </div>
    );
  }

  const discount = getDiscountPercentage(product.originalPrice, product.price);
  const isWish = isInWishlist(product.id);

  return (
    <div className="pt-24 pb-20">
      <div className="max-w-[1400px] mx-auto px-6">
        <Link to="/products" className="inline-flex items-center text-sm font-semibold tracking-wide text-neutral-500 hover:text-black dark:hover:text-white mb-10 transition-colors uppercase">
          <ArrowLeft size={16} className="mr-2" /> Quay lại cửa hàng
        </Link>
        
        <div className="flex flex-col lg:flex-row gap-12 xl:gap-24">
          {/* Left Side: Image Gallery */}
          <div className="w-full lg:w-1/2 flex flex-col">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="sticky top-28"
            >
              <ProductImageGallery images={product.images} productName={product.name} />
            </motion.div>
          </div>

          {/* Right Side: Product Info */}
          <div className="w-full lg:w-1/2 flex flex-col pt-4">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="mb-4 text-[11px] font-bold uppercase tracking-widest text-neutral-400">
                {product.brand}
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter mb-6 text-black dark:text-white leading-[1.1]">
                {product.name}
              </h1>
              
              <div className="flex items-center gap-4 text-sm mb-8">
                <div className="flex items-center gap-1 text-yellow-500 font-bold">
                  <Star size={16} className="fill-current" /> {product.rating} <span className="text-neutral-500 ml-1 font-medium">({product.reviewsCount} đánh giá)</span>
                </div>
                <div className="w-1.5 h-1.5 bg-neutral-300 dark:bg-neutral-700 rounded-full"></div>
                <div className={`font-bold tracking-wide text-xs uppercase ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {product.stock > 0 ? 'Còn hàng' : 'Hết hàng'}
                </div>
              </div>

              <div className="flex items-end gap-4 mb-8">
                <span className="text-4xl font-bold text-black dark:text-white leading-none">{formatPrice(product.price)}</span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <>
                    <span className="text-xl text-neutral-400 line-through leading-none mb-0.5">{formatPrice(product.originalPrice)}</span>
                    <span className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-bold px-2 py-1 rounded-sm shadow-sm tracking-wide mb-1.5">
                      Tiết kiệm {discount}%
                    </span>
                  </>
                )}
              </div>

              <p className="text-neutral-500 leading-relaxed mb-12 text-lg font-medium">
                {product.description}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-12 pb-12 border-b border-neutral-200 dark:border-neutral-800">
                <div className="flex items-center border border-neutral-300 dark:border-neutral-700 rounded-md h-14 bg-white dark:bg-neutral-900 w-full sm:w-36 justify-between px-4">
                  <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="text-neutral-400 hover:text-black dark:hover:text-white transition-colors">
                    <Minus size={20} />
                  </button>
                  <span className="font-bold text-lg text-black dark:text-white">{quantity}</span>
                  <button onClick={() => setQuantity(q => Math.min(product.stock, q + 1))} className="text-neutral-400 hover:text-black dark:hover:text-white transition-colors">
                    <Plus size={20} />
                  </button>
                </div>
                
                <Button 
                  size="lg" 
                  className="flex-1 text-lg"
                  onClick={() => addToCart(product, quantity)}
                  disabled={product.stock <= 0}
                >
                  <ShoppingCart size={20} className="mr-3" /> Thêm vào giỏ hàng
                </Button>
                
                <Button 
                  variant="secondary" 
                  size="lg"
                  className={`w-14 sm:w-14 px-0 border-neutral-300 dark:border-neutral-700 ${isWish ? 'text-red-500 hover:text-red-600 bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900' : ''}`}
                  onClick={() => toggleWishlist(product)}
                >
                  <Heart size={20} className={isWish ? 'fill-current' : ''} />
                </Button>
              </div>

              {/* Guarantees */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-14">
                <div className="flex items-start gap-4">
                  <ShieldCheck className="text-neutral-400 mt-1" size={28} />
                  <div>
                    <h4 className="font-bold text-sm mb-1 text-black dark:text-white tracking-wide">Bảo hành 1 năm</h4>
                    <p className="text-xs font-medium text-neutral-500 leading-relaxed">Bao gồm bảo hành chính hãng từ nhà sản xuất.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <ShoppingCart className="text-neutral-400 mt-1" size={28} />
                  <div>
                    <h4 className="font-bold text-sm mb-1 text-black dark:text-white tracking-wide">Giao hàng miễn phí</h4>
                    <p className="text-xs font-medium text-neutral-500 leading-relaxed">Giao hàng tiêu chuẩn miễn phí cho tất cả dòng máy flagship.</p>
                  </div>
                </div>
              </div>

              {/* Specs */}
              <div>
                <h3 className="text-xl font-bold mb-6 tracking-tight text-black dark:text-white">Thông số kỹ thuật chi tiết</h3>
                <div className="border border-neutral-200 dark:border-neutral-800 rounded-md overflow-hidden">
                  {Object.entries(product.specs).map(([key, val], idx) => (
                    <div key={key} className={`flex px-6 py-5 ${idx !== 0 ? 'border-t border-neutral-200 dark:border-neutral-800' : ''} ${idx % 2 === 0 ? 'bg-neutral-50 dark:bg-neutral-900/50' : 'bg-white dark:bg-neutral-900'}`}>
                      <div className="w-1/3 text-xs font-bold uppercase tracking-wider text-neutral-500">{key}</div>
                      <div className="w-2/3 text-sm text-black dark:text-white font-semibold">{val as string}</div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};
