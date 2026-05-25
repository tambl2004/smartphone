import React from 'react';
import filterConfig from '@data/filters.json';

interface ProductSortProps {
  selectedSort: string;
  onSortChange: (sort: string) => void;
  resultsCount: number;
}

export const ProductSort: React.FC<ProductSortProps> = ({
  selectedSort,
  onSortChange,
  resultsCount
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-neutral-100 dark:border-neutral-900 mb-8">
      <div className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
        Tìm thấy <span className="font-bold text-black dark:text-white">{resultsCount}</span> sản phẩm
      </div>
      <div className="flex items-center gap-2.5">
        <span className="text-xs font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">Sắp xếp theo:</span>
        <select
          value={selectedSort}
          onChange={(e) => onSortChange(e.target.value)}
          className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg py-2 px-3 text-xs font-semibold text-black dark:text-white focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white transition-all cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800"
        >
          {filterConfig.sortOptions.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-white dark:bg-neutral-950">
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};
