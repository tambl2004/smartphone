import React from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import type { PaginationMeta } from '@/types/api';

export interface PaginationProps {
  meta: PaginationMeta;
  onPageChange: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  limitOptions?: number[];
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  meta,
  onPageChange,
  onLimitChange,
  limitOptions = [5, 10, 20, 50],
  className = '',
}) => {
  const { page, limit, total, totalPages } = meta;

  if (totalPages <= 1 && !onLimitChange) return null;

  const handlePrev = () => {
    if (page > 1) onPageChange(page - 1);
  };

  const handleNext = () => {
    if (page < totalPages) onPageChange(page + 1);
  };

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (page <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (page >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = page - 1; i <= page + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const startItem = (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, total);

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 ${className}`}>
      <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-white/50">
        <span>
          Hiển thị <span className="font-medium text-gray-900 dark:text-white">{total === 0 ? 0 : startItem}</span> - <span className="font-medium text-gray-900 dark:text-white">{endItem}</span> trong <span className="font-medium text-gray-900 dark:text-white">{total}</span>
        </span>
        {onLimitChange && (
          <div className="flex items-center gap-2 border-l border-gray-200 dark:border-white/10 pl-3">
            <span>Hiển thị:</span>
            <select
              value={limit}
              onChange={(e) => onLimitChange(Number(e.target.value))}
              className="bg-transparent border border-gray-200 dark:border-white/10 rounded px-2 py-1 text-sm text-gray-900 dark:text-white outline-none cursor-pointer"
            >
              {limitOptions.map((opt) => (
                <option key={opt} value={opt} className="bg-white dark:bg-[#1A1A1A] text-gray-900 dark:text-white">
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center gap-1">
          <button
            onClick={handlePrev}
            disabled={page <= 1}
            className="p-2 rounded-lg border border-gray-200 dark:border-white/10 text-gray-500 dark:text-white/50 hover:bg-gray-50 dark:hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          
          {getPageNumbers().map((p, index) => (
            p === '...' ? (
              <div key={`ellipsis-${index}`} className="px-2 text-gray-400 dark:text-white/40">
                <MoreHorizontal size={16} />
              </div>
            ) : (
              <button
                key={p}
                onClick={() => onPageChange(p as number)}
                className={`min-w-[32px] h-8 flex items-center justify-center rounded-lg text-sm transition-colors ${
                  page === p
                    ? 'bg-indigo-600 text-white font-medium'
                    : 'text-gray-600 dark:text-white/70 hover:bg-gray-50 dark:hover:bg-white/5'
                }`}
              >
                {p}
              </button>
            )
          ))}

          <button
            onClick={handleNext}
            disabled={page >= totalPages}
            className="p-2 rounded-lg border border-gray-200 dark:border-white/10 text-gray-500 dark:text-white/50 hover:bg-gray-50 dark:hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
};
