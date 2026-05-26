import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Edit2, Trash2, X, Save, LayoutGrid, List } from 'lucide-react';
import toast from 'react-hot-toast';
import { ConfirmationModal } from '@components/admin/ConfirmationModal';

const initialPromotions = [
  { id: 1, code: 'NEWYEAR2025', discount: '15%', usage: 45, maxUsage: 100, expiry: '2025-01-15', status: 'active' },
  { id: 2, code: 'WELCOME10', discount: '10%', usage: 128, maxUsage: 500, expiry: '2025-12-31', status: 'active' },
  { id: 3, code: 'FLASH50', discount: '50%', usage: 20, maxUsage: 20, expiry: '2024-12-16', status: 'expired' },
];

export const ContentPromotionsPage: React.FC = () => {
  const [promotions, setPromotions] = useState(initialPromotions);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; code: string; [key: string]: unknown } | null>(null);
  
  const [formData, setFormData] = useState({ code: '', discount: '', maxUsage: 100, expiry: '', status: 'active' });

  const openAdd = () => {
    setEditingId(null);
    setFormData({ code: '', discount: '', maxUsage: 100, expiry: '', status: 'active' });
    setIsModalOpen(true);
  };

  const openEdit = (p: { id: number; code: string; discount: string; maxUsage: number; expiry: string; status: string }) => {
    setEditingId(p.id);
    setFormData({ code: p.code, discount: p.discount, maxUsage: p.maxUsage, expiry: p.expiry, status: p.status });
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!formData.code.trim()) { toast.error('Vui lòng nhập mã khuyến mãi'); return; }
    
    if (editingId) {
      setPromotions(prev => prev.map(p => p.id === editingId ? { ...p, ...formData } : p));
      toast.success('Cập nhật khuyến mãi thành công!');
    } else {
      setPromotions(prev => [{ id: Date.now(), ...formData, usage: 0 }, ...prev]);
      toast.success('Thêm khuyến mãi thành công!');
    }
    setIsModalOpen(false);
  };

  const handleDelete = () => {
    setPromotions(prev => prev.filter(p => p.id !== deleteTarget.id));
    toast.success(`Đã xóa mã "${deleteTarget.code}"!`);
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-6">
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
          {promotions.map((promo, i) => (
            <motion.div key={promo.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className="p-5 rounded-2xl bg-[#141414] border border-white/[0.06] hover:border-white/[0.12] transition-all relative group">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                    <span className="text-sm font-bold text-purple-500 dark:text-purple-400">%</span>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold tracking-wider">{promo.code} <span className="text-emerald-500 dark:text-emerald-400 ml-1">-{promo.discount}</span></h3>
                    <p className="text-xs opacity-50 mt-1">{promo.usage}/{promo.maxUsage} đã dùng • ⏳ {promo.expiry}</p>
                  </div>
                </div>
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${promo.status === 'active' ? 'bg-emerald-500/10 text-emerald-500 dark:text-emerald-400' : 'bg-red-500/10 text-red-500 dark:text-red-400'}`}>
                  {promo.status === 'active' ? 'Hoạt động' : 'Hết hạn'}
                </span>
              </div>
              <div className="mt-4 flex items-center gap-3">
                <div className="flex-1 h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${(promo.usage / promo.maxUsage) * 100}%` }} />
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
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                  <th className="p-4 text-xs font-semibold text-white/40 uppercase tracking-wider">Mã KM</th>
                  <th className="p-4 text-xs font-semibold text-white/40 uppercase tracking-wider text-center">Giảm</th>
                  <th className="p-4 text-xs font-semibold text-white/40 uppercase tracking-wider">Đã dùng</th>
                  <th className="p-4 text-xs font-semibold text-white/40 uppercase tracking-wider text-center">Hạn dùng</th>
                  <th className="p-4 text-xs font-semibold text-white/40 uppercase tracking-wider text-center">Trạng thái</th>
                  <th className="p-4 text-xs font-semibold text-white/40 uppercase tracking-wider text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {promotions.map((promo) => (
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
                      <p className="text-sm font-bold text-emerald-500 dark:text-emerald-400">-{promo.discount}</p>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-1.5 w-32">
                        <div className="flex justify-between text-[10px] text-white/60">
                          <span>{promo.usage}</span>
                          <span>{promo.maxUsage}</span>
                        </div>
                        <div className="w-full h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                          <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${(promo.usage / promo.maxUsage) * 100}%` }} />
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-center text-sm text-white/80">
                      {promo.expiry}
                    </td>
                    <td className="p-4 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium ${promo.status === 'active' ? 'bg-emerald-500/10 text-emerald-500 dark:text-emerald-400' : 'bg-red-500/10 text-red-500 dark:text-red-400'}`}>
                        {promo.status === 'active' ? 'Hoạt động' : 'Hết hạn'}
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

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={() => setIsModalOpen(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-[#1A1A1A] border border-white/[0.08] rounded-2xl w-full max-w-md max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between p-5 border-b border-white/[0.06] sticky top-0 z-10">
                <h3 className="text-lg font-semibold">{editingId ? 'Chỉnh sửa mã' : 'Thêm mã khuyến mãi'}</h3>
                <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 rounded-lg flex items-center justify-center opacity-40 hover:opacity-100 hover:bg-white/[0.08] transition-all border-none outline-none"><X size={16} /></button>
              </div>
              <div className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium opacity-40 mb-1.5">Mã Code</label>
                    <input type="text" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})} placeholder="VD: SUMMER50"
                      className="w-full h-10 px-3 bg-white/[0.04] border border-white/[0.08] rounded-lg text-sm uppercase outline-none focus:border-indigo-500/50 transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium opacity-40 mb-1.5">Mức giảm</label>
                    <input type="text" value={formData.discount} onChange={e => setFormData({...formData, discount: e.target.value})} placeholder="VD: 15% hoặc 50k"
                      className="w-full h-10 px-3 bg-white/[0.04] border border-white/[0.08] rounded-lg text-sm outline-none focus:border-indigo-500/50 transition-all" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium opacity-40 mb-1.5">Lượt dùng tối đa</label>
                    <input type="number" value={formData.maxUsage} onChange={e => setFormData({...formData, maxUsage: Number(e.target.value)})}
                      className="w-full h-10 px-3 bg-white/[0.04] border border-white/[0.08] rounded-lg text-sm outline-none focus:border-indigo-500/50 transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium opacity-40 mb-1.5">Ngày hết hạn</label>
                    <input type="date" value={formData.expiry} onChange={e => setFormData({...formData, expiry: e.target.value})}
                      className="w-full h-10 px-3 bg-white/[0.04] border border-white/[0.08] rounded-lg text-sm outline-none focus:border-indigo-500/50 transition-all" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium opacity-40 mb-1.5">Trạng thái</label>
                  <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}
                    className="w-full h-10 px-3 bg-white/[0.04] border border-white/[0.08] rounded-lg text-sm outline-none focus:border-indigo-500/50 transition-all">
                    <option value="active">Hoạt động</option>
                    <option value="expired">Hết hạn</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 px-5 pb-5">
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
