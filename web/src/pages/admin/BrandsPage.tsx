import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Edit2, Trash2, X, Save, Award, LayoutGrid, List } from 'lucide-react';
import toast from 'react-hot-toast';
import { ConfirmationModal } from '@components/admin/ConfirmationModal';

const initialBrands = [
  { id: 1, name: 'Apple', logo: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg', count: 42, status: 'active' },
  { id: 2, name: 'Samsung', logo: 'https://upload.wikimedia.org/wikipedia/commons/2/24/Samsung_Logo.svg', count: 35, status: 'active' },
  { id: 3, name: 'Xiaomi', logo: 'https://upload.wikimedia.org/wikipedia/commons/a/ae/Xiaomi_logo_%282021-%29.svg', count: 28, status: 'active' },
  { id: 4, name: 'Sony', logo: 'https://upload.wikimedia.org/wikipedia/commons/c/c4/Sony_logo.svg', count: 15, status: 'active' },
  { id: 5, name: 'JBL', logo: 'https://upload.wikimedia.org/wikipedia/commons/1/1a/JBL_logo.svg', count: 12, status: 'active' },
];

export const ContentBrandsPage: React.FC = () => {
  const [brands, setBrands] = useState(initialBrands);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; name: string; [key: string]: unknown } | null>(null);
  
  const [formData, setFormData] = useState({ name: '', logo: '', status: 'active' });

  const openAdd = () => {
    setEditingId(null);
    setFormData({ name: '', logo: '', status: 'active' });
    setIsModalOpen(true);
  };

  const openEdit = (b: { id: number; name: string; logo: string; status: string; count: number; [key: string]: unknown }) => {
    setEditingId(b.id);
    setFormData({ name: b.name, logo: b.logo, status: b.status });
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!formData.name.trim()) { toast.error('Vui lòng nhập tên thương hiệu'); return; }
    if (!formData.logo.trim()) { toast.error('Vui lòng nhập link logo'); return; }
    
    if (editingId) {
      setBrands(prev => prev.map(b => b.id === editingId ? { ...b, ...formData } : b));
      toast.success('Cập nhật thương hiệu thành công!');
    } else {
      setBrands(prev => [...prev, { id: Date.now(), ...formData, count: 0 }]);
      toast.success('Thêm thương hiệu thành công!');
    }
    setIsModalOpen(false);
  };

  const handleDelete = () => {
    setBrands(prev => prev.filter(b => b.id !== deleteTarget.id));
    toast.success(`Đã xóa thương hiệu "${deleteTarget.name}"!`);
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Thương hiệu</h1>
          <p className="text-sm opacity-40 mt-1">Quản lý các thương hiệu sản phẩm đối tác</p>
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
            <Plus size={14} /> Thêm thương hiệu
          </button>
        </div>
      </div>

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {brands.map((brand, i) => (
            <motion.div key={brand.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}
              className="p-5 rounded-2xl bg-[#141414] border border-white/[0.06] hover:border-white/[0.12] transition-all flex flex-col items-center justify-center text-center group relative h-32">
              <div className="h-10 flex items-center justify-center w-full mb-3 px-4">
                {brand.logo ? (
                  <img src={brand.logo} alt={brand.name} className="max-h-full max-w-full object-contain filter invert opacity-80" />
                ) : (
                  <Award size={24} className="opacity-50" />
                )}
              </div>
              <h3 className="text-sm font-semibold">{brand.name}</h3>
              <p className="text-[10px] opacity-40 mt-0.5">{brand.count} sản phẩm</p>
              
              <div className="absolute top-2 right-2 flex gap-1.5 transition-opacity">
                <button onClick={() => openEdit(brand)} className="w-7 h-7 rounded-lg bg-black/50 backdrop-blur-md flex items-center justify-center text-white/70 hover:text-white hover:bg-black/70 transition-all border-none outline-none"><Edit2 size={12} /></button>
                <button onClick={() => setDeleteTarget(brand)} className="w-7 h-7 rounded-lg bg-red-500/80 backdrop-blur-md flex items-center justify-center text-white hover:bg-red-600 transition-all border-none outline-none"><Trash2 size={12} /></button>
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
                  <th className="p-4 text-xs font-semibold text-white/40 uppercase tracking-wider">Thương hiệu</th>
                  <th className="p-4 text-xs font-semibold text-white/40 uppercase tracking-wider text-center">Sản phẩm</th>
                  <th className="p-4 text-xs font-semibold text-white/40 uppercase tracking-wider text-center">Trạng thái</th>
                  <th className="p-4 text-xs font-semibold text-white/40 uppercase tracking-wider text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {brands.map((brand) => (
                  <tr key={brand.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/[0.04] p-2 flex items-center justify-center">
                          {brand.logo ? (
                            <img src={brand.logo} alt={brand.name} className="max-h-full max-w-full object-contain filter invert opacity-80" />
                          ) : (
                            <Award size={16} className="opacity-50" />
                          )}
                        </div>
                        <p className="text-sm font-medium text-white">{brand.name}</p>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <p className="text-sm text-white/80">{brand.count}</p>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium ${brand.status === 'active' ? 'bg-emerald-500/20 text-emerald-500 dark:text-emerald-400' : 'bg-white/10 text-white/60'}`}>
                        {brand.status === 'active' ? 'Hoạt động' : 'Tạm ẩn'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEdit(brand)} className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/[0.04] text-white/60 hover:text-white hover:bg-white/[0.08] transition-all outline-none border-none"><Edit2 size={14} /></button>
                        <button onClick={() => setDeleteTarget(brand)} className="w-8 h-8 rounded-lg flex items-center justify-center text-red-400 bg-red-500/[0.08] hover:bg-red-500/[0.15] transition-all outline-none border-none"><Trash2 size={14} /></button>
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
                <h3 className="text-lg font-semibold">{editingId ? 'Chỉnh sửa thương hiệu' : 'Thêm thương hiệu'}</h3>
                <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 rounded-lg flex items-center justify-center opacity-40 hover:opacity-100 hover:bg-white/[0.08] transition-all border-none outline-none"><X size={16} /></button>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <label className="block text-xs font-medium opacity-40 mb-1.5">Tên thương hiệu</label>
                  <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="VD: Apple"
                    className="w-full h-10 px-3 bg-white/[0.04] border border-white/[0.08] rounded-lg text-sm outline-none focus:border-indigo-500/50 transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-medium opacity-40 mb-1.5">URL Logo</label>
                  <input type="text" value={formData.logo} onChange={e => setFormData({...formData, logo: e.target.value})} placeholder="https://..."
                    className="w-full h-10 px-3 bg-white/[0.04] border border-white/[0.08] rounded-lg text-sm outline-none focus:border-indigo-500/50 transition-all" />
                  {formData.logo && (
                    <div className="mt-3 p-3 bg-white/[0.02] border border-white/[0.04] rounded-lg flex justify-center h-16">
                      <img src={formData.logo} alt="Preview" className="max-h-full max-w-full object-contain filter invert opacity-80" />
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-medium opacity-40 mb-1.5">Trạng thái</label>
                  <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}
                    className="w-full h-10 px-3 bg-white/[0.04] border border-white/[0.08] rounded-lg text-sm outline-none focus:border-indigo-500/50 transition-all">
                    <option value="active">Hoạt động</option>
                    <option value="inactive">Tạm ẩn</option>
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
        title="Xóa thương hiệu"
        message={`Bạn có chắc muốn xóa thương hiệu "${deleteTarget?.name}"?`}
        confirmText="Xóa"
      />
    </div>
  );
};
