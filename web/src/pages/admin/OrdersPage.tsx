import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import toast from 'react-hot-toast';
import { Search, Eye, X, MapPin, Phone, Mail, CreditCard, Package, Trash2, Printer } from 'lucide-react';
import { ChartCard } from '@components/admin/ChartCard';
import { formatPrice, formatDate } from '@utils/format';
import { orderService, OrderRecord } from '@services/order.service';
import { getAuth } from '@services/auth.service';
import { exportOrderInvoice } from '@utils/exportPdf';
import { Pagination } from '@/components/common/Pagination';
import { useRouter } from '@routes/router';

export const OrdersPage: React.FC = () => {
  const { path } = useRouter();
  const [searchQuery, setSearchQuery] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('email') || params.get('search') || '';
  });
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<OrderRecord | null>(null);
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  
  const total = orders.length;
  const totalPages = Math.ceil(total / limit) || 1;
  const paginatedOrders = orders.slice((page - 1) * limit, page * limit);

  const [prevPath, setPrevPath] = useState(path);
  if (path !== prevPath) {
    setPrevPath(path);
    const params = new URLSearchParams(window.location.search);
    const query = params.get('email') || params.get('search') || '';
    setSearchQuery(query);
  }

  useEffect(() => {
    let active = true;
    const delayDebounceFn = setTimeout(() => {
      const fetchOrders = async () => {
        const auth = getAuth();
        if (!auth?.token) {
          if (active) setLoading(false);
          return;
        }
        try {
          const { items } = await orderService.getAllOrders(auth.token, searchQuery, filterStatus);
          if (active) {
            setOrders(items);
            setLoading(false);
          }
        } catch (error) {
          console.error(error);
          if (active) setLoading(false);
        }
      };
      void fetchOrders();
    }, 300);

    return () => {
      active = false;
      clearTimeout(delayDebounceFn);
    };
  }, [searchQuery, filterStatus]);

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    const auth = getAuth();
    if (!auth?.token) return;
    try {
      await orderService.updateOrderStatus(orderId, newStatus, auth.token);
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    } catch (error) {
      console.error('Failed to update status', error);
    }
  };

  const handleDeleteOrder = async (orderId: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa đơn hàng này?')) return;
    const auth = getAuth();
    if (!auth?.token) return;
    try {
      await orderService.deleteOrder(orderId, auth.token);
      setOrders(orders.filter(o => o.id !== orderId));
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(null);
      }
    } catch (error) {
      console.error('Failed to delete order', error);
    }
  };

  const statusFilters = [
    { key: 'all', label: 'Tất cả' },
    { key: 'pending', label: 'Chờ xử lý' },
    { key: 'confirmed', label: 'Đã xác nhận' },
    { key: 'shipping', label: 'Đang giao' },
    { key: 'delivered', label: 'Đã giao' },
    { key: 'cancelled', label: 'Đã hủy' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-black dark:text-white">Quản lý đơn hàng</h1>
          <p className="text-sm text-neutral-500 mt-1">{orders.length} đơn hàng {loading && '(Đang tải...)'}</p>
        </div>
      </div>

      {/* Status filter tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
        {statusFilters.map(sf => (
          <button key={sf.key} onClick={() => { setLoading(true); setFilterStatus(sf.key); }}
            className={`h-9 px-4 rounded-lg text-sm font-medium transition-all border-none outline-none whitespace-nowrap flex items-center gap-2 ${filterStatus === sf.key ? 'bg-indigo-600 text-white' : 'bg-neutral-100 dark:bg-white/[0.04] text-neutral-600 dark:text-white/50 hover:bg-neutral-200 dark:hover:bg-white/[0.08]'}`}>
            {sf.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
        <input type="text" placeholder="Tìm mã đơn, tên khách hàng..." value={searchQuery} onChange={(e) => { setLoading(true); setSearchQuery(e.target.value); }}
          className="w-full h-10 pl-10 pr-4 bg-white dark:bg-white/[0.04] border border-neutral-200 dark:border-white/[0.08] rounded-lg text-sm text-black dark:text-white placeholder:text-neutral-400 outline-none focus:border-indigo-500/50 transition-all shadow-sm dark:shadow-none" />
      </div>

      {/* Orders Table */}
      <ChartCard title={`Danh sách đơn hàng`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-100 dark:border-white/[0.06]">
                <th className="text-left text-xs font-medium text-neutral-400 pb-3 pr-4">Mã đơn</th>
                <th className="text-left text-xs font-medium text-neutral-400 pb-3 pr-4">Khách hàng</th>
                <th className="text-left text-xs font-medium text-neutral-400 pb-3 pr-4">Sản phẩm</th>
                <th className="text-left text-xs font-medium text-neutral-400 pb-3 pr-4">Tổng tiền</th>
                <th className="text-left text-xs font-medium text-neutral-400 pb-3 pr-4">Thanh toán</th>
                <th className="text-left text-xs font-medium text-neutral-400 pb-3 pr-4">Trạng thái</th>
                <th className="text-left text-xs font-medium text-neutral-400 pb-3 pr-4">Ngày tạo</th>
                <th className="text-right text-xs font-medium text-neutral-400 pb-3">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {paginatedOrders.map((order, index) => (
                <motion.tr key={order.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: index * 0.02 }}
                  className="border-b border-neutral-50 dark:border-white/[0.03] hover:bg-neutral-50 dark:hover:bg-white/[0.02] transition-colors group">
                  <td className="py-3 pr-4"><span className="text-sm font-mono text-indigo-600 dark:text-indigo-400 cursor-pointer" onClick={() => setSelectedOrder(order)}>{order.orderCode}</span></td>
                  <td className="py-3 pr-4 cursor-pointer" onClick={() => setSelectedOrder(order)}>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-black dark:text-white/80">{order.customerName}</span>
                      <span className="text-xs text-neutral-500">{order.customerEmail}</span>
                    </div>
                  </td>
                  <td className="py-3 pr-4 cursor-pointer" onClick={() => setSelectedOrder(order)}>
                    <div className="flex -space-x-2">
                      {order.items?.slice(0, 3).map((item, i) => (
                        <div key={i} className="w-7 h-7 rounded-md bg-white border-2 border-neutral-50 dark:border-[#141414] overflow-hidden flex items-center justify-center">
                          {item.productImage ? (
                            <img src={item.productImage.startsWith('http') ? item.productImage : (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api').replace('/api', '') + (item.productImage.startsWith('/') ? '' : '/') + item.productImage} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <Package size={12} className="text-neutral-300" />
                          )}
                        </div>
                      ))}
                      {(order.items?.length || 0) > 3 && <span className="w-7 h-7 rounded-md bg-neutral-100 dark:bg-white/[0.08] flex items-center justify-center text-[10px] text-neutral-500 border-2 border-neutral-50 dark:border-[#141414]">+{(order.items?.length || 0) - 3}</span>}
                    </div>
                  </td>
                  <td className="py-3 pr-4 cursor-pointer" onClick={() => setSelectedOrder(order)}><span className="text-sm text-black dark:text-white/80 font-medium">{formatPrice(order.totalAmount)}</span></td>
                  <td className="py-3 pr-4 cursor-pointer" onClick={() => setSelectedOrder(order)}>
                    <div className="flex flex-col">
                      <span className="text-xs text-neutral-500 uppercase">{order.paymentMethod === 'cod' ? 'Thanh toán khi nhận hàng' : order.paymentMethod}</span>
                    </div>
                  </td>
                  <td className="py-3 pr-4">
                    <div className="relative inline-block">
                      <select 
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className={`text-xs font-bold px-2.5 py-1 rounded-full border outline-none cursor-pointer pr-6 ${
                          order.status === 'pending' ? 'text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20' :
                          order.status === 'confirmed' ? 'text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20' :
                          order.status === 'shipping' ? 'text-purple-600 bg-purple-50 border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20' :
                          order.status === 'delivered' ? 'text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' :
                          'text-red-600 bg-red-50 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20'
                        }`}
                        
                      >
                        <option value="pending" className="text-amber-600 bg-white dark:bg-neutral-900">Chờ xử lý</option>
                        <option value="confirmed" className="text-blue-600 bg-white dark:bg-neutral-900">Đã xác nhận</option>
                        <option value="shipping" className="text-purple-600 bg-white dark:bg-neutral-900">Đang giao</option>
                        <option value="delivered" className="text-emerald-600 bg-white dark:bg-neutral-900">Đã giao</option>
                        <option value="cancelled" className="text-red-600 bg-white dark:bg-neutral-900">Đã hủy</option>
                      </select>
                      
                    </div>
                  </td>
                  <td className="py-3 pr-4 cursor-pointer" onClick={() => setSelectedOrder(order)}><span className="text-sm text-neutral-500">{formatDate(order.createdAt)}</span></td>
                  <td className="py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => setSelectedOrder(order)} className="w-8 h-8 rounded-lg flex items-center justify-center text-neutral-400 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-white/[0.08] transition-all border-none outline-none"><Eye size={14} /></button>
                      <button onClick={() => handleDeleteOrder(order.id)} className="w-8 h-8 rounded-lg flex items-center justify-center text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all border-none outline-none"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </motion.tr>
              ))}
              {orders.length === 0 && !loading && (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-sm text-neutral-400">Không tìm thấy đơn hàng nào.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </ChartCard>

      {!loading && orders.length > 0 && (
        <Pagination
          meta={{ page, limit, total, totalPages }}
          onPageChange={setPage}
          onLimitChange={(newLimit) => {
            setLimit(newLimit);
            setPage(1);
          }}
        />
      )}

      {/* Order Detail Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setSelectedOrder(null)}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-neutral-900 rounded-3xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between sticky top-0 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md z-10">
                <div>
                  <h3 className="text-xl font-black text-black dark:text-white mb-1">Chi tiết đơn hàng</h3>
                  <p className="text-sm text-neutral-500">Mã đơn: <strong className="text-black dark:text-white font-mono">{selectedOrder.orderCode}</strong></p>
                </div>
                <button 
                  onClick={() => setSelectedOrder(null)}
                  className="w-10 h-10 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-500 hover:text-black dark:hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="flex flex-col lg:flex-row overflow-hidden flex-1">
                <div className="w-full lg:w-1/2 flex flex-col border-r border-neutral-100 dark:border-neutral-800">
                  <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                    <div className="flex items-center justify-between mb-8 p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-2xl">
                      <div>
                        <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">Trạng thái</p>
                        <div className="relative inline-block">
                          <select 
                            value={selectedOrder.status}
                            onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value)}
                            className={`text-sm font-bold px-3 py-1.5 rounded-xl border outline-none cursor-pointer pr-8 ${
                              selectedOrder.status === 'pending' ? 'text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20' :
                              selectedOrder.status === 'confirmed' ? 'text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20' :
                              selectedOrder.status === 'shipping' ? 'text-purple-600 bg-purple-50 border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20' :
                              selectedOrder.status === 'delivered' ? 'text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' :
                              'text-red-600 bg-red-50 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20'
                            }`}
                            
                          >
                            <option value="pending" className="text-amber-600 bg-white dark:bg-neutral-900">Chờ xử lý</option>
                            <option value="confirmed" className="text-blue-600 bg-white dark:bg-neutral-900">Đã xác nhận</option>
                            <option value="shipping" className="text-purple-600 bg-white dark:bg-neutral-900">Đang giao</option>
                            <option value="delivered" className="text-emerald-600 bg-white dark:bg-neutral-900">Đã giao</option>
                            <option value="cancelled" className="text-red-600 bg-white dark:bg-neutral-900">Đã hủy</option>
                          </select>
                          
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">Ngày đặt</p>
                        <p className="text-sm font-bold text-black dark:text-white">{formatDate(selectedOrder.createdAt)}</p>
                      </div>
                    </div>

                    <div className="mb-8">
                      <h4 className="text-sm font-bold text-black dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2"><CreditCard size={16} className="text-neutral-400" /> Thông tin giao hàng</h4>
                      <div className="bg-neutral-50 dark:bg-neutral-800/50 rounded-2xl p-5 space-y-4 text-sm">
                        <div className="flex flex-col gap-1">
                          <span className="text-neutral-500 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"><Mail size={12} /> Người nhận</span>
                          <span className="font-semibold text-black dark:text-white">{selectedOrder.customerName}</span>
                          <span className="text-neutral-500">{selectedOrder.customerEmail}</span>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-neutral-500 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"><Phone size={12} /> Điện thoại</span>
                          <span className="font-semibold text-black dark:text-white">{selectedOrder.customerPhone}</span>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-neutral-500 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"><MapPin size={12} /> Địa chỉ</span>
                          <span className="font-semibold text-black dark:text-white leading-relaxed">{selectedOrder.shippingAddress}</span>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-neutral-500 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"><CreditCard size={12} /> Thanh toán</span>
                          <span className="font-semibold text-black dark:text-white uppercase">{selectedOrder.paymentMethod === 'cod' ? 'Thanh toán khi nhận hàng' : selectedOrder.paymentMethod}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="w-full lg:w-1/2 flex flex-col bg-neutral-50/50 dark:bg-neutral-800/20">
                  <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                    <h4 className="text-sm font-bold text-black dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2"><Package size={16} className="text-neutral-400" /> Sản phẩm ({selectedOrder.items?.length || 0})</h4>
                    <div className="space-y-4">
                      {selectedOrder.items?.map((item, i) => (
                        <div key={i} className="flex items-center gap-4 py-3 border-b border-neutral-100 dark:border-neutral-800 last:border-0 last:pb-0">
                          <div className="w-16 h-16 rounded-xl bg-white dark:bg-neutral-800 overflow-hidden flex-shrink-0 border border-neutral-100 dark:border-neutral-700 flex items-center justify-center">
                            {item.productImage ? (
                              <img 
                                src={item.productImage.startsWith('http') ? item.productImage : (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api').replace('/api', '') + (item.productImage.startsWith('/') ? '' : '/') + item.productImage} 
                                alt={item.productName} 
                                className="w-full h-full object-cover" 
                              />
                            ) : (
                              <Package className="w-8 h-8 text-neutral-300 m-4" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-black dark:text-white truncate">{item.productName}</p>
                            <p className="text-xs text-neutral-500 mt-1">Số lượng: {item.quantity}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-black text-black dark:text-white">{formatPrice(item.lineTotal)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-6 border-t border-neutral-100 dark:border-neutral-800 bg-white/50 dark:bg-neutral-900/50 flex flex-col gap-3 backdrop-blur-sm">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-neutral-500">Tạm tính:</span>
                      <span className="font-semibold text-black dark:text-white">{formatPrice(selectedOrder.subtotalAmount || 0)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-neutral-500 flex items-center gap-2">
                        Giảm giá {selectedOrder.promotionCode ? <span className="font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 px-1.5 py-0.5 rounded-md">{selectedOrder.promotionCode}</span> : ''}:
                      </span>
                      <span className="font-semibold text-emerald-600">-{formatPrice(selectedOrder.discountAmount || 0)}</span>
                    </div>
                    <div className="flex justify-between items-center mt-2 pt-3 border-t border-neutral-200 dark:border-neutral-700">
                      <span className="font-bold text-black dark:text-white">Tổng thanh toán:</span>
                      <span className="text-2xl font-black text-black dark:text-white tracking-tight">{formatPrice(selectedOrder.totalAmount)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-white dark:bg-neutral-900 flex justify-between items-center border-t border-neutral-100 dark:border-neutral-800">
                <button 
                  onClick={() => handleDeleteOrder(selectedOrder.id)}
                  className="inline-flex h-12 items-center justify-center bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400 px-6 font-bold rounded-xl hover:opacity-85 transition-opacity text-sm gap-2"
                >
                  <Trash2 size={16} /> Xóa đơn hàng
                </button>
                <button 
                  onClick={async () => {
                    const toastId = toast.loading('Đang tạo hóa đơn...');
                    try {
                      await exportOrderInvoice(selectedOrder);
                      toast.success('Xuất hóa đơn thành công!', { id: toastId });
                    } catch (e) {
                      console.error(e);
                      toast.error('Có lỗi xảy ra khi tạo hóa đơn', { id: toastId });
                    }
                  }}
                  className="inline-flex h-12 items-center justify-center bg-indigo-600 hover:bg-indigo-700 px-6 font-bold rounded-xl transition-colors text-sm gap-2 border-none shadow-sm"
                  style={{ color: '#ffffff', backgroundColor: '#4f46e5' }}
                >
                  <Printer size={16} color="#ffffff" /> <span style={{ color: '#ffffff' }}>In hóa đơn</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
