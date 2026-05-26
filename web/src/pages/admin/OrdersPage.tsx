import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Eye, X, MapPin, Phone, Mail, CreditCard } from 'lucide-react';
import { ChartCard } from '@components/admin/ChartCard';
import { StatusBadge } from '@components/admin/StatusBadge';
import { orders, formatCurrency } from '@data/adminData';
import type { Order } from '@data/adminData';

export const OrdersPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const statusFilters: { key: string; label: string; count: number }[] = [
    { key: 'all', label: 'Tất cả', count: orders.length },
    { key: 'pending', label: 'Chờ xử lý', count: orders.filter(o => o.status === 'pending').length },
    { key: 'confirmed', label: 'Đã xác nhận', count: orders.filter(o => o.status === 'confirmed').length },
    { key: 'shipping', label: 'Đang giao', count: orders.filter(o => o.status === 'shipping').length },
    { key: 'delivered', label: 'Đã giao', count: orders.filter(o => o.status === 'delivered').length },
    { key: 'cancelled', label: 'Đã hủy', count: orders.filter(o => o.status === 'cancelled').length },
  ];

  const filteredOrders = orders.filter(o => {
    const matchSearch = o.id.toLowerCase().includes(searchQuery.toLowerCase()) || o.customer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = filterStatus === 'all' || o.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Quản lý đơn hàng</h1>
        <p className="text-sm text-white/40 mt-1">{orders.length} đơn hàng</p>
      </div>

      {/* Status filter tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {statusFilters.map(sf => (
          <button key={sf.key} onClick={() => setFilterStatus(sf.key)}
            className={`h-9 px-4 rounded-lg text-sm font-medium transition-all border-none outline-none whitespace-nowrap flex items-center gap-2 ${filterStatus === sf.key ? 'bg-indigo-600 text-white' : 'bg-white/[0.04] text-white/50 hover:text-white hover:bg-white/[0.08]'}`}>
            {sf.label}
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${filterStatus === sf.key ? 'bg-white/20' : 'bg-white/[0.06]'}`}>{sf.count}</span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
        <input type="text" placeholder="Tìm mã đơn, tên khách hàng..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full h-10 pl-10 pr-4 bg-white/[0.04] border border-white/[0.08] rounded-lg text-sm text-white placeholder:text-white/30 outline-none focus:border-indigo-500/50 transition-all" />
      </div>

      {/* Orders Table */}
      <ChartCard title={`Hiển thị ${filteredOrders.length} đơn hàng`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="text-left text-xs font-medium text-white/30 pb-3 pr-4">Mã đơn</th>
                <th className="text-left text-xs font-medium text-white/30 pb-3 pr-4">Khách hàng</th>
                <th className="text-left text-xs font-medium text-white/30 pb-3 pr-4">Sản phẩm</th>
                <th className="text-left text-xs font-medium text-white/30 pb-3 pr-4">Tổng tiền</th>
                <th className="text-left text-xs font-medium text-white/30 pb-3 pr-4">Thanh toán</th>
                <th className="text-left text-xs font-medium text-white/30 pb-3 pr-4">Trạng thái</th>
                <th className="text-left text-xs font-medium text-white/30 pb-3 pr-4">Ngày tạo</th>
                <th className="text-left text-xs font-medium text-white/30 pb-3"></th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order, index) => (
                <motion.tr key={order.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: index * 0.03 }}
                  className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors cursor-pointer group" onClick={() => setSelectedOrder(order)}>
                  <td className="py-3 pr-4"><span className="text-sm font-mono text-indigo-400">{order.id}</span></td>
                  <td className="py-3 pr-4"><span className="text-sm text-white/70">{order.customer}</span></td>
                  <td className="py-3 pr-4">
                    <div className="flex -space-x-2">
                      {order.items.slice(0, 3).map((item, i) => (
                        <img key={i} src={item.image} alt="" className="w-7 h-7 rounded-md object-cover border-2 border-[#141414]" />
                      ))}
                      {order.items.length > 3 && <span className="w-7 h-7 rounded-md bg-white/[0.08] flex items-center justify-center text-[10px] text-white/50 border-2 border-[#141414]">+{order.items.length - 3}</span>}
                    </div>
                  </td>
                  <td className="py-3 pr-4"><span className="text-sm text-white/70 font-medium">{formatCurrency(order.total)}</span></td>
                  <td className="py-3 pr-4"><span className="text-xs text-white/40">{order.paymentMethod}</span></td>
                  <td className="py-3 pr-4"><StatusBadge status={order.status} /></td>
                  <td className="py-3 pr-4"><span className="text-sm text-white/40">{new Date(order.createdAt).toLocaleDateString('vi-VN')}</span></td>
                  <td className="py-3"><button className="w-7 h-7 rounded-md flex items-center justify-center text-white/30 hover:text-white hover:bg-white/[0.08] transition-all border-none outline-none opacity-0 group-hover:opacity-100"><Eye size={14} /></button></td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </ChartCard>

      {/* Order Detail Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={() => setSelectedOrder(null)}>
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-[#1A1A1A] border border-white/[0.08] rounded-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between p-5 border-b border-white/[0.06]">
                <div>
                  <h3 className="text-lg font-semibold text-white">{selectedOrder.id}</h3>
                  <p className="text-xs text-white/40 mt-0.5">{new Date(selectedOrder.createdAt).toLocaleString('vi-VN')}</p>
                </div>
                <button onClick={() => setSelectedOrder(null)} className="w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-white/[0.08] transition-all border-none outline-none"><X size={16} /></button>
              </div>
              <div className="p-5 space-y-5">
                <div className="flex items-center gap-3">
                  <StatusBadge status={selectedOrder.status} />
                  <span className="text-sm text-white/40">•</span>
                  <span className="text-sm text-white/50 flex items-center gap-1"><CreditCard size={13} />{selectedOrder.paymentMethod}</span>
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-white/30 uppercase tracking-wider">Khách hàng</p>
                  <p className="text-sm text-white/80">{selectedOrder.customer}</p>
                  <p className="text-xs text-white/40 flex items-center gap-1"><Mail size={12} />{selectedOrder.email}</p>
                  <p className="text-xs text-white/40 flex items-center gap-1"><Phone size={12} />{selectedOrder.phone}</p>
                  <p className="text-xs text-white/40 flex items-center gap-1"><MapPin size={12} />{selectedOrder.address}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-white/30 uppercase tracking-wider">Sản phẩm</p>
                  {selectedOrder.items.map((item, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.04]">
                      <img src={item.image} alt="" className="w-10 h-10 rounded-lg object-cover" />
                      <div className="flex-1"><p className="text-sm text-white/80">{item.name}</p><p className="text-xs text-white/40">x{item.quantity}</p></div>
                      <p className="text-sm text-white/70 font-medium">{formatCurrency(item.price * item.quantity)}</p>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-white/[0.06]">
                  <span className="text-sm text-white/50">Tổng cộng</span>
                  <span className="text-lg font-bold text-white">{formatCurrency(selectedOrder.total)}</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
