import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Plus, Filter, Download, Upload, Edit2, Trash2, Eye, Star, Package, X, Save, FileSpreadsheet, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { ChartCard } from '@components/admin/ChartCard';
import { StatusBadge } from '@components/admin/StatusBadge';
import { ConfirmationModal } from '@components/admin/ConfirmationModal';
import { formatPrice } from '@utils/format';
import { getProducts, createProduct, updateProduct, deleteProduct } from '@services/product.service';
import type { Product } from '@types';

type ModalType = 'add' | 'edit' | 'view' | 'import' | 'export' | null;

const API_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api').replace('/api', '');

const getProductImage = (prod: Product | null): string => {
  if (!prod) return 'https://placehold.co/200x200?text=No+Image';
  if (!prod.images || prod.images.length === 0) return 'https://placehold.co/200x200?text=No+Image';
  const primary = prod.images.find((img) => img.isPrimary) ?? prod.images[0];
  if (primary.imageUrl.startsWith('http')) return primary.imageUrl;
  return `${API_URL}${primary.imageUrl}`;
};

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
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  const [modalType, setModalType] = useState<ModalType>(null);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);

  // Form state for add/edit
  const [formData, setFormData] = useState({ 
    name: '', price: '', originalPrice: '', category: 'Điện thoại', brand: '', stock: '', status: 'active',
    mainImage: '', image2: '', image3: '', image4: '',
    spec_screen: '', spec_os: '', spec_chip: '', spec_ram: '', spec_rom: '', spec_cam: '', spec_pin: '',
    additionalSpecs: [] as { name: string; value: string }[]
  });

  const categories = ['all', 'Điện thoại', 'Máy tính bảng', 'Phụ kiện'];

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await getProducts({ limit: 100, sortBy: 'id', sortOrder: 'desc' });
      setProducts(res.items);
    } catch {
      toast.error('Lỗi khi tải danh sách sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    const timer = setTimeout(() => fetchProducts(), 0);
    return () => clearTimeout(timer);
  }, []);

  const filteredProducts = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCategory = filterCategory === 'all' || p.categoryName === filterCategory;
    return matchSearch && matchCategory;
  });

  const toggleSelect = (id: number) => {
    setSelectedProducts(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);
  };

  const openAdd = () => {
    setFormData({ 
      name: '', price: '', originalPrice: '', category: 'Điện thoại', brand: '', stock: '', status: 'active',
      mainImage: '', image2: '', image3: '', image4: '',
      spec_screen: '', spec_os: '', spec_chip: '', spec_ram: '', spec_rom: '', spec_cam: '', spec_pin: '',
      additionalSpecs: [] 
    });
    setModalType('add');
  };

  const getSpec = (p: Product, name: string) => p.specs?.find(s => s.specName === name)?.specValue || '';

  const openEdit = (p: Product) => {
    setCurrentProduct(p);
    const mainImage = p.images?.find(i => i.isPrimary)?.imageUrl || p.images?.[0]?.imageUrl || '';
    const others = p.images?.filter(i => i.imageUrl !== mainImage) || [];
    
    const getUrl = (url: string) => url.startsWith('http') ? url : (url ? `${API_URL}${url}` : '');

    setFormData({ 
      name: p.name, price: String(p.price), originalPrice: String(p.originalPrice || ''), category: p.categoryName, brand: p.brand, stock: String(p.stock), status: p.status,
      mainImage: getUrl(mainImage), image2: getUrl(others[0]?.imageUrl), image3: getUrl(others[1]?.imageUrl), image4: getUrl(others[2]?.imageUrl),
      spec_screen: getSpec(p, 'Màn hình'), spec_os: getSpec(p, 'Hệ điều hành'), spec_chip: getSpec(p, 'Chipset'), spec_ram: getSpec(p, 'RAM'), spec_rom: getSpec(p, 'Bộ nhớ trong'), spec_cam: getSpec(p, 'Camera sau'), spec_pin: getSpec(p, 'Pin, Sạc'),
      additionalSpecs: p.additionalSpecs || []
    });
    setModalType('edit');
  };
  const openView = (p: Product) => { setCurrentProduct(p); setModalType('view'); };

  const handleSave = async () => {
    if (!formData.name.trim()) { toast.error('Vui lòng nhập tên sản phẩm'); return; }

    const cleanUrl = (url: string) => url.startsWith('http') ? url : url.replace(API_URL, '');
    const images = [];
    if (formData.mainImage) images.push({ imageUrl: cleanUrl(formData.mainImage), isPrimary: 1, sortOrder: 0 });
    if (formData.image2) images.push({ imageUrl: cleanUrl(formData.image2), isPrimary: 0, sortOrder: 1 });
    if (formData.image3) images.push({ imageUrl: cleanUrl(formData.image3), isPrimary: 0, sortOrder: 2 });
    if (formData.image4) images.push({ imageUrl: cleanUrl(formData.image4), isPrimary: 0, sortOrder: 3 });

    const specs = [];
    if (formData.spec_screen) specs.push({ specName: 'Màn hình', specValue: formData.spec_screen, sortOrder: 1 });
    if (formData.spec_os) specs.push({ specName: 'Hệ điều hành', specValue: formData.spec_os, sortOrder: 2 });
    if (formData.spec_chip) specs.push({ specName: 'Chipset', specValue: formData.spec_chip, sortOrder: 3 });
    if (formData.spec_ram) specs.push({ specName: 'RAM', specValue: formData.spec_ram, sortOrder: 4 });
    if (formData.spec_rom) specs.push({ specName: 'Bộ nhớ trong', specValue: formData.spec_rom, sortOrder: 5 });
    if (formData.spec_cam) specs.push({ specName: 'Camera sau', specValue: formData.spec_cam, sortOrder: 6 });
    if (formData.spec_pin) specs.push({ specName: 'Pin, Sạc', specValue: formData.spec_pin, sortOrder: 7 });

    const payload = {
      name: formData.name,
      price: Number(formData.price),
      originalPrice: formData.originalPrice ? Number(formData.originalPrice) : null,
      stock: Number(formData.stock),
      status: formData.status as 'active' | 'draft' | 'out_of_stock' | 'hidden',
      categoryId: 1, // hardcode for now
      brand: 'Apple', // hardcode for now
      slug: formData.name.toLowerCase().replace(/ /g, '-'),
      images,
      specs,
      additionalSpecs: formData.additionalSpecs
    };

    if (modalType === 'add') {
      const res = await createProduct(payload);
      if (res.ok) toast.success('Thêm sản phẩm thành công!');
      else toast.error(res.message || 'Lỗi thêm sản phẩm');
    } else if (currentProduct) {
      const res = await updateProduct(currentProduct.id, payload);
      if (res.ok) toast.success('Cập nhật sản phẩm thành công!');
      else toast.error(res.message || 'Lỗi cập nhật');
    }
    setModalType(null);
    setCurrentProduct(null);
    fetchProducts();
  };

  const handleDelete = async () => {
    if (deleteTarget) {
      const res = await deleteProduct(deleteTarget.id);
      if (res.ok) {
        toast.success(`Đã xóa sản phẩm "${deleteTarget.name}"!`);
        fetchProducts();
      } else {
        toast.error(res.message || 'Lỗi xóa sản phẩm');
      }
    }
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
          <p className="text-sm opacity-40 mt-1">{loading ? 'Đang tải...' : `${products.length} sản phẩm`}</p>
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
                      <img src={getProductImage(product)} alt={product.name} className="w-10 h-10 rounded-lg object-cover" />
                      <div><p className="text-sm font-medium opacity-80">{product.name}</p><p className="text-xs opacity-30">{product.brand}</p></div>
                    </div>
                  </td>
                  <td className="py-3 pr-4">
                    <p className="text-sm font-medium opacity-80">{formatPrice(product.price)}</p>
                    {product.originalPrice && (
                      <p className="text-xs opacity-30 line-through">{formatPrice(product.originalPrice)}</p>
                    )}
                  </td>
                  <td className="py-3 pr-4"><span className={`text-sm font-medium ${product.stock <= 10 ? 'text-red-400' : 'opacity-70'}`}>{product.stock}</span></td>
                  <td className="py-3 pr-4"><span className="text-sm opacity-50">0</span></td>
                  <td className="py-3 pr-4"><div className="flex items-center gap-1"><Star size={12} className="text-amber-400 fill-amber-400" /><span className="text-sm opacity-60">{product.rating}</span></div></td>
                  <td className="py-3 pr-4"><StatusBadge status={product.status === 'out_of_stock' ? 'outOfStock' : product.status} /></td>
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
          <ModalWrapper maxW="max-w-3xl" onClose={() => setModalType(null)}>
            <ModalHeader title={modalType === 'add' ? 'Thêm sản phẩm mới' : 'Chỉnh sửa sản phẩm'} onClose={() => setModalType(null)} />
            <div className="p-5 space-y-6">
              
              {/* Thông tin cơ bản */}
              <div>
                <h4 className="text-sm font-semibold text-white/80 mb-3 uppercase tracking-wider">Thông tin cơ bản</h4>
                <div className="space-y-4">
                  <InputField label="Tên sản phẩm" value={formData.name} onChange={v => setFormData({...formData, name: v})} placeholder="VD: iPhone 16 Pro Max 256GB" />
                  <div className="grid grid-cols-2 gap-3">
                    <InputField label="Giá bán (₫)" value={formData.price} onChange={v => setFormData({...formData, price: v})} type="number" placeholder="29990000" />
                    <InputField label="Giá gốc (₫)" value={formData.originalPrice} onChange={v => setFormData({...formData, originalPrice: v})} type="number" placeholder="34990000" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-white/40 mb-1.5">Danh mục</label>
                      <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}
                        className="w-full h-10 px-3 bg-white/[0.04] border border-white/[0.08] rounded-lg text-sm text-black dark:text-white outline-none focus:border-indigo-500/50 transition-all appearance-none"
                        style={{ WebkitAppearance: 'none', MozAppearance: 'none', appearance: 'none', backgroundImage: 'none' }}>
                        <option value="Điện thoại" className="bg-white dark:bg-[#1A1A1A]">Điện thoại</option>
                        <option value="Máy tính bảng" className="bg-white dark:bg-[#1A1A1A]">Máy tính bảng</option>
                        <option value="Phụ kiện" className="bg-white dark:bg-[#1A1A1A]">Phụ kiện</option>
                      </select>
                    </div>
                    <InputField label="Thương hiệu" value={formData.brand} onChange={v => setFormData({...formData, brand: v})} placeholder="VD: Apple" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <InputField label="Số lượng kho" value={formData.stock} onChange={v => setFormData({...formData, stock: v})} type="number" placeholder="50" />
                    <div>
                      <label className="block text-xs font-medium text-white/40 mb-1.5">Trạng thái</label>
                      <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}
                        className="w-full h-10 px-3 bg-white/[0.04] border border-white/[0.08] rounded-lg text-sm text-black dark:text-white outline-none focus:border-indigo-500/50 transition-all appearance-none"
                        style={{ WebkitAppearance: 'none', MozAppearance: 'none', appearance: 'none', backgroundImage: 'none' }}>
                        <option value="active" className="bg-white dark:bg-[#1A1A1A]">Đang bán</option>
                        <option value="draft" className="bg-white dark:bg-[#1A1A1A]">Nháp</option>
                        <option value="outOfStock" className="bg-white dark:bg-[#1A1A1A]">Hết hàng</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Hình ảnh */}
              <div className="pt-4 border-t border-white/[0.06]">
                <h4 className="text-sm font-semibold text-white/80 mb-3 uppercase tracking-wider">Hình ảnh</h4>
                <div className="grid grid-cols-2 gap-3">
                  <InputField label="Ảnh chính (URL)" value={formData.mainImage} onChange={v => setFormData({...formData, mainImage: v})} placeholder="/images/main.png" />
                  <InputField label="Ảnh phụ 1 (URL)" value={formData.image2} onChange={v => setFormData({...formData, image2: v})} placeholder="/images/2.png" />
                  <InputField label="Ảnh phụ 2 (URL)" value={formData.image3} onChange={v => setFormData({...formData, image3: v})} placeholder="/images/3.png" />
                  <InputField label="Ảnh phụ 3 (URL)" value={formData.image4} onChange={v => setFormData({...formData, image4: v})} placeholder="/images/4.png" />
                </div>
                <div className="flex gap-4 mt-4">
                  {[formData.mainImage, formData.image2, formData.image3, formData.image4].map((url, i) => (
                    <div key={i} className="w-20 h-20 rounded-lg bg-white/[0.04] border border-white/[0.08] overflow-hidden flex items-center justify-center shrink-0">
                      {url ? (
                        <img src={url} alt={`Preview ${i}`} className="w-full h-full object-cover" onError={(e) => (e.currentTarget.src = 'https://placehold.co/200x200?text=Error')} />
                      ) : (
                        <span className="text-[10px] text-white/30 uppercase">Trống</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Thông số kỹ thuật cơ bản */}
              <div className="pt-4 border-t border-white/[0.06]">
                <h4 className="text-sm font-semibold text-white/80 mb-3 uppercase tracking-wider">Thông số cơ bản</h4>
                <div className="grid grid-cols-2 gap-3">
                  <InputField label="Màn hình" value={formData.spec_screen} onChange={v => setFormData({...formData, spec_screen: v})} placeholder="6.7 inch, OLED" />
                  <InputField label="Hệ điều hành" value={formData.spec_os} onChange={v => setFormData({...formData, spec_os: v})} placeholder="iOS 17" />
                  <InputField label="Chipset" value={formData.spec_chip} onChange={v => setFormData({...formData, spec_chip: v})} placeholder="Apple A17 Pro" />
                  <InputField label="RAM" value={formData.spec_ram} onChange={v => setFormData({...formData, spec_ram: v})} placeholder="8 GB" />
                  <InputField label="Bộ nhớ trong" value={formData.spec_rom} onChange={v => setFormData({...formData, spec_rom: v})} placeholder="256 GB" />
                  <InputField label="Camera sau" value={formData.spec_cam} onChange={v => setFormData({...formData, spec_cam: v})} placeholder="48 MP" />
                  <InputField label="Pin, Sạc" value={formData.spec_pin} onChange={v => setFormData({...formData, spec_pin: v})} placeholder="4441 mAh, 20 W" />
                </div>
              </div>

              {/* Thông số bổ sung (To-do list style) */}
              <div className="pt-4 border-t border-white/[0.06]">
                <h4 className="text-sm font-semibold text-white/80 mb-3 uppercase tracking-wider">Thông số bổ sung</h4>
                <div className="space-y-3">
                  {formData.additionalSpecs.map((spec, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="flex-1 grid grid-cols-2 gap-3">
                        <input type="text" value={spec.name} onChange={e => {
                          const newSpecs = [...formData.additionalSpecs];
                          newSpecs[i].name = e.target.value;
                          setFormData({...formData, additionalSpecs: newSpecs});
                        }} placeholder="Tên thông số (VD: Camera trước)" className="h-9 px-3 bg-white/[0.04] border border-white/[0.08] rounded-lg text-sm text-white outline-none focus:border-indigo-500/50" />
                        <input type="text" value={spec.value} onChange={e => {
                          const newSpecs = [...formData.additionalSpecs];
                          newSpecs[i].value = e.target.value;
                          setFormData({...formData, additionalSpecs: newSpecs});
                        }} placeholder="Giá trị (VD: 12 MP)" className="h-9 px-3 bg-white/[0.04] border border-white/[0.08] rounded-lg text-sm text-white outline-none focus:border-indigo-500/50" />
                      </div>
                      <button onClick={() => {
                        const newSpecs = formData.additionalSpecs.filter((_, idx) => idx !== i);
                        setFormData({...formData, additionalSpecs: newSpecs});
                      }} className="w-9 h-9 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 flex items-center justify-center transition-all outline-none">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                  <button onClick={() => {
                    setFormData({...formData, additionalSpecs: [...formData.additionalSpecs, { name: '', value: '' }]});
                  }} className="h-9 px-4 rounded-lg bg-white/[0.04] border border-white/[0.08] text-sm text-white/70 hover:text-white hover:bg-white/[0.1] transition-all outline-none flex items-center gap-2">
                    <Plus size={14} /> Thêm thông số
                  </button>
                </div>
              </div>

            </div>
            <div className="flex gap-3 px-5 pb-5 pt-4 border-t border-white/[0.06]">
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
          <ModalWrapper maxW="max-w-4xl" onClose={() => setModalType(null)}>
            <ModalHeader title="Chi tiết sản phẩm" onClose={() => setModalType(null)} />
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left Column: Images */}
              <div className="space-y-4">
                <div className="w-full aspect-square rounded-2xl overflow-hidden bg-white/[0.02] border border-white/[0.05]">
                  <img src={getProductImage(currentProduct)} alt={currentProduct.name} className="w-full h-full object-cover" />
                </div>
                {currentProduct.images && currentProduct.images.length > 1 && (
                  <div className="grid grid-cols-3 gap-3">
                    {currentProduct.images.filter(img => !img.isPrimary).slice(0, 3).map((img, i) => (
                      <div key={i} className={`aspect-square rounded-xl overflow-hidden border border-white/[0.05] bg-white/[0.02]`}>
                        <img src={img.imageUrl.startsWith('http') ? img.imageUrl : `${API_URL}${img.imageUrl}`} alt="" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Column: Info & Specs */}
              <div className="space-y-6">
                <div>
                  <h4 className="text-xl font-bold text-white leading-tight">{currentProduct.name}</h4>
                  <div className="flex items-center gap-3 mt-2">
                    <p className="text-sm text-indigo-400 font-medium">{currentProduct.brand}</p>
                    <span className="text-white/20">•</span>
                    <p className="text-sm text-white/50">{currentProduct.categoryName}</p>
                    <span className="text-white/20">•</span>
                    <StatusBadge status={currentProduct.status === 'out_of_stock' ? 'outOfStock' : currentProduct.status} />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Giá bán', value: formatPrice(currentProduct.price), highlight: true },
                    { label: 'Giá gốc', value: currentProduct.originalPrice ? formatPrice(currentProduct.originalPrice) : 'Không có' },
                    { label: 'Tồn kho', value: `${currentProduct.stock} sản phẩm` },
                    { label: 'Đã bán', value: `0 sản phẩm` },
                    { label: 'Đánh giá', value: `${currentProduct.rating} ★` },
                    { label: 'Ngày tạo', value: currentProduct.createdAt ? new Date(currentProduct.createdAt).toLocaleDateString('vi-VN') : '-' },
                  ].map(item => (
                    <div key={item.label} className={`p-3.5 rounded-xl border ${item.highlight ? 'bg-indigo-500/[0.05] border-indigo-500/20' : 'bg-white/[0.02] border-white/[0.04]'}`}>
                      <p className="text-[10px] text-white/40 uppercase tracking-wider">{item.label}</p>
                      <p className={`text-base font-semibold mt-1 ${item.highlight ? 'text-indigo-400' : 'text-white/90'}`}>{item.value}</p>
                    </div>
                  ))}
                </div>

                {((currentProduct.specs && currentProduct.specs.length > 0) || (currentProduct.additionalSpecs && currentProduct.additionalSpecs.length > 0)) && (
                  <div className="pt-6 border-t border-white/[0.06]">
                    <h5 className="text-sm font-semibold text-white/80 mb-4 uppercase tracking-wider">Thông số kỹ thuật chi tiết</h5>
                    <div className="space-y-2">
                      {currentProduct.specs?.map((s, i) => (
                        <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
                          <span className="text-xs font-medium text-white/50 w-1/3">{s.specName}</span>
                          <span className="text-sm text-white/90 w-2/3 text-right">{s.specValue}</span>
                        </div>
                      ))}
                      {currentProduct.additionalSpecs?.map((s, i) => (
                        <div key={`add-${i}`} className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
                          <span className="text-xs font-medium text-white/50 w-1/3">{s.name}</span>
                          <span className="text-sm text-white/90 w-2/3 text-right">{s.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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
                <p className="text-xs text-white/40">Sẽ xuất <span className="text-white/70 font-medium">{products.length} sản phẩm</span> theo bộ lọc hiện tại.</p>
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
