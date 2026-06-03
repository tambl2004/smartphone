import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Lock, Unlock, Mail, Phone, ShoppingBag, Users as UsersIcon, X, Package, Calendar, LayoutGrid, List, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { StatusBadge } from '@components/admin/StatusBadge';
import { ConfirmationModal } from '@components/admin/ConfirmationModal';
import { apiClient, type AdminCustomer, type AdminCustomerOrder } from '@services/api-client';
import { getAuth } from '@services/auth.service';
import { Pagination } from '@/components/common/Pagination';
import { formatPrice, formatDate } from '@utils/format';
import { useRouter } from '@routes/router';

const SERVER_BASE = (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000/api').replace('/api', '');
const getAvatarUrl = (url: string | null) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${SERVER_BASE}${url.startsWith('/') ? '' : '/'}${url}`;
};

export const CustomersPage: React.FC = () => {
  const { path } = useRouter();
  const [searchQuery, setSearchQuery] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('email') || params.get('search') || '';
  });
  const [filterStatus, setFilterStatus] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [customers, setCustomers] = useState<AdminCustomer[]>([]);
  const [loading, setLoading] = useState(true);

  const [prevPath, setPrevPath] = useState(path);
  if (path !== prevPath) {
    setPrevPath(path);
    const params = new URLSearchParams(window.location.search);
    const query = params.get('email') || params.get('search') || '';
    setSearchQuery(query);
  }
  const [historyCustomer, setHistoryCustomer] = useState<AdminCustomer | null>(null);
  const [customerOrders, setCustomerOrders] = useState<AdminCustomerOrder[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [lockTarget, setLockTarget] = useState<AdminCustomer | null>(null);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  
  const total = customers.length;
  const totalPages = Math.ceil(total / limit) || 1;
  const paginatedCustomers = customers.slice((page - 1) * limit, page * limit);

  const fetchCustomers = useCallback(async () => {
    const auth = getAuth();
    if (!auth?.token) return;
    try {
      const params: Record<string, string> = {};
      if (searchQuery) params.search = searchQuery;
      if (filterStatus !== 'all') params.status = filterStatus;
      const res = await apiClient.getCustomers(params, auth.token);
      if (res.data) {
        setCustomers(res.data.items);
      }
    } catch (error) {
      console.error('Failed to fetch customers', error);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, filterStatus]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      setLoading(true);
      void fetchCustomers();
    }, 300);
    return () => clearTimeout(debounce);
  }, [fetchCustomers]);

  // Fetch customer orders when opening history modal
  const handleOpenHistory = async (customer: AdminCustomer) => {
    setHistoryCustomer(customer);
    setLoadingOrders(true);
    setCustomerOrders([]);
    const auth = getAuth();
    if (!auth?.token) return;
    try {
      const res = await apiClient.getCustomerOrders(customer.id, auth.token);
      if (res.data) {
        setCustomerOrders(res.data.items);
      }
    } catch (error) {
      console.error('Failed to fetch customer orders', error);
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleLock = async () => {
    if (!lockTarget) return;
    const auth = getAuth();
    if (!auth?.token) return;
    try {
      const res = await apiClient.toggleCustomerStatus(lockTarget.id, auth.token);
      if (res.data) {
        const newStatus = res.data.status as 'active' | 'blocked';
        setCustomers(prev =>
          prev.map(c => c.id === lockTarget.id ? { ...c, status: newStatus } : c)
        );
        toast.success(newStatus === 'blocked'
          ? `Đã khóa tài khoản "${lockTarget.fullName}"!`
          : `Đã mở khóa tài khoản "${lockTarget.fullName}"!`
        );
      }
    } catch {
      toast.error('Thao tác thất bại');
    }
    setLockTarget(null);
  };

  const formatSpent = (val: string | number) => {
    const num = Number(val);
    if (num >= 1000000) return `${(num / 1000000).toFixed(0)}tr`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
    return String(num);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Quản lý khách hàng</h1>
          <p className="text-sm opacity-40 mt-1">{loading ? 'Đang tải...' : `${customers.length} khách hàng`}</p>
        </div>
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
        <div className="hidden sm:flex items-center gap-1 bg-white/[0.02] p-1 rounded-lg border border-white/[0.06] ml-auto">
          <button onClick={() => setViewMode('grid')} className={`w-8 h-8 rounded-md flex items-center justify-center transition-all border-none outline-none ${viewMode === 'grid' ? 'bg-white/[0.08] text-white shadow-sm' : 'text-white/40 hover:text-white hover:bg-white/[0.04]'}`}>
            <LayoutGrid size={15} />
          </button>
          <button onClick={() => setViewMode('table')} className={`w-8 h-8 rounded-md flex items-center justify-center transition-all border-none outline-none ${viewMode === 'table' ? 'bg-white/[0.08] text-white shadow-sm' : 'text-white/40 hover:text-white hover:bg-white/[0.04]'}`}>
            <List size={15} />
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="py-16 text-center"><Loader2 size={32} className="animate-spin opacity-20 mx-auto mb-3" /><p className="text-sm opacity-30">Đang tải dữ liệu...</p></div>
      )}

      {/* Content View */}
      {!loading && viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {paginatedCustomers.map((customer, index) => (
            <motion.div key={customer.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: index * 0.05 }}
              className="bg-[#141414] border border-white/[0.06] rounded-2xl p-5 hover:border-white/[0.12] transition-all group">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 overflow-hidden">
                  {getAvatarUrl(customer.avatarUrl)
                    ? <img src={getAvatarUrl(customer.avatarUrl)!} alt={customer.fullName} className="w-12 h-12 rounded-full object-cover" />
                    : customer.fullName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-white truncate">{customer.fullName}</h3>
                    <StatusBadge status={customer.status} />
                  </div>
                  <p className="text-xs text-white/40 mt-1 flex items-center gap-1"><Mail size={11} />{customer.email}</p>
                  {customer.phone && <p className="text-xs text-white/40 mt-0.5 flex items-center gap-1"><Phone size={11} />{customer.phone}</p>}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-white/[0.04]">
                <div className="text-center">
                  <p className="text-lg font-bold text-white">{customer.totalOrders}</p>
                  <p className="text-[10px] text-white/30 mt-0.5">Đơn hàng</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-emerald-400">{formatSpent(customer.totalSpent)}</p>
                  <p className="text-[10px] text-white/30 mt-0.5">Đã chi</p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-white/60">{customer.lastOrderDate ? new Date(customer.lastOrderDate).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }) : '—'}</p>
                  <p className="text-[10px] text-white/30 mt-0.5">Đơn cuối</p>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-4">
                <button onClick={() => handleOpenHistory(customer)}
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
      )}

      {!loading && viewMode === 'table' && (
        <div className="bg-[#141414] border border-white/[0.06] rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                  <th className="p-4 text-xs font-semibold text-white/40 uppercase tracking-wider">Khách hàng</th>
                  <th className="p-4 text-xs font-semibold text-white/40 uppercase tracking-wider">Liên hệ</th>
                  <th className="p-4 text-xs font-semibold text-white/40 uppercase tracking-wider text-center">Đơn hàng</th>
                  <th className="p-4 text-xs font-semibold text-white/40 uppercase tracking-wider text-right">Đã chi</th>
                  <th className="p-4 text-xs font-semibold text-white/40 uppercase tracking-wider text-center">Trạng thái</th>
                  <th className="p-4 text-xs font-semibold text-white/40 uppercase tracking-wider text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {paginatedCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs flex-shrink-0 overflow-hidden">
                          {getAvatarUrl(customer.avatarUrl)
                            ? <img src={getAvatarUrl(customer.avatarUrl)!} alt={customer.fullName} className="w-10 h-10 rounded-full object-cover" />
                            : customer.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{customer.fullName}</p>
                          <p className="text-xs text-white/40 mt-0.5">Tham gia: {customer.joinDate ? new Date(customer.joinDate).toLocaleDateString('vi-VN') : '—'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-1">
                        <p className="text-xs text-white/60 flex items-center gap-1.5"><Mail size={12} className="opacity-50" /> {customer.email}</p>
                        {customer.phone && <p className="text-xs text-white/60 flex items-center gap-1.5"><Phone size={12} className="opacity-50" /> {customer.phone}</p>}
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <p className="text-sm font-medium text-white">{customer.totalOrders}</p>
                      <p className="text-[10px] text-white/40 mt-0.5">{customer.lastOrderDate ? `${new Date(customer.lastOrderDate).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })} (Đơn cuối)` : 'Chưa có đơn'}</p>
                    </td>
                    <td className="p-4 text-right text-emerald-400 font-medium">
                      {formatPrice(Number(customer.totalSpent))}
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex justify-center">
                        <StatusBadge status={customer.status} />
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleOpenHistory(customer)} className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/[0.04] text-white/60 hover:text-white hover:bg-white/[0.08] transition-all outline-none border-none" title="Lịch sử">
                          <ShoppingBag size={14} />
                        </button>
                        <button onClick={() => setLockTarget(customer)} className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all outline-none border-none ${customer.status === 'active' ? 'bg-red-500/[0.08] text-red-400 hover:bg-red-500/[0.15]' : 'bg-emerald-500/[0.08] text-emerald-400 hover:bg-emerald-500/[0.15]'}`} title={customer.status === 'active' ? 'Khóa' : 'Mở khóa'}>
                          {customer.status === 'active' ? <Lock size={14} /> : <Unlock size={14} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!loading && customers.length === 0 && (
        <div className="py-16 text-center"><UsersIcon size={40} className="opacity-10 mx-auto mb-3" /><p className="text-sm opacity-30">Không tìm thấy khách hàng nào</p></div>
      )}

      {!loading && customers.length > 0 && (
        <Pagination
          meta={{ page, limit, total, totalPages }}
          onPageChange={setPage}
          onLimitChange={(newLimit) => {
            setLimit(newLimit);
            setPage(1);
          }}
        />
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
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm overflow-hidden">
                    {getAvatarUrl(historyCustomer.avatarUrl)
                      ? <img src={getAvatarUrl(historyCustomer.avatarUrl)!} alt="" className="w-10 h-10 rounded-full object-cover" />
                      : historyCustomer.fullName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-white">{historyCustomer.fullName}</h3>
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
                    <p className="text-lg font-bold text-emerald-400">{formatPrice(Number(historyCustomer.totalSpent))}</p>
                    <p className="text-[10px] text-white/30">Tổng chi</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.04] text-center">
                    <p className="text-sm font-medium text-white/70 flex items-center justify-center gap-1"><Calendar size={12} />{historyCustomer.joinDate ? new Date(historyCustomer.joinDate).toLocaleDateString('vi-VN') : '—'}</p>
                    <p className="text-[10px] text-white/30">Tham gia</p>
                  </div>
                </div>

                {/* Orders list */}
                <p className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-3">Đơn hàng gần đây</p>
                <div className="space-y-3">
                  {loadingOrders ? (
                    <div className="py-8 text-center">
                      <Loader2 size={24} className="animate-spin text-white/20 mx-auto mb-2" />
                      <p className="text-xs text-white/30">Đang tải đơn hàng...</p>
                    </div>
                  ) : customerOrders.length > 0 ? (
                    customerOrders.map(order => (
                      <div key={order.id} className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:border-white/[0.08] transition-all">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-mono text-indigo-400">{order.orderCode}</span>
                          <StatusBadge status={order.status as React.ComponentProps<typeof StatusBadge>['status']} />
                        </div>
                        {order.items.map((item, i) => (
                          <div key={i} className="flex items-center gap-2 mt-2">
                            <div className="w-7 h-7 rounded-md overflow-hidden bg-white/[0.05] flex items-center justify-center flex-shrink-0">
                              {item.productImage
                                ? <img src={item.productImage.startsWith('http') ? item.productImage : (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api').replace('/api', '') + (item.productImage.startsWith('/') ? '' : '/') + item.productImage} alt="" className="w-full h-full object-cover" />
                                : <Package size={12} className="text-white/20" />}
                            </div>
                            <span className="text-xs text-white/60 flex-1 truncate">{item.productName}</span>
                            <span className="text-xs text-white/40">x{item.quantity}</span>
                          </div>
                        ))}
                        <div className="flex items-center justify-between mt-3 pt-2 border-t border-white/[0.04]">
                          <span className="text-xs text-white/30">{formatDate(order.createdAt)}</span>
                          <span className="text-sm font-medium text-white/80">{formatPrice(Number(order.totalAmount))}</span>
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

      {/* Lock/Unlock Confirmation */}
      <ConfirmationModal
        isOpen={!!lockTarget}
        onClose={() => setLockTarget(null)}
        onConfirm={handleLock}
        title={lockTarget?.status === 'active' ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
        message={lockTarget?.status === 'active'
          ? `Bạn có chắc muốn khóa tài khoản "${lockTarget?.fullName}"? Khách hàng sẽ không thể đăng nhập.`
          : `Bạn có chắc muốn mở khóa tài khoản "${lockTarget?.fullName}"?`
        }
        confirmText={lockTarget?.status === 'active' ? 'Khóa' : 'Mở khóa'}
        confirmColor={lockTarget?.status === 'active' ? 'red' : 'emerald'}
      />
    </div>
  );
};
