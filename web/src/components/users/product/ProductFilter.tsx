import React, { useState, useEffect } from 'react';
import { Category } from '@types';
import { getCategories } from '@services/product.service';
import filterConfig from '@data/filters.json';
import { Filter, RotateCcw } from 'lucide-react';

interface ProductFilterProps {
  selectedCategoryId?: number;
  onCategoryChange: (categoryId?: number) => void;
  selectedBrand?: string;
  onBrandChange: (brandName?: string) => void;
  selectedPriceRange: { min: number; max: number };
  onPriceRangeChange: (min: number, max: number) => void;
  onReset: () => void;
}

export const ProductFilter: React.FC<ProductFilterProps> = ({
  selectedCategoryId,
  onCategoryChange,
  selectedBrand,
  onBrandChange,
  selectedPriceRange,
  onPriceRangeChange,
  onReset
}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const brands = ['Apple', 'Samsung', 'OPPO', 'Xiaomi', 'Vivo', 'Realme', 'OnePlus', 'Huawei'];

  useEffect(() => {
    void getCategories().then(setCategories);
  }, []);

  return (
    <aside className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-900 rounded-xl p-6 space-y-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-neutral-100 dark:border-neutral-900">
        <div className="flex items-center gap-2 font-bold text-base text-black dark:text-white">
          <Filter size={16} />
          <span>Bộ lọc tìm kiếm</span>
        </div>
        <button 
          onClick={onReset} 
          className="flex items-center gap-1 text-xs font-semibold text-neutral-500 hover:text-black dark:hover:text-white transition-colors"
        >
          <RotateCcw size={12} />
          Đặt lại
        </button>
      </div>

      {/* Category Group */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">Danh mục sản phẩm</h4>
        <div className="flex flex-col gap-2">
          <label 
            className={`flex items-center justify-between px-4 py-2.5 rounded-lg border text-xs font-semibold cursor-pointer transition-all ${
              !selectedCategoryId
                ? 'border-black dark:border-white bg-neutral-50 dark:bg-neutral-900 text-black dark:text-white shadow-sm font-bold' 
                : 'border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:border-neutral-300 dark:hover:border-neutral-700'
            }`}
          >
            <input
              type="radio"
              name="category"
              checked={!selectedCategoryId}
              onChange={() => onCategoryChange(undefined)}
              className="sr-only"
            />
            <span>Tất cả danh mục</span>
            {!selectedCategoryId && (
              <div className="w-1.5 h-1.5 rounded-full bg-black dark:bg-white" />
            )}
          </label>
          
          {categories.map((cat) => (
            <label 
              key={cat.id} 
              className={`flex items-center justify-between px-4 py-2.5 rounded-lg border text-xs font-semibold cursor-pointer transition-all ${
                selectedCategoryId === cat.id 
                  ? 'border-black dark:border-white bg-neutral-50 dark:bg-neutral-900 text-black dark:text-white shadow-sm font-bold' 
                  : 'border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:border-neutral-300 dark:hover:border-neutral-700'
              }`}
            >
              <input
                type="radio"
                name="category"
                checked={selectedCategoryId === cat.id}
                onChange={() => onCategoryChange(cat.id)}
                className="sr-only"
              />
              <span className="flex items-center gap-2">
                {cat.icon && <span>{cat.icon}</span>}
                <span>{cat.name}</span>
              </span>
              {selectedCategoryId === cat.id && (
                <div className="w-1.5 h-1.5 rounded-full bg-black dark:bg-white" />
              )}
            </label>
          ))}
        </div>
      </div>

      {/* Brand Group */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">Hãng sản xuất</h4>
        <div className="flex flex-col gap-2">
          <label 
            className={`flex items-center justify-between px-4 py-2.5 rounded-lg border text-xs font-semibold cursor-pointer transition-all ${
              !selectedBrand
                ? 'border-black dark:border-white bg-neutral-50 dark:bg-neutral-900 text-black dark:text-white shadow-sm font-bold' 
                : 'border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:border-neutral-300 dark:hover:border-neutral-700'
            }`}
          >
            <input
              type="radio"
              name="brand"
              checked={!selectedBrand}
              onChange={() => onBrandChange(undefined)}
              className="sr-only"
            />
            <span>Tất cả hãng</span>
            {!selectedBrand && (
              <div className="w-1.5 h-1.5 rounded-full bg-black dark:bg-white" />
            )}
          </label>
          
          {brands.map((bName) => (
            <label 
              key={bName} 
              className={`flex items-center justify-between px-4 py-2.5 rounded-lg border text-xs font-semibold cursor-pointer transition-all ${
                selectedBrand === bName
                  ? 'border-black dark:border-white bg-neutral-50 dark:bg-neutral-900 text-black dark:text-white shadow-sm font-bold' 
                  : 'border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:border-neutral-300 dark:hover:border-neutral-700'
              }`}
            >
              <input
                type="radio"
                name="brand"
                checked={selectedBrand === bName}
                onChange={() => onBrandChange(bName)}
                className="sr-only"
              />
              <span>{bName}</span>
              {selectedBrand === bName && (
                <div className="w-1.5 h-1.5 rounded-full bg-black dark:bg-white" />
              )}
            </label>
          ))}
        </div>
      </div>

      {/* Price Group */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">Mức giá</h4>
        <div className="flex flex-col gap-2">
          {filterConfig.priceRanges.map((range, idx) => {
            const isActive = selectedPriceRange.min === range.min && selectedPriceRange.max === range.max;
            return (
              <label 
                key={idx} 
                className={`flex items-center justify-between px-4 py-2.5 rounded-lg border text-xs font-semibold cursor-pointer transition-all ${
                  isActive
                    ? 'border-black dark:border-white bg-neutral-50 dark:bg-neutral-900 text-black dark:text-white shadow-sm font-bold' 
                    : 'border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:border-neutral-300 dark:hover:border-neutral-700'
                }`}
              >
                <input
                  type="radio"
                  name="priceRange"
                  checked={isActive}
                  onChange={() => onPriceRangeChange(range.min, range.max)}
                  className="sr-only"
                />
                <span>{range.label}</span>
                {isActive && (
                  <div className="w-1.5 h-1.5 rounded-full bg-black dark:bg-white" />
                )}
              </label>
            );
          })}
        </div>
      </div>
    </aside>
  );
};
