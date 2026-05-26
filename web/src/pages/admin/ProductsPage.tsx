import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Plus, Filter, Download, Upload, Edit2, Trash2, Eye, Star, Package, X, Save, FileSpreadsheet, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { ChartCard } from '@components/admin/ChartCard';
import { StatusBadge } from '@components/admin/StatusBadge';
import { ConfirmationModal } from '@components/admin/ConfirmationModal';
import { adminProducts, formatCurrency } from '@data/adminData';
import type { AdminProduct } from '@data/adminData';

type ModalType = 'add' | 'edit' | 'view' | 'import' | 'export' | null;

const ModalWrapper: React.FC<{ children: React.ReactNode; maxW?: string; onClose: () => void }> = ({ children, maxW = 'max-w-lg', onClose }) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={onClose}>
    <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
      className={`bg-[#1A1A1A] border border-white/[0.08] rounded-2xl w-full ${maxW} max-h-[85vh] overflow-y-auto`} onClick={e => e.stopPropagation()}>
      {children}
    </motion.div>
  </motion.div>
);

const ModalHeader: React.FC<{ title: string; onClose: () => void }> = ({ title, onClose }) => (
  <div className="flex items-center justify-between p-5 border-b border-white/[0.06] sticky top-0 bg-[#1A1A1A] z-10">
    <h3 className="text-lg font-semibold text-white">{title}</h3>
    <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-white/[0.08] transition-all border-none outline-none"><X size={16} /></button>
  </div>
);

const InputField: React.FC<{ label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string }> = ({ label, value, onChange, type = 'text', placeholder }) => (
  <div>
    <label className="block text-xs font-medium text-white/40 mb-1.5">{label}</label>
    <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      className="w-full h-10 px-3 bg-white/[0.04] border border-white/[0.08] rounded-lg text-sm text-white placeholder:text-white/20 outline-none focus:border-indigo-500/50 transition-all" />
  </div>
);

export const ProductsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [modalType, setModalType] = useState<ModalType>(null);
  const [currentProduct, setCurrentProduct] = useState<AdminProduct | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminProduct | null>(null);

  // Form state for add/edit
  const [formData, setFormData] = useState({ name: '', price: '', originalPrice: '', category: 'Điện thoại', brand: '', stock: '', status: 'active' as string });

  const categories = ['all', 'Điện thoại', 'Máy tính bảng', 'Phụ kiện'];

  const filteredProducts = adminProducts.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCategory = filterCategory === 'all' || p.category === filterCategory;
    return matchSearch && matchCategory;
  });

  const toggleSelect = (id: string) => {
    setSelectedProducts(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);
  };

  const openAdd = () => {
    setFormData({ name: '', price: '', originalPrice: '', category: 'Điện thoại', brand: '', stock: '', status: 'active' });
    setModalType('add');
  };
  const openEdit = (p: AdminProduct) => {
    setCurrentProduct(p);
    setFormData({ name: p.name, price: String(p.price), originalPrice: String(p.originalPrice), category: p.category, brand: p.brand, stock: String(p.stock), status: p.status });
    setModalType('edit');
  };
  const openView = (p: AdminProduct) => { setCurrentProduct(p); setModalType('view'); };

  const handleSave = () => {
    if (!formData.name.trim()) { toast.error('Vui lòng nhập tên sản phẩm'); return; }
    if (modalType === 'add') toast.success('Thêm sản phẩm thành công!');
    else toast.success('Cập nhật sản phẩm thành công!');
    setModalType(null);
    setCurrentProduct(null);
  };

  const handleDelete = () => {
    toast.success(`Đã xóa sản phẩm "${deleteTarget?.name}"!`);
    setDeleteTarget(null);
  };

  const handleImport = () => {
    toast.success('Import dữ liệu thành công! 12 sản phẩm đã được cập nhật.');
    setModalType(null);
  };

  const handleExport = () => {
    toast.success('Export dữ liệu thành công! File đã được tải xuống.');
    setModalType(null);
  };

  // Shared components moved outside

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Quản lý sản phẩm</h1>
          <p className="text-sm opacity-40 mt-1">{adminProducts.length} sản phẩm</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setModalType('import')} className="h-9 px-3 flex items-center gap-2 bg-white/[0.04] border border-white/[0.08] rounded-lg text-sm opacity-60 hover:opacity-100 hover:bg-white/[0.08] transition-all outline-none">
            <Upload size={14} /> Import
          </button>
          <button onClick={() => setModalType('export')} className="h-9 px-3 flex items-center gap-2 bg-white/[0.04] border border-white/[0.08] rounded-lg text-sm opacity-60 hover:opacity-100 hover:bg-white/[0.08] transition-all outline-none">
            <Download size={14} /> Export
          </button>
          <button onClick={openAdd} className="h-9 px-4 flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 border-none rounded-lg text-sm text-white font-medium transition-all outline-none">
            <Plus size={14} /> Thêm sản phẩm
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-30" />
          <input type="text" placeholder="Tìm kiếm sản phẩm..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-10 pr-4 bg-white/[0.04] border border-white/[0.08] rounded-lg text-sm placeholder:opacity-30 outline-none focus:border-indigo-500/50 transition-all" />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={14} className="opacity-30" />
          {categories.map(cat => (
            <button key={cat} onClick={() => setFilterCategory(cat)}
              className={`h-8 px-3 rounded-full text-xs font-medium transition-all border-none outline-none ${filterCategory === cat ? 'bg-indigo-600 text-white' : 'bg-white/[0.04] opacity-50 hover:opacity-100 hover:bg-white/[0.08]'}`}>
              {cat === 'all' ? 'Tất cả' : cat}
            </button>
          ))}
        </div>
      </div>

      <ChartCard title={`Hiển thị ${filteredProducts.length} sản phẩm`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="text-left pb-3 pr-3 w-10"><input type="checkbox" className="w-4 h-4 rounded accent-indigo-600" onChange={() => {}} /></th>
                <th className="text-left text-xs font-medium opacity-30 pb-3 pr-4">Sản phẩm</th>
                <th className="text-left text-xs font-medium opacity-30 pb-3 pr-4">Giá bán</th>
                <th className="text-left text-xs font-medium opacity-30 pb-3 pr-4">Kho</th>
                <th className="text-left text-xs font-medium opacity-30 pb-3 pr-4">Đã bán</th>
                <th className="text-left text-xs font-medium opacity-30 pb-3 pr-4">Đánh giá</th>
                <th className="text-left text-xs font-medium opacity-30 pb-3 pr-4">Trạng thái</th>
                <th className="text-left text-xs font-medium opacity-30 pb-3">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product, index) => (
                <motion.tr key={product.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: index * 0.03 }}
                  className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors group">
                  <td className="py-3 pr-3"><input type="checkbox" checked={selectedProducts.includes(product.id)} onChange={() => toggleSelect(product.id)} className="w-4 h-4 rounded accent-indigo-600" /></td>
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-3">
                      <img src={product.image} alt={product.name} className="w-10 h-10 rounded-lg object-cover" />
                      <div><p className="text-sm font-medium opacity-80">{product.name}</p><p className="text-xs opacity-30">{product.brand}</p></div>
                    </div>
                  </td>
                  <td className="py-3 pr-4">
                    <p className="text-sm font-medium opacity-80">{formatCurrency(product.price)}</p>
                    <p className="text-xs opacity-30 line-through">{formatCurrency(product.originalPrice)}</p>
                  </td>
                  <td className="py-3 pr-4"><span className={`text-sm font-medium ${product.stock <= 10 ? 'text-red-400' : 'opacity-70'}`}>{product.stock}</span></td>
                  <td className="py-3 pr-4"><span className="text-sm opacity-50">{product.sold}</span></td>
                  <td className="py-3 pr-4"><div className="flex items-center gap-1"><Star size={12} className="text-amber-400 fill-amber-400" /><span className="text-sm opacity-60">{product.rating}</span></div></td>
                  <td className="py-3 pr-4"><StatusBadge status={product.status} /></td>
                  <td className="py-3">
                    <div className="flex items-center gap-1 transition-opacity">
                      <button onClick={() => openView(product)} className="w-7 h-7 rounded-md flex items-center justify-center opacity-40 hover:opacity-100 hover:bg-white/[0.08] transition-all border-none outline-none"><Eye size={14} /></button>
                      <button onClick={() => openEdit(product)} className="w-7 h-7 rounded-md flex items-center justify-center opacity-40 hover:text-indigo-400 hover:bg-indigo-500/[0.08] transition-all border-none outline-none"><Edit2 size={14} /></button>
                      <button onClick={() => setDeleteTarget(product)} className="w-7 h-7 rounded-md flex items-center justify-center opacity-40 hover:text-red-400 hover:bg-red-500/[0.08] transition-all border-none outline-none"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredProducts.length === 0 && (
          <div className="py-12 text-center"><Package size={40} className="opacity-10 mx-auto mb-3" /><p className="text-sm opacity-30">Không tìm thấy sản phẩm nào</p></div>
        )}
      </ChartCard>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {(modalType === 'add' || modalType === 'edit') && (
          <ModalWrapper onClose={() => setModalType(null)}>
            <ModalHeader title={modalType === 'add' ? 'Thêm sản phẩm mới' : 'Chỉnh sửa sản phẩm'} onClose={() => setModalType(null)} />
            <div className="p-5 space-y-4">
              <InputField label="Tên sản phẩm" value={formData.name} onChange={v => setFormData({...formData, name: v})} placeholder="VD: iPhone 16 Pro Max 256GB" />
              <div className="grid grid-cols-2 gap-3">
                <InputField label="Giá bán (₫)" value={formData.price} onChange={v => setFormData({...formData, price: v})} type="number" placeholder="29990000" />
                <InputField label="Giá gốc (₫)" value={formData.originalPrice} onChange={v => setFormData({...formData, originalPrice: v})} type="number" placeholder="34990000" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-white/40 mb-1.5">Danh mục</label>
                  <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}
                    className="w-full h-10 px-3 bg-white/[0.04] border border-white/[0.08] rounded-lg text-sm text-white outline-none focus:border-indigo-500/50 transition-all appearance-none">
                    <option value="Điện thoại">Điện thoại</option>
                    <option value="Máy tính bảng">Máy tính bảng</option>
                    <option value="Phụ kiện">Phụ kiện</option>
                  </select>
                </div>
                <InputField label="Thương hiệu" value={formData.brand} onChange={v => setFormData({...formData, brand: v})} placeholder="VD: Apple" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <InputField label="Số lượng kho" value={formData.stock} onChange={v => setFormData({...formData, stock: v})} type="number" placeholder="50" />
                <div>
                  <label className="block text-xs font-medium text-white/40 mb-1.5">Trạng thái</label>
                  <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}
                    className="w-full h-10 px-3 bg-white/[0.04] border border-white/[0.08] rounded-lg text-sm text-white outline-none focus:border-indigo-500/50 transition-all appearance-none">
                    <option value="active">Đang bán</option>
                    <option value="draft">Nháp</option>
                    <option value="outOfStock">Hết hàng</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex gap-3 px-5 pb-5">
              <button onClick={() => setModalType(null)} className="flex-1 h-10 rounded-lg bg-white/[0.06] border border-white/[0.08] text-sm text-white/70 hover:text-white hover:bg-white/[0.1] transition-all outline-none">Hủy</button>
              <button onClick={handleSave} className="flex-1 h-10 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-sm text-white font-medium transition-all outline-none border-none flex items-center justify-center gap-2">
                <Save size={14} /> {modalType === 'add' ? 'Thêm' : 'Lưu thay đổi'}
              </button>
            </div>
          </ModalWrapper>
        )}
      </AnimatePresence>

      {/* View Modal */}
      <AnimatePresence>
        {modalType === 'view' && currentProduct && (
          <ModalWrapper onClose={() => setModalType(null)}>
            <ModalHeader title="Chi tiết sản phẩm" onClose={() => setModalType(null)} />
            <div className="p-5 space-y-4">
              <div className="flex gap-4">
                <img src={currentProduct.image} alt="" className="w-24 h-24 rounded-xl object-cover" />
                <div className="flex-1">
                  <h4 className="text-base font-semibold text-white">{currentProduct.name}</h4>
                  <p className="text-xs text-white/40 mt-1">{currentProduct.brand} • {currentProduct.category}</p>
                  <div className="mt-2"><StatusBadge status={currentProduct.status} /></div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Giá bán', value: formatCurrency(currentProduct.price) },
                  { label: 'Giá gốc', value: formatCurrency(currentProduct.originalPrice) },
                  { label: 'Tồn kho', value: `${currentProduct.stock} sản phẩm` },
                  { label: 'Đã bán', value: `${currentProduct.sold} sản phẩm` },
                  { label: 'Đánh giá', value: `${currentProduct.rating} ★` },
                  { label: 'Ngày tạo', value: new Date(currentProduct.createdAt).toLocaleDateString('vi-VN') },
                ].map(item => (
                  <div key={item.label} className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.04]">
                    <p className="text-[10px] text-white/30 uppercase tracking-wider">{item.label}</p>
                    <p className="text-sm text-white/80 font-medium mt-1">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </ModalWrapper>
        )}
      </AnimatePresence>

      {/* Import Modal */}
      <AnimatePresence>
        {modalType === 'import' && (
          <ModalWrapper maxW="max-w-md" onClose={() => setModalType(null)}>
            <ModalHeader title="Import sản phẩm" onClose={() => setModalType(null)} />
            <div className="p-5 space-y-4">
              <div className="border-2 border-dashed border-white/[0.1] rounded-xl p-8 text-center hover:border-indigo-500/30 transition-colors cursor-pointer">
                <FileSpreadsheet size={40} className="text-white/20 mx-auto mb-3" />
                <p className="text-sm text-white/60 font-medium">Kéo thả file hoặc click để chọn</p>
                <p className="text-xs text-white/30 mt-1">Hỗ trợ .xlsx, .csv (tối đa 5MB)</p>
              </div>
              <div className="p-3 rounded-lg bg-indigo-500/[0.06] border border-indigo-500/[0.15]">
                <p className="text-xs text-indigo-400">💡 Tải file mẫu để xem định dạng chuẩn trước khi import.</p>
              </div>
            </div>
            <div className="flex gap-3 px-5 pb-5">
              <button onClick={() => setModalType(null)} className="flex-1 h-10 rounded-lg bg-white/[0.06] border border-white/[0.08] text-sm text-white/70 hover:text-white transition-all outline-none">Hủy</button>
              <button onClick={handleImport} className="flex-1 h-10 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-sm text-white font-medium transition-all outline-none border-none flex items-center justify-center gap-2">
                <Upload size={14} /> Import
              </button>
            </div>
          </ModalWrapper>
        )}
      </AnimatePresence>

      {/* Export Modal */}
      <AnimatePresence>
        {modalType === 'export' && (
          <ModalWrapper maxW="max-w-md" onClose={() => setModalType(null)}>
            <ModalHeader title="Export sản phẩm" onClose={() => setModalType(null)} />
            <div className="p-5 space-y-4">
              <p className="text-sm text-white/60">Chọn định dạng xuất dữ liệu:</p>
              {[
                { label: 'Excel (.xlsx)', desc: 'Xuất đầy đủ thông tin sản phẩm', icon: '📊' },
                { label: 'CSV (.csv)', desc: 'Tương thích nhiều phần mềm', icon: '📄' },
              ].map(fmt => (
                <div key={fmt.label} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-indigo-500/30 cursor-pointer transition-all">
                  <span className="text-xl">{fmt.icon}</span>
                  <div className="flex-1"><p className="text-sm text-white/80 font-medium">{fmt.label}</p><p className="text-xs text-white/30">{fmt.desc}</p></div>
                  <Check size={16} className="text-indigo-400" />
                </div>
              ))}
              <div className="p-3 rounded-lg bg-white/[0.02]">
                <p className="text-xs text-white/40">Sẽ xuất <span className="text-white/70 font-medium">{adminProducts.length} sản phẩm</span> theo bộ lọc hiện tại.</p>
              </div>
            </div>
            <div className="flex gap-3 px-5 pb-5">
              <button onClick={() => setModalType(null)} className="flex-1 h-10 rounded-lg bg-white/[0.06] border border-white/[0.08] text-sm text-white/70 hover:text-white transition-all outline-none">Hủy</button>
              <button onClick={handleExport} className="flex-1 h-10 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-sm text-white font-medium transition-all outline-none border-none flex items-center justify-center gap-2">
                <Download size={14} /> Tải xuống
              </button>
            </div>
          </ModalWrapper>
        )}
      </AnimatePresence>

      {/* Delete Confirmation */}
      <ConfirmationModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Xóa sản phẩm"
        message={`Bạn có chắc muốn xóa "${deleteTarget?.name}"? Hành động này không thể hoàn tác.`}
        confirmText="Xóa"
        confirmColor="red"
      />
    </div>
  );
};
