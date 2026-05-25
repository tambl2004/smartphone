import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, UserPlus, Lock, Unlock, Mail, Phone, ShoppingBag, Users as UsersIcon, X, Package, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import { StatusBadge } from '@components/admin/StatusBadge';
import { ConfirmationModal } from '@components/admin/ConfirmationModal';
import { customers, orders, formatCurrency } from '@data/adminData';
import type { Customer } from '@data/adminData';

export const CustomersPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [historyCustomer, setHistoryCustomer] = useState<Customer | null>(null);
  const [lockTarget, setLockTarget] = useState<Customer | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });

  const filtered = customers.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = filterStatus === 'all' || c.status === filterStatus;
    return matchSearch && matchStatus;
  });

  // Get mock orders for a customer
  const getCustomerOrders = (customer: Customer) => {
    return orders.filter(o => o.customer === customer.name);
  };

  const handleLock = () => {
    if (!lockTarget) return;
    if (lockTarget.status === 'active') {
      toast.success(`Đã khóa tài khoản "${lockTarget.name}"!`);
    } else {
      toast.success(`Đã mở khóa tài khoản "${lockTarget.name}"!`);
    }
    setLockTarget(null);
  };

  const handleAddCustomer = () => {
    if (!formData.name || !formData.email) {
      toast.error('Vui lòng nhập đầy đủ tên và email');
      return;
    }
    toast.success('Thêm khách hàng mới thành công!');
    setIsAddModalOpen(false);
    setFormData({ name: '', email: '', phone: '' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Quản lý khách hàng</h1>
          <p className="text-sm opacity-40 mt-1">{customers.length} khách hàng</p>
        </div>
        <button onClick={() => setIsAddModalOpen(true)} className="h-9 px-4 flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 border-none rounded-lg text-sm text-white font-medium transition-all outline-none">
          <UserPlus size={14} /> Thêm khách hàng
        </button>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-30" />
          <input type="text" placeholder="Tìm tên, email khách hàng..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-10 pr-4 bg-white/[0.04] border border-white/[0.08] rounded-lg text-sm placeholder:opacity-30 outline-none focus:border-indigo-500/50 transition-all" />
        </div>
        <div className="flex items-center gap-2">
          {['all', 'active', 'blocked'].map(s => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className={`h-8 px-3 rounded-full text-xs font-medium transition-all border-none outline-none ${filterStatus === s ? 'bg-indigo-600 text-white' : 'bg-white/[0.04] opacity-50 hover:opacity-100 hover:bg-white/[0.08]'}`}>
              {s === 'all' ? 'Tất cả' : s === 'active' ? 'Hoạt động' : 'Đã khóa'}
            </button>
          ))}
        </div>
      </div>

      {/* Customer Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((customer, index) => (
          <motion.div key={customer.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: index * 0.05 }}
            className="bg-[#141414] border border-white/[0.06] rounded-2xl p-5 hover:border-white/[0.12] transition-all group">
            <div className="flex items-start gap-4">
              <img src={customer.avatar} alt={customer.name} className="w-12 h-12 rounded-full object-cover" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-white truncate">{customer.name}</h3>
                  <StatusBadge status={customer.status} />
                </div>
                <p className="text-xs text-white/40 mt-1 flex items-center gap-1"><Mail size={11} />{customer.email}</p>
                <p className="text-xs text-white/40 mt-0.5 flex items-center gap-1"><Phone size={11} />{customer.phone}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-white/[0.04]">
              <div className="text-center">
                <p className="text-lg font-bold text-white">{customer.totalOrders}</p>
                <p className="text-[10px] text-white/30 mt-0.5">Đơn hàng</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-emerald-400">{(customer.totalSpent / 1000000).toFixed(0)}tr</p>
                <p className="text-[10px] text-white/30 mt-0.5">Đã chi</p>
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-white/60">{new Date(customer.lastOrder).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}</p>
                <p className="text-[10px] text-white/30 mt-0.5">Đơn cuối</p>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-4">
              <button onClick={() => setHistoryCustomer(customer)}
                className="flex-1 h-8 flex items-center justify-center gap-1.5 bg-white/[0.04] border border-white/[0.08] rounded-lg text-xs text-white/60 hover:text-white hover:bg-white/[0.08] transition-all outline-none">
                <ShoppingBag size={12} /> Lịch sử
              </button>
              <button onClick={() => setLockTarget(customer)}
                className={`flex-1 h-8 flex items-center justify-center gap-1.5 rounded-lg text-xs transition-all outline-none border-none ${customer.status === 'active' ? 'bg-red-500/[0.08] text-red-400 hover:bg-red-500/[0.15]' : 'bg-emerald-500/[0.08] text-emerald-400 hover:bg-emerald-500/[0.15]'}`}>
                {customer.status === 'active' ? <><Lock size={12} /> Khóa</> : <><Unlock size={12} /> Mở khóa</>}
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="py-16 text-center"><UsersIcon size={40} className="opacity-10 mx-auto mb-3" /><p className="text-sm opacity-30">Không tìm thấy khách hàng nào</p></div>
      )}

      {/* Order History Modal */}
      <AnimatePresence>
        {historyCustomer && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={() => setHistoryCustomer(null)}>
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-[#1A1A1A] border border-white/[0.08] rounded-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between p-5 border-b border-white/[0.06] sticky top-0 bg-[#1A1A1A] z-10">
                <div className="flex items-center gap-3">
                  <img src={historyCustomer.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                  <div>
                    <h3 className="text-base font-semibold text-white">{historyCustomer.name}</h3>
                    <p className="text-xs text-white/40">Lịch sử mua hàng</p>
                  </div>
                </div>
                <button onClick={() => setHistoryCustomer(null)} className="w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-white/[0.08] transition-all border-none outline-none"><X size={16} /></button>
              </div>

              <div className="p-5">
                {/* Customer summary */}
                <div className="grid grid-cols-3 gap-3 mb-5">
                  <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.04] text-center">
                    <p className="text-lg font-bold text-white">{historyCustomer.totalOrders}</p>
                    <p className="text-[10px] text-white/30">Tổng đơn</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.04] text-center">
                    <p className="text-lg font-bold text-emerald-400">{formatCurrency(historyCustomer.totalSpent)}</p>
                    <p className="text-[10px] text-white/30">Tổng chi</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.04] text-center">
                    <p className="text-sm font-medium text-white/70 flex items-center justify-center gap-1"><Calendar size={12} />{new Date(historyCustomer.joinDate).toLocaleDateString('vi-VN')}</p>
                    <p className="text-[10px] text-white/30">Tham gia</p>
                  </div>
                </div>

                {/* Orders list */}
                <p className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-3">Đơn hàng gần đây</p>
                <div className="space-y-3">
                  {getCustomerOrders(historyCustomer).length > 0 ? (
                    getCustomerOrders(historyCustomer).map(order => (
                      <div key={order.id} className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:border-white/[0.08] transition-all">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-mono text-indigo-400">{order.id}</span>
                          <StatusBadge status={order.status} />
                        </div>
                        {order.items.map((item, i) => (
                          <div key={i} className="flex items-center gap-2 mt-2">
                            <img src={item.image} alt="" className="w-7 h-7 rounded-md object-cover" />
                            <span className="text-xs text-white/60 flex-1 truncate">{item.name}</span>
                            <span className="text-xs text-white/40">x{item.quantity}</span>
                          </div>
                        ))}
                        <div className="flex items-center justify-between mt-3 pt-2 border-t border-white/[0.04]">
                          <span className="text-xs text-white/30">{new Date(order.createdAt).toLocaleDateString('vi-VN')}</span>
                          <span className="text-sm font-medium text-white/80">{formatCurrency(order.total)}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-8 text-center">
                      <Package size={32} className="text-white/10 mx-auto mb-2" />
                      <p className="text-xs text-white/30">Chưa có đơn hàng nào</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Customer Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={() => setIsAddModalOpen(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-[#1A1A1A] border border-white/[0.08] rounded-2xl w-full max-w-sm" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between p-5 border-b border-white/[0.06]">
                <h3 className="text-lg font-semibold">Thêm khách hàng</h3>
                <button onClick={() => setIsAddModalOpen(false)} className="w-8 h-8 rounded-lg flex items-center justify-center opacity-40 hover:opacity-100 hover:bg-white/[0.08] transition-all border-none outline-none"><X size={16} /></button>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <label className="block text-xs font-medium opacity-40 mb-1.5">Họ và tên</label>
                  <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Nguyễn Văn A"
                    className="w-full h-10 px-3 bg-white/[0.04] border border-white/[0.08] rounded-lg text-sm outline-none focus:border-indigo-500/50 transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-medium opacity-40 mb-1.5">Email</label>
                  <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="email@example.com"
                    className="w-full h-10 px-3 bg-white/[0.04] border border-white/[0.08] rounded-lg text-sm outline-none focus:border-indigo-500/50 transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-medium opacity-40 mb-1.5">Số điện thoại</label>
                  <input type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="0987654321"
                    className="w-full h-10 px-3 bg-white/[0.04] border border-white/[0.08] rounded-lg text-sm outline-none focus:border-indigo-500/50 transition-all" />
                </div>
              </div>
              <div className="flex gap-3 px-5 pb-5">
                <button onClick={() => setIsAddModalOpen(false)} className="flex-1 h-10 rounded-lg bg-white/[0.06] border border-white/[0.08] text-sm opacity-70 hover:opacity-100 transition-all outline-none">Hủy</button>
                <button onClick={handleAddCustomer} className="flex-1 h-10 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-sm text-white font-medium transition-all outline-none border-none">
                  Thêm mới
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lock/Unlock Confirmation */}
      <ConfirmationModal
        isOpen={!!lockTarget}
        onClose={() => setLockTarget(null)}
        onConfirm={handleLock}
        title={lockTarget?.status === 'active' ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
        message={lockTarget?.status === 'active'
          ? `Bạn có chắc muốn khóa tài khoản "${lockTarget?.name}"? Khách hàng sẽ không thể đăng nhập.`
          : `Bạn có chắc muốn mở khóa tài khoản "${lockTarget?.name}"?`
        }
        confirmText={lockTarget?.status === 'active' ? 'Khóa' : 'Mở khóa'}
        confirmColor={lockTarget?.status === 'active' ? 'red' : 'emerald'}
      />
    </div>
  );
};
