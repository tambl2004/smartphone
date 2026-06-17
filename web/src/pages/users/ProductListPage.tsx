import React, { useState, useEffect, useCallback } from 'react';
import { Product } from '@types';
import { getProducts, type ProductListMeta } from '@services/product.service';
import { ProductFilter } from '@/components/users/product/ProductFilter';
import { ProductSort } from '@/components/users/product/ProductSort';
import { ProductList } from '@/components/users/product/ProductList';
import { Pagination } from '@/components/common/Pagination';
import { useRouter } from '@routes/router';
import { motion, AnimatePresence } from 'motion/react';
import { SlidersHorizontal, X } from 'lucide-react';

export const ProductListPage: React.FC = () => {
  const { path } = useRouter();

  const queryParams = new URLSearchParams(window.location.search);
  const initialCategory = queryParams.get('categoryId') || undefined;


  const [products, setProducts] = useState<Product[]>([]);
  const [meta, setMeta] = useState<ProductListMeta>({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [isLoading, setIsLoading] = useState(true);
  const [categoryId, setCategoryId] = useState<number | undefined>(
    initialCategory ? Number(initialCategory) : undefined
  );
  const [brand, setBrand] = useState<string | undefined>(undefined);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 100000000 });
  const [sort, setSort] = useState('featured');
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);

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
      setPage(1);
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
      page,
      limit,
    });

    // Client-side price filter
    const filtered = result.items.filter(
      (p) => p.price >= priceRange.min && p.price <= priceRange.max
    );

    setProducts(filtered);
    setMeta(result.meta);
    setIsLoading(false);
  }, [categoryId, brand, priceRange, sort, path, page, limit]); // eslint-disable-line react-hooks/exhaustive-deps

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
          {/* Desktop Filter Sidebar */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="hidden lg:block w-72 flex-none lg:sticky lg:top-28"
          >
            <ProductFilter
              selectedCategoryId={categoryId}
              onCategoryChange={(val) => { setCategoryId(val); setPage(1); }}
              selectedBrand={brand}
              onBrandChange={(val) => { setBrand(val); setPage(1); }}
              selectedPriceRange={priceRange}
              onPriceRangeChange={(min, max) => { setPriceRange({ min, max }); setPage(1); }}
              onReset={() => { handleResetFilters(); setPage(1); }}
            />
          </motion.div>

          {/* Mobile Filter Drawer Overlay */}
          <AnimatePresence>
            {showFiltersMobile && (
              <>
                {/* Backdrop */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.5 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowFiltersMobile(false)}
                  className="fixed inset-0 bg-black z-50 lg:hidden"
                />
                {/* Drawer Content */}
                <motion.div
                  initial={{ x: '-100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '-100%' }}
                  transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                  className="fixed inset-y-0 left-0 w-[290px] bg-white dark:bg-neutral-900 z-50 p-6 overflow-y-auto lg:hidden shadow-2xl flex flex-col"
                >
                  <div className="flex items-center justify-between mb-6 border-b border-neutral-100 dark:border-neutral-800 pb-4">
                    <span className="font-bold text-lg text-black dark:text-white">Bộ lọc</span>
                    <button
                      onClick={() => setShowFiltersMobile(false)}
                      className="text-neutral-500 hover:text-black dark:hover:text-white"
                    >
                      <X size={20} />
                    </button>
                  </div>
                  <div className="flex-1">
                    <ProductFilter
                      selectedCategoryId={categoryId}
                      onCategoryChange={(val) => { setCategoryId(val); setPage(1); setShowFiltersMobile(false); }}
                      selectedBrand={brand}
                      onBrandChange={(val) => { setBrand(val); setPage(1); setShowFiltersMobile(false); }}
                      selectedPriceRange={priceRange}
                      onPriceRangeChange={(min, max) => { setPriceRange({ min, max }); setPage(1); setShowFiltersMobile(false); }}
                      onReset={() => { handleResetFilters(); setPage(1); setShowFiltersMobile(false); }}
                    />
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          <div className="flex-1 w-full">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {/* Mobile Filter Toggle Button */}
              <div className="lg:hidden flex items-center justify-between gap-4 mb-4">
                <button
                  onClick={() => setShowFiltersMobile(true)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-neutral-100 dark:bg-neutral-900 text-black dark:text-white rounded-lg text-xs font-semibold hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors border border-neutral-200 dark:border-neutral-800"
                >
                  <SlidersHorizontal size={14} />
                  Bộ lọc tìm kiếm
                </button>
              </div>

              <ProductSort
                selectedSort={sort}
                onSortChange={(val) => { setSort(val); setPage(1); }}
                resultsCount={products.length}
              />

              <div className="mt-8">
                <ProductList
                  products={products}
                  isLoading={isLoading}
                />
                
                {!isLoading && products.length > 0 && (
                  <Pagination
                    meta={meta}
                    onPageChange={setPage}
                    onLimitChange={(newLimit) => {
                      setLimit(newLimit);
                      setPage(1);
                    }}
                  />
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

    </div>
  );
};
