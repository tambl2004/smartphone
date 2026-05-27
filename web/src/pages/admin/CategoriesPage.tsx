import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Edit2, Trash2, X, Save, Smartphone, Laptop, Headphones, Watch, LayoutGrid, List } from 'lucide-react';
import toast from 'react-hot-toast';
import { ConfirmationModal } from '@components/admin/ConfirmationModal';

const initialCategories = [
  { id: 1, name: 'Điện thoại', count: 28, icon: 'Smartphone' },
  { id: 2, name: 'Máy tính bảng', count: 12, icon: 'Laptop' },
  { id: 3, name: 'Phụ kiện', count: 45, icon: 'Headphones' },
  { id: 4, name: 'Đồng hồ thông minh', count: 18, icon: 'Watch' },
];

export const ContentCategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState(initialCategories);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; name: string; [key: string]: unknown } | null>(null);
  
  const [formData, setFormData] = useState({ name: '', icon: 'Smartphone' });

  const getIcon = (name: string) => {
    switch (name) {
      case 'Laptop': return <Laptop size={16} />;
      case 'Headphones': return <Headphones size={16} />;
      case 'Watch': return <Watch size={16} />;
      default: return <Smartphone size={16} />;
    }
  };

  const openAdd = () => {
    setEditingId(null);
    setFormData({ name: '', icon: 'Smartphone' });
    setIsModalOpen(true);
  };

  const openEdit = (c: { id: number; name: string; icon: string; count: number; [key: string]: unknown }) => {
    setEditingId(c.id);
    setFormData({ name: c.name, icon: c.icon });
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!formData.name.trim()) { toast.error('Vui lòng nhập tên danh mục'); return; }
    
    if (editingId) {
      setCategories(prev => prev.map(c => c.id === editingId ? { ...c, ...formData } : c));
      toast.success('Cập nhật danh mục thành công!');
    } else {
      setCategories(prev => [...prev, { id: Date.now(), ...formData, count: 0 }]);
      toast.success('Thêm danh mục thành công!');
    }
    setIsModalOpen(false);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    setCategories(prev => prev.filter(c => c.id !== deleteTarget.id));
    toast.success(`Đã xóa danh mục "${deleteTarget.name}"!`);
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Danh mục sản phẩm</h1>
          <p className="text-sm opacity-40 mt-1">Quản lý các danh mục chính của cửa hàng</p>
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
            <Plus size={14} /> Thêm danh mục
          </button>
        </div>
      </div>

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.map((cat, i) => (
            <motion.div key={cat.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className="p-4 rounded-2xl bg-[#141414] border border-white/[0.06] hover:border-white/[0.12] transition-all flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 dark:text-indigo-400">
                  {getIcon(cat.icon)}
                </div>
                <div>
                  <h3 className="text-sm font-semibold">{cat.name}</h3>
                  <p className="text-xs opacity-50 mt-0.5">{cat.count} sản phẩm</p>
                </div>
              </div>
              
              <div className="flex flex-col gap-1 transition-opacity">
                <button onClick={() => openEdit(cat)} className="w-6 h-6 rounded flex items-center justify-center opacity-50 hover:opacity-100 hover:bg-white/[0.1] transition-all border-none outline-none"><Edit2 size={12} /></button>
                <button onClick={() => setDeleteTarget(cat)} className="w-6 h-6 rounded flex items-center justify-center text-red-500 opacity-50 hover:opacity-100 hover:bg-red-500/20 transition-all border-none outline-none"><Trash2 size={12} /></button>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="bg-[#141414] border border-white/[0.06] rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                  <th className="p-4 text-xs font-semibold text-white/40 uppercase tracking-wider">Danh mục</th>
                  <th className="p-4 text-xs font-semibold text-white/40 uppercase tracking-wider text-center">Sản phẩm</th>
                  <th className="p-4 text-xs font-semibold text-white/40 uppercase tracking-wider text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 dark:text-indigo-400">
                          {getIcon(cat.icon)}
                        </div>
                        <p className="text-sm font-medium text-white">{cat.name}</p>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <p className="text-sm text-white/80">{cat.count}</p>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEdit(cat)} className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/[0.04] text-white/60 hover:text-white hover:bg-white/[0.08] transition-all outline-none border-none"><Edit2 size={14} /></button>
                        <button onClick={() => setDeleteTarget(cat)} className="w-8 h-8 rounded-lg flex items-center justify-center text-red-400 bg-red-500/[0.08] hover:bg-red-500/[0.15] transition-all outline-none border-none"><Trash2 size={14} /></button>
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
              className="bg-[#1A1A1A] border border-white/[0.08] rounded-2xl w-full max-w-sm max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between p-5 border-b border-white/[0.06] sticky top-0 z-10">
                <h3 className="text-lg font-semibold">{editingId ? 'Chỉnh sửa danh mục' : 'Thêm danh mục'}</h3>
                <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 rounded-lg flex items-center justify-center opacity-40 hover:opacity-100 hover:bg-white/[0.08] transition-all border-none outline-none"><X size={16} /></button>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <label className="block text-xs font-medium opacity-40 mb-1.5">Tên danh mục</label>
                  <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="VD: Laptop"
                    className="w-full h-10 px-3 bg-white/[0.04] border border-white/[0.08] rounded-lg text-sm outline-none focus:border-indigo-500/50 transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-medium opacity-40 mb-1.5">Biểu tượng</label>
                  <select value={formData.icon} onChange={e => setFormData({...formData, icon: e.target.value})}
                    className="w-full h-10 px-3 bg-white/[0.04] border border-white/[0.08] rounded-lg text-sm outline-none focus:border-indigo-500/50 transition-all">
                    <option value="Smartphone">Điện thoại (Smartphone)</option>
                    <option value="Laptop">Máy tính (Laptop)</option>
                    <option value="Headphones">Phụ kiện (Headphones)</option>
                    <option value="Watch">Đồng hồ (Watch)</option>
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
        title="Xóa danh mục"
        message={`Bạn có chắc muốn xóa danh mục "${deleteTarget?.name}"? Các sản phẩm trong danh mục này sẽ không bị xóa.`}
        confirmText="Xóa"
      />
    </div>
  );
};
