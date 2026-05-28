import React, { useState, useEffect, useCallback } from 'react';
import { Product } from '@types';
import { getProducts, type ProductListMeta } from '@services/product.service';
import { ProductFilter } from '@/components/users/product/ProductFilter';
import { ProductSort } from '@/components/users/product/ProductSort';
import { ProductList } from '@/components/users/product/ProductList';
import { ProductQuickView } from '@/components/users/product/ProductQuickView';
import { useRouter } from '@routes/router';
import { motion } from 'motion/react';

export const ProductListPage: React.FC = () => {
  const { path } = useRouter();

  const queryParams = new URLSearchParams(window.location.search);
  const initialCategory = queryParams.get('categoryId') || undefined;


  const [products, setProducts] = useState<Product[]>([]);
  const [, setMeta] = useState<ProductListMeta>({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [categoryId, setCategoryId] = useState<number | undefined>(
    initialCategory ? Number(initialCategory) : undefined
  );
  const [brand, setBrand] = useState<string | undefined>(undefined);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 100000000 });
  const [sort, setSort] = useState('featured');
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(window.location.search);
      const catId = params.get('categoryId');
      setCategoryId(catId ? Number(catId) : undefined);
      const searchVal = params.get('search');
      if (searchVal) {
        setBrand(undefined);
        setPriceRange({ min: 0, max: 100000000 });
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [path]);

  const fetchProducts = useCallback(async () => {
    await Promise.resolve();
    setIsLoading(true);
    const searchVal = new URLSearchParams(window.location.search).get('search') || undefined;

    // Build sort params
    let sortBy: string | undefined;
    let sortOrder: 'asc' | 'desc' | undefined;
    if (sort === 'price_asc') { sortBy = 'price'; sortOrder = 'asc'; }
    else if (sort === 'price_desc') { sortBy = 'price'; sortOrder = 'desc'; }
    else if (sort === 'rating') { sortBy = 'rating'; sortOrder = 'desc'; }
    else { sortBy = 'id'; sortOrder = 'desc'; } // featured / default

    const result = await getProducts({
      search: searchVal,
      categoryId,
      brand,
      sortBy,
      sortOrder,
      limit: 100,
    });

    // Client-side price filter
    const filtered = result.items.filter(
      (p) => p.price >= priceRange.min && p.price <= priceRange.max
    );

    setProducts(filtered);
    setMeta(result.meta);
    setIsLoading(false);
  }, [categoryId, brand, priceRange, sort, path]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchProducts();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchProducts]);

  const handleResetFilters = () => {
    setCategoryId(undefined);
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
              selectedCategoryId={categoryId}
              onCategoryChange={setCategoryId}
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
