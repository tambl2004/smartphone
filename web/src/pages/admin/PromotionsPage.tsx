import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Edit2, Trash2, X, Save, LayoutGrid, List } from 'lucide-react';
import toast from 'react-hot-toast';
import { ConfirmationModal } from '@components/admin/ConfirmationModal';
import { promotionService, Promotion } from '@services/promotion.service';
import { getAuth } from '@services/auth.service';
import { Pagination } from '@/components/common/Pagination';

export const ContentPromotionsPage: React.FC = () => {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Promotion | null>(null);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  
  const total = promotions.length;
  const totalPages = Math.ceil(total / limit) || 1;
  const paginatedPromotions = promotions.slice((page - 1) * limit, page * limit);
  
  const [formData, setFormData] = useState<Partial<Promotion>>(() => ({
    code: '',
    discountType: 'fixed',
    discountValue: 0,
    minOrderValue: 0,
    maxDiscountAmount: null,
    startDate: new Date().toISOString().slice(0, 16),
    endDate: new Date(Date.now() + 7*24*60*60*1000).toISOString().slice(0, 16),
    usageLimit: null,
    perUserLimit: 1,
    isActive: true,
  }));

  const fetchPromotions = async () => {
    const auth = getAuth();
    if (!auth?.token) return;
    try {
      const items = await promotionService.getPromotions(auth.token);
      setPromotions(items);
    } catch {
      toast.error('Lỗi tải danh sách khuyến mãi');
    }
  };

  useEffect(() => {
    let active = true;
    const initFetch = async () => {
      const auth = getAuth();
      if (!auth?.token) return;
      try {
        const items = await promotionService.getPromotions(auth.token);
        if (active) setPromotions(items);
      } catch {
        toast.error('Lỗi tải danh sách khuyến mãi');
      }
    };
    void initFetch();
    return () => { active = false; };
  }, []);

  const openAdd = () => {
    setEditingId(null);
    setFormData({
      code: '',
      discountType: 'fixed',
      discountValue: 0,
      minOrderValue: 0,
      maxDiscountAmount: null,
      startDate: new Date().toISOString().slice(0, 16),
      endDate: new Date(Date.now() + 7*24*60*60*1000).toISOString().slice(0, 16),
      usageLimit: null,
      perUserLimit: 1,
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const openEdit = (p: Promotion) => {
    setEditingId(p.id);
    setFormData({
      code: p.code,
      discountType: p.discountType,
      discountValue: p.discountValue,
      minOrderValue: p.minOrderValue,
      maxDiscountAmount: p.maxDiscountAmount,
      startDate: p.startDate ? new Date(p.startDate).toISOString().slice(0, 16) : '',
      endDate: p.endDate ? new Date(p.endDate).toISOString().slice(0, 16) : '',
      usageLimit: p.usageLimit,
      perUserLimit: p.perUserLimit,
      isActive: p.isActive,
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.code?.trim()) { toast.error('Vui lòng nhập mã khuyến mãi'); return; }
    const auth = getAuth();
    if (!auth?.token) return;
    
    try {
      if (editingId) {
        await promotionService.updatePromotion(editingId, formData, auth.token);
        toast.success('Cập nhật khuyến mãi thành công!');
      } else {
        await promotionService.createPromotion(formData, auth.token);
        toast.success('Thêm khuyến mãi thành công!');
      }
      setIsModalOpen(false);
      void fetchPromotions();
    } catch (error: unknown) {
      toast.error((error as Error).message || 'Lỗi lưu khuyến mãi');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const auth = getAuth();
    if (!auth?.token) return;
    try {
      await promotionService.deletePromotion(deleteTarget.id, auth.token);
      toast.success(`Đã xóa mã "${deleteTarget.code}"!`);
      setDeleteTarget(null);
      void fetchPromotions();
    } catch {
      toast.error('Lỗi xóa khuyến mãi');
    }
  };

  return (
    <div className="space-y-6 pb-24">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Khuyến mãi & Voucher</h1>
          <p className="text-sm opacity-40 mt-1">Quản lý mã giảm giá và chương trình ưu đãi</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1 bg-white/[0.02] p-1 rounded-lg border border-white/[0.06]">
            <button onClick={() => setViewMode('grid')} className={`w-8 h-8 rounded-md flex items-center justify-center transition-all border-none outline-none ${viewMode === 'grid' ? 'bg-white/[0.08] text-white shadow-sm' : 'text-white/40 hover:text-white hover:bg-white/[0.04]'}`}>
              <LayoutGrid size={15} />
            </button>
            <button onClick={() => setViewMode('table')} className={`w-8 h-8 rounded-md flex items-center justify-center transition-all border-none outline-none ${viewMode === 'table' ? 'bg-white/[0.08] text-white shadow-sm' : 'text-white/40 hover:text-white hover:bg-white/[0.04]'}`}>
              <List size={15} />
            </button>
          </div>
          <button onClick={openAdd} className="h-9 px-4 flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 border-none rounded-lg text-sm text-white font-medium transition-all outline-none">
            <Plus size={14} /> Thêm mã
          </button>
        </div>
      </div>

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginatedPromotions.map((promo, i) => (
            <motion.div key={promo.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className="p-5 rounded-2xl bg-[#141414] border border-white/[0.06] hover:border-white/[0.12] transition-all relative group">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                    <span className="text-sm font-bold text-purple-500 dark:text-purple-400">%</span>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold tracking-wider">{promo.code} <span className="text-emerald-500 dark:text-emerald-400 ml-1">-{promo.discountType === 'percent' ? promo.discountValue + '%' : promo.discountValue.toLocaleString() + 'đ'}</span></h3>
                    <p className="text-xs opacity-50 mt-1">{promo.usedCount}/{promo.usageLimit || '∞'} đã dùng</p>
                  </div>
                </div>
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${promo.isActive ? 'bg-emerald-500/10 text-emerald-500 dark:text-emerald-400' : 'bg-red-500/10 text-red-500 dark:text-red-400'}`}>
                  {promo.isActive ? 'Hoạt động' : 'Tạm dừng'}
                </span>
              </div>
              <div className="mt-4 flex items-center gap-3">
                <div className="flex-1 h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full" style={{ width: promo.usageLimit ? `${(promo.usedCount / promo.usageLimit) * 100}%` : '0%' }} />
                </div>
                <div className="flex gap-1.5 transition-opacity">
                  <button onClick={() => openEdit(promo)} className="w-7 h-7 rounded flex items-center justify-center opacity-50 hover:opacity-100 hover:bg-white/[0.1] transition-all border-none outline-none"><Edit2 size={12} /></button>
                  <button onClick={() => setDeleteTarget(promo)} className="w-7 h-7 rounded flex items-center justify-center text-red-500 opacity-50 hover:opacity-100 hover:bg-red-500/20 transition-all border-none outline-none"><Trash2 size={12} /></button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="bg-[#141414] border border-white/[0.06] rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                  <th className="p-4 text-xs font-semibold text-white/40 uppercase tracking-wider">Mã KM</th>
                  <th className="p-4 text-xs font-semibold text-white/40 uppercase tracking-wider text-center">Mức giảm</th>
                  <th className="p-4 text-xs font-semibold text-white/40 uppercase tracking-wider">Đã dùng / Giới hạn</th>
                  <th className="p-4 text-xs font-semibold text-white/40 uppercase tracking-wider text-center">Giới hạn 1 người</th>
                  <th className="p-4 text-xs font-semibold text-white/40 uppercase tracking-wider text-center">Trạng thái</th>
                  <th className="p-4 text-xs font-semibold text-white/40 uppercase tracking-wider text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {paginatedPromotions.map((promo) => (
                  <tr key={promo.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                          <span className="text-xs font-bold text-purple-500 dark:text-purple-400">%</span>
                        </div>
                        <p className="text-sm font-bold tracking-wider text-white">{promo.code}</p>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <p className="text-sm font-bold text-emerald-500 dark:text-emerald-400">-{promo.discountType === 'percent' ? promo.discountValue + '%' : promo.discountValue.toLocaleString() + 'đ'}</p>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-1.5 w-32">
                        <div className="flex justify-between text-[10px] text-white/60">
                          <span>{promo.usedCount}</span>
                          <span>{promo.usageLimit || '∞'}</span>
                        </div>
                        <div className="w-full h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                          <div className="h-full bg-indigo-500 rounded-full" style={{ width: promo.usageLimit ? `${(promo.usedCount / promo.usageLimit) * 100}%` : '0%' }} />
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-center text-sm text-white/80">
                      {promo.perUserLimit} lần
                    </td>
                    <td className="p-4 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium ${promo.isActive ? 'bg-emerald-500/10 text-emerald-500 dark:text-emerald-400' : 'bg-red-500/10 text-red-500 dark:text-red-400'}`}>
                        {promo.isActive ? 'Hoạt động' : 'Tạm dừng'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEdit(promo)} className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/[0.04] text-white/60 hover:text-white hover:bg-white/[0.08] transition-all outline-none border-none"><Edit2 size={14} /></button>
                        <button onClick={() => setDeleteTarget(promo)} className="w-8 h-8 rounded-lg flex items-center justify-center text-red-400 bg-red-500/[0.08] hover:bg-red-500/[0.15] transition-all outline-none border-none"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {promotions.length > 0 && (
        <Pagination
          meta={{ page, limit, total, totalPages }}
          onPageChange={setPage}
          onLimitChange={(newLimit) => {
            setLimit(newLimit);
            setPage(1);
          }}
        />
      )}

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={() => setIsModalOpen(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-[#1A1A1A] border border-white/[0.08] rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between p-5 border-b border-white/[0.06] shrink-0">
                <h3 className="text-lg font-semibold">{editingId ? 'Chỉnh sửa mã' : 'Thêm mã khuyến mãi'}</h3>
                <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 rounded-lg flex items-center justify-center opacity-40 hover:opacity-100 hover:bg-white/[0.08] transition-all border-none outline-none"><X size={16} /></button>
              </div>
              
              <div className="p-5 space-y-4 overflow-y-auto custom-scrollbar flex-1">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-xs font-medium opacity-60 mb-1.5">Mã Code (Chữ hoa)</label>
                    <input type="text" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})} placeholder="VD: SUMMER50"
                      className="w-full h-10 px-3 bg-white/[0.04] border border-white/[0.08] rounded-lg text-sm uppercase outline-none focus:border-indigo-500/50 transition-all" />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-xs font-medium opacity-60 mb-1.5">Loại giảm giá</label>
                    <select value={formData.discountType} onChange={e => setFormData({...formData, discountType: e.target.value as 'fixed'|'percent'})}
                      className="w-full h-10 px-3 bg-white/[0.04] border border-white/[0.08] rounded-lg text-sm text-black dark:text-white outline-none focus:border-indigo-500/50 transition-all appearance-none"
                      >
                      <option value="fixed" className="bg-white dark:bg-[#1A1A1A]">Giảm tiền trực tiếp (VNĐ)</option>
                      <option value="percent" className="bg-white dark:bg-[#1A1A1A]">Giảm theo %</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-xs font-medium opacity-60 mb-1.5">Mức giảm ({formData.discountType === 'percent' ? '%' : 'VNĐ'})</label>
                    <input type="number" value={formData.discountValue || ''} onChange={e => setFormData({...formData, discountValue: Number(e.target.value)})}
                      className="w-full h-10 px-3 bg-white/[0.04] border border-white/[0.08] rounded-lg text-sm outline-none focus:border-indigo-500/50 transition-all" />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-xs font-medium opacity-60 mb-1.5">Đơn hàng tối thiểu (VNĐ)</label>
                    <input type="number" value={formData.minOrderValue || ''} onChange={e => setFormData({...formData, minOrderValue: Number(e.target.value)})}
                      className="w-full h-10 px-3 bg-white/[0.04] border border-white/[0.08] rounded-lg text-sm outline-none focus:border-indigo-500/50 transition-all" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-xs font-medium opacity-60 mb-1.5">Tổng lượt sử dụng tối đa (Bỏ trống = ∞)</label>
                    <input type="number" value={formData.usageLimit || ''} onChange={e => setFormData({...formData, usageLimit: e.target.value ? Number(e.target.value) : null})}
                      className="w-full h-10 px-3 bg-white/[0.04] border border-white/[0.08] rounded-lg text-sm outline-none focus:border-indigo-500/50 transition-all" placeholder="∞" />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-xs font-medium opacity-60 mb-1.5">Giới hạn mỗi user (Số lần)</label>
                    <input type="number" value={formData.perUserLimit || ''} onChange={e => setFormData({...formData, perUserLimit: Number(e.target.value)})} min="1"
                      className="w-full h-10 px-3 bg-white/[0.04] border border-white/[0.08] rounded-lg text-sm outline-none focus:border-indigo-500/50 transition-all" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-xs font-medium opacity-60 mb-1.5">Ngày bắt đầu</label>
                    <input type="datetime-local" value={formData.startDate || ''} onChange={e => setFormData({...formData, startDate: e.target.value})}
                      className="w-full h-10 px-3 bg-white/[0.04] border border-white/[0.08] rounded-lg text-sm outline-none focus:border-indigo-500/50 transition-all" />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-xs font-medium opacity-60 mb-1.5">Ngày kết thúc</label>
                    <input type="datetime-local" value={formData.endDate || ''} onChange={e => setFormData({...formData, endDate: e.target.value})}
                      className="w-full h-10 px-3 bg-white/[0.04] border border-white/[0.08] rounded-lg text-sm outline-none focus:border-indigo-500/50 transition-all" />
                  </div>
                </div>
                
                <div>
                  <label className="block text-xs font-medium opacity-60 mb-1.5">Trạng thái</label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.checked})} className="accent-indigo-500 w-4 h-4" />
                    <span className="text-sm">Hoạt động (Cho phép sử dụng)</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-3 p-5 border-t border-white/[0.06] shrink-0">
                <button onClick={() => setIsModalOpen(false)} className="flex-1 h-10 rounded-lg bg-white/[0.06] border border-white/[0.08] text-sm opacity-70 hover:opacity-100 transition-all outline-none">Hủy</button>
                <button onClick={handleSave} className="flex-1 h-10 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-sm text-white font-medium transition-all outline-none border-none flex items-center justify-center gap-2">
                  <Save size={14} /> Lưu
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmationModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Xóa khuyến mãi"
        message={`Bạn có chắc muốn xóa mã "${deleteTarget?.code}"?`}
        confirmText="Xóa"
      />
    </div>
  );
};
