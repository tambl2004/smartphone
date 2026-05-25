import React, { useState, useEffect } from 'react';
import { Product } from '@types';
import { mockApi } from '@services/mockApi';
import { ProductFilter } from '@/components/users/product/ProductFilter';
import { ProductSort } from '@/components/users/product/ProductSort';
import { ProductList } from '@/components/users/product/ProductList';
import { ProductQuickView } from '@/components/users/product/ProductQuickView';
import { useRouter } from '@routes/router';
import { motion } from 'motion/react';

export const ProductListPage: React.FC = () => {
  const { path } = useRouter();

  const queryParams = new URLSearchParams(window.location.search);
  const initialCategory = queryParams.get('category') || undefined;

  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [category, setCategory] = useState<string | undefined>(initialCategory);
  const [brand, setBrand] = useState<string | undefined>(undefined);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 100000000 });
  const [sort, setSort] = useState('featured');
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setCategory(params.get('category') || undefined);
    const searchVal = params.get('search');
    if (searchVal) {
      setBrand(undefined);
      setPriceRange({ min: 0, max: 100000000 });
    }
  }, [path]);

  useEffect(() => {
    setIsLoading(true);
    const searchVal = new URLSearchParams(window.location.search).get('search') || undefined;

    mockApi
      .getProducts({
        category,
        brand,
        search: searchVal,
        minPrice: priceRange.min,
        maxPrice: priceRange.max,
        sort
      })
      .then((data: Product[]) => {
        setProducts(data);
        setIsLoading(false);
      });
  }, [category, brand, priceRange, sort, path]);

  const handleResetFilters = () => {
    setCategory(undefined);
    setBrand(undefined);
    setPriceRange({ min: 0, max: 100000000 });
    setSort('featured');
    window.history.pushState({}, '', '/products');
    window.dispatchEvent(new Event('navigate'));
  };

  return (
    <div className="pt-24 pb-20 min-h-screen bg-neutral-50 dark:bg-black">
      <div className="max-w-[1400px] mx-auto px-6">
        
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-black dark:text-white mb-6">Cửa hàng</h1>
          <div className="w-16 h-1 bg-black dark:bg-white rounded-full"></div>
        </div>

        <div className="flex flex-col lg:flex-row gap-10 items-start">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-full lg:w-72 flex-none lg:sticky lg:top-28"
          >
            <ProductFilter
              selectedCategory={category}
              onCategoryChange={setCategory}
              selectedBrand={brand}
              onBrandChange={setBrand}
              selectedPriceRange={priceRange}
              onPriceRangeChange={(min, max) => setPriceRange({ min, max })}
              onReset={handleResetFilters}
            />
          </motion.div>

          <div className="flex-1 w-full">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <ProductSort
                selectedSort={sort}
                onSortChange={setSort}
                resultsCount={products.length}
              />

              <div className="mt-8">
                <ProductList
                  products={products}
                  isLoading={isLoading}
                  onQuickView={(p) => setQuickViewProduct(p)}
                />
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <ProductQuickView
        product={quickViewProduct}
        isOpen={quickViewProduct !== null}
        onClose={() => setQuickViewProduct(null)}
      />
    </div>
  );
};
