import React from 'react';
import type { OrderStatus } from '@data/adminData';

interface StatusBadgeProps {
  status: OrderStatus | 'active' | 'blocked' | 'draft' | 'outOfStock' | 'critical' | 'warning' | 'hidden' | 'out_of_stock';
}

const statusConfig: Record<string, { label: string; bg: string; text: string; dot: string }> = {
  pending: { label: 'Chờ xử lý', bg: 'bg-amber-500/10', text: 'text-amber-400', dot: 'bg-amber-400' },
  confirmed: { label: 'Đã xác nhận', bg: 'bg-blue-500/10', text: 'text-blue-400', dot: 'bg-blue-400' },
  shipping: { label: 'Đang giao', bg: 'bg-purple-500/10', text: 'text-purple-400', dot: 'bg-purple-400' },
  delivered: { label: 'Đã giao', bg: 'bg-emerald-500/10', text: 'text-emerald-400', dot: 'bg-emerald-400' },
  cancelled: { label: 'Đã hủy', bg: 'bg-red-500/10', text: 'text-red-400', dot: 'bg-red-400' },
  active: { label: 'Hoạt động', bg: 'bg-emerald-500/10', text: 'text-emerald-400', dot: 'bg-emerald-400' },
  blocked: { label: 'Đã khóa', bg: 'bg-red-500/10', text: 'text-red-400', dot: 'bg-red-400' },
  draft: { label: 'Nháp', bg: 'bg-neutral-500/10', text: 'text-neutral-400', dot: 'bg-neutral-400' },
  outOfStock: { label: 'Hết hàng', bg: 'bg-orange-500/10', text: 'text-orange-400', dot: 'bg-orange-400' },
  out_of_stock: { label: 'Hết hàng', bg: 'bg-orange-500/10', text: 'text-orange-400', dot: 'bg-orange-400' },
  hidden: { label: 'Đã ẩn', bg: 'bg-neutral-500/10', text: 'text-neutral-400', dot: 'bg-neutral-400' },
  critical: { label: 'Nguy hiểm', bg: 'bg-red-500/10', text: 'text-red-400', dot: 'bg-red-400' },
  warning: { label: 'Cảnh báo', bg: 'bg-amber-500/10', text: 'text-amber-400', dot: 'bg-amber-400' },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const config = statusConfig[status] || statusConfig.pending;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
};
