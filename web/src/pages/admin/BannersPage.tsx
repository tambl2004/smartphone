import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Edit2, Trash2, X, Save, LayoutGrid, List } from 'lucide-react';
import toast from 'react-hot-toast';
import { ConfirmationModal } from '@components/admin/ConfirmationModal';
import { Pagination } from '@/components/common/Pagination';

const initialBanners = [
  { id: 1, title: 'iPhone 15 Pro Max - Khám phá titan', image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400', status: 'active', position: 'Hero Banner', createdAt: '2024-12-01' },
  { id: 2, title: 'Galaxy S24 Ultra - AI Phone', image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400', status: 'active', position: 'Sub Banner', createdAt: '2024-12-05' },
  { id: 3, title: 'Khuyến mãi cuối năm', image: 'https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=400', status: 'draft', position: 'Popup', createdAt: '2024-12-15' },
];

export const ContentBannersPage: React.FC = () => {
  const [banners, setBanners] = useState(initialBanners);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; title: string; [key: string]: unknown } | null>(null);
  
  const [formData, setFormData] = useState({ title: '', image: '', position: 'Hero Banner', status: 'active' });

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  
  const total = banners.length;
  const totalPages = Math.ceil(total / limit) || 1;
  const paginatedBanners = banners.slice((page - 1) * limit, page * limit);

  const openAdd = () => {
    setEditingId(null);
    setFormData({ title: '', image: '', position: 'Hero Banner', status: 'active' });
    setIsModalOpen(true);
  };

  const openEdit = (b: {id: number; title: string; image: string; position: string; status: string; [key: string]: unknown}) => {
    setEditingId(b.id);
    setFormData({ title: b.title, image: b.image, position: b.position, status: b.status });
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!formData.title.trim()) { toast.error('Vui lòng nhập tiêu đề'); return; }
    
    if (editingId) {
      setBanners(prev => prev.map(b => b.id === editingId ? { ...b, ...formData } : b));
      toast.success('Cập nhật banner thành công!');
    } else {
      setBanners(prev => [{ id: Date.now(), ...formData, createdAt: new Date().toISOString() }, ...prev]);
      toast.success('Thêm banner thành công!');
    }
    setIsModalOpen(false);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    setBanners(prev => prev.filter(b => b.id !== deleteTarget.id));
    toast.success(`Đã xóa banner "${deleteTarget.title}"!`);
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Quản lý Banner</h1>
          <p className="text-sm opacity-40 mt-1">Danh sách banner trang chủ và quảng cáo</p>
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
            <Plus size={14} /> Thêm banner
          </button>
        </div>
      </div>

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginatedBanners.map((banner, i) => (
            <motion.div key={banner.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className="rounded-xl overflow-hidden border border-white/[0.06] group relative">
              <div className="relative aspect-video">
                <img src={banner.image} alt={banner.title} className="w-full h-full object-cover bg-white/[0.02]" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <p className="text-sm font-semibold text-white force-white truncate">{banner.title}</p>
                  <p className="text-xs text-white/80 force-white mt-0.5">{banner.position}</p>
                </div>
                <div className="absolute top-2 right-2 flex gap-1.5 transition-opacity">
                  <button onClick={() => openEdit(banner)} className="w-8 h-8 rounded-lg bg-black/50 backdrop-blur-md flex items-center justify-center text-white opacity-70 hover:opacity-100 force-white transition-all border-none outline-none"><Edit2 size={14} /></button>
                  <button onClick={() => setDeleteTarget(banner)} className="w-8 h-8 rounded-lg bg-red-500/80 backdrop-blur-md flex items-center justify-center text-white force-white hover:bg-red-600 transition-all border-none outline-none"><Trash2 size={14} /></button>
                </div>
                <span className={`absolute top-3 left-3 px-2 py-0.5 rounded-full text-[10px] font-medium ${banner.status === 'active' ? 'bg-emerald-500/20 text-emerald-500 dark:text-emerald-400' : 'bg-black/50 text-white/70'}`}>
                  {banner.status === 'active' ? 'Hiển thị' : 'Nháp'}
                </span>
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
                  <th className="p-4 text-xs font-semibold text-white/40 uppercase tracking-wider whitespace-nowrap">Banner</th>
                  <th className="p-4 text-xs font-semibold text-white/40 uppercase tracking-wider whitespace-nowrap">Vị trí</th>
                  <th className="p-4 text-xs font-semibold text-white/40 uppercase tracking-wider text-center whitespace-nowrap">Trạng thái</th>
                  <th className="p-4 text-xs font-semibold text-white/40 uppercase tracking-wider text-right whitespace-nowrap">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {paginatedBanners.map((banner) => (
                  <tr key={banner.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="p-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-20 h-12 rounded overflow-hidden flex-shrink-0">
                          <img src={banner.image} alt={banner.title} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white whitespace-nowrap">{banner.title}</p>
                          <p className="text-xs text-white/40 mt-0.5 whitespace-nowrap">Tạo: {new Date(banner.createdAt).toLocaleDateString('vi-VN')}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <p className="text-sm text-white/80">{banner.position}</p>
                    </td>
                    <td className="p-4 text-center whitespace-nowrap">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium ${banner.status === 'active' ? 'bg-emerald-500/20 text-emerald-500 dark:text-emerald-400' : 'bg-black/50 text-white/70'}`}>
                        {banner.status === 'active' ? 'Hiển thị' : 'Nháp'}
                      </span>
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEdit(banner)} className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/[0.04] text-white/60 hover:text-white hover:bg-white/[0.08] transition-all outline-none border-none"><Edit2 size={14} /></button>
                        <button onClick={() => setDeleteTarget(banner)} className="w-8 h-8 rounded-lg flex items-center justify-center text-red-400 bg-red-500/[0.08] hover:bg-red-500/[0.15] transition-all outline-none border-none"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Pagination
        meta={{ page, limit, total, totalPages }}
        onPageChange={setPage}
        onLimitChange={(newLimit) => {
          setLimit(newLimit);
          setPage(1);
        }}
      />

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={() => setIsModalOpen(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-[#1A1A1A] border border-white/[0.08] rounded-2xl w-full max-w-md max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between p-5 border-b border-white/[0.06] sticky top-0 z-10">
                <h3 className="text-lg font-semibold">{editingId ? 'Chỉnh sửa banner' : 'Thêm banner mới'}</h3>
                <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 rounded-lg flex items-center justify-center opacity-40 hover:opacity-100 hover:bg-white/[0.08] transition-all border-none outline-none"><X size={16} /></button>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <label className="block text-xs font-medium opacity-40 mb-1.5">Tiêu đề</label>
                  <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
                    className="w-full h-10 px-3 bg-white/[0.04] border border-white/[0.08] rounded-lg text-sm outline-none focus:border-indigo-500/50 transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-medium opacity-40 mb-1.5">URL Ảnh</label>
                  <input type="text" value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})}
                    className="w-full h-10 px-3 bg-white/[0.04] border border-white/[0.08] rounded-lg text-sm outline-none focus:border-indigo-500/50 transition-all" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium opacity-40 mb-1.5">Vị trí</label>
                    <select value={formData.position} onChange={e => setFormData({...formData, position: e.target.value})}
                      className="w-full h-10 px-3 bg-white/[0.04] border border-white/[0.08] rounded-lg text-sm text-black dark:text-white outline-none focus:border-indigo-500/50 transition-all appearance-none"
                      >
                      <option value="Hero Banner" className="bg-white dark:bg-[#1A1A1A]">Hero Banner</option>
                      <option value="Sub Banner" className="bg-white dark:bg-[#1A1A1A]">Sub Banner</option>
                      <option value="Popup" className="bg-white dark:bg-[#1A1A1A]">Popup</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium opacity-40 mb-1.5">Trạng thái</label>
                    <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}
                      className="w-full h-10 px-3 bg-white/[0.04] border border-white/[0.08] rounded-lg text-sm text-black dark:text-white outline-none focus:border-indigo-500/50 transition-all appearance-none"
                      >
                      <option value="active" className="bg-white dark:bg-[#1A1A1A]">Hiển thị</option>
                      <option value="draft" className="bg-white dark:bg-[#1A1A1A]">Nháp</option>
                    </select>
                  </div>
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
        title="Xóa banner"
        message={`Bạn có chắc muốn xóa banner "${deleteTarget?.title}"?`}
        confirmText="Xóa"
      />
    </div>
  );
};
