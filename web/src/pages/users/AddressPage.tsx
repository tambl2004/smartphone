import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Trash2, MapPin, X, Check, Star, Pencil } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  getMyAddresses, addAddress, updateAddress, deleteAddress, setDefaultAddress,
  getProvinces, getDistricts, getWards,
  type Address, type LocationItem
} from '@services/address.service';

export const AddressPage: React.FC = () => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Form State
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [isDefault, setIsDefault] = useState(false);

  // Location State
  const [provinces, setProvinces] = useState<LocationItem[]>([]);
  const [districts, setDistricts] = useState<LocationItem[]>([]);
  const [wards, setWards] = useState<LocationItem[]>([]);

  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedWard, setSelectedWard] = useState('');

  const fetchAddresses = async () => {
    const res = await getMyAddresses();
    if (res.ok && res.data) {
      setAddresses(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchAddresses();
    void getProvinces().then(setProvinces);
  }, []);

  // Cascading Location Logic
  useEffect(() => {
    if (selectedProvince) {
      void getDistricts(selectedProvince).then(setDistricts);
    } else {
      setTimeout(() => setDistricts([]), 0);
    }
  }, [selectedProvince]);

  useEffect(() => {
    if (selectedProvince && selectedDistrict) {
      void getWards(selectedProvince, selectedDistrict).then(setWards);
    } else {
      setTimeout(() => setWards([]), 0);
    }
  }, [selectedProvince, selectedDistrict]);

  const openAddModal = () => {
    setEditingId(null);
    setFullName('');
    setPhone('');
    setSelectedProvince('');
    setSelectedDistrict('');
    setSelectedWard('');
    setStreetAddress('');
    setIsDefault(addresses.length === 0);
    setIsModalOpen(true);
  };

  const openEditModal = (addr: Address) => {
    setEditingId(addr.id);
    setFullName(addr.fullName);
    setPhone(addr.phone);
    setSelectedProvince(addr.provinceId);
    setSelectedDistrict(addr.districtId);
    setSelectedWard(addr.wardId);
    setStreetAddress(addr.streetAddress);
    setIsDefault(addr.isDefault);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa địa chỉ này?')) {
      const res = await deleteAddress(id);
      if (res.ok) {
        toast.success('Đã xóa địa chỉ');
        void fetchAddresses();
      } else {
        toast.error(res.message || 'Lỗi khi xóa');
      }
    }
  };

  const handleSetDefault = async (id: number) => {
    const res = await setDefaultAddress(id);
    if (res.ok) {
      toast.success('Đã đặt làm mặc định');
      void fetchAddresses();
    } else {
      toast.error(res.message || 'Lỗi khi đặt mặc định');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName || !phone || !selectedProvince || !selectedDistrict || !selectedWard || !streetAddress) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }

    const prov = provinces.find(p => p.id === selectedProvince);
    const dist = districts.find(d => d.id === selectedDistrict);
    const ward = wards.find(w => w.id === selectedWard);

    const payload = {
      fullName,
      phone,
      provinceId: selectedProvince,
      provinceName: prov?.name || '',
      districtId: selectedDistrict,
      districtName: dist?.name || '',
      wardId: selectedWard,
      wardName: ward?.name || '',
      streetAddress,
      isDefault
    };

    let res;
    if (editingId) {
      res = await updateAddress(editingId, payload);
    } else {
      res = await addAddress(payload);
    }

    if (res.ok) {
      toast.success(editingId ? 'Đã cập nhật địa chỉ' : 'Đã thêm địa chỉ mới');
      setIsModalOpen(false);
      void fetchAddresses();
    } else {
      toast.error(res.message || 'Có lỗi xảy ra');
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950 pt-24 pb-12">
      <div className="max-w-[1200px] mx-auto px-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-black dark:text-white tracking-tight">Địa chỉ của tôi</h1>
            <p className="text-sm text-neutral-500 mt-1">Quản lý địa chỉ nhận hàng, chỉ có 1 địa chỉ mặc định</p>
          </div>
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-6 py-3 bg-black hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-black rounded-2xl font-bold transition-all shadow-md hover:shadow-lg"
          >
            <Plus size={18} /> THÊM ĐỊA CHỈ
          </button>
        </div>

        {/* Addresses Grid */}
        {loading ? (
          <div className="py-20 flex justify-center">
            <div className="w-8 h-8 border-4 border-black dark:border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : addresses.length === 0 ? (
          <div className="text-center py-24 border-2 border-dashed border-neutral-200 dark:border-neutral-800 rounded-3xl">
            <MapPin size={48} className="mx-auto text-neutral-300 dark:text-neutral-700 mb-4" />
            <p className="text-neutral-500 font-medium text-base">Bạn chưa có địa chỉ nào.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {addresses.map((addr, idx) => (
              <motion.div 
                key={addr.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`relative flex flex-col p-6 rounded-2xl border-2 transition-all bg-white dark:bg-neutral-900 ${addr.isDefault ? 'border-green-600 dark:border-green-500 shadow-md' : 'border-neutral-100 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700'}`}
              >
                {addr.isDefault && (
                  <div className="absolute -top-3 right-6 bg-green-600 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase flex items-center gap-1 shadow-sm">
                    <Star size={10} className="fill-current" /> Mặc định
                  </div>
                )}
                
                <div className="flex items-center gap-3 mb-4 pb-4 border-b border-neutral-100 dark:border-neutral-800">
                  <div className="w-10 h-10 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center font-bold text-black dark:text-white shrink-0">
                    {addr.fullName.charAt(0).toUpperCase()}
                  </div>
                  <div className="overflow-hidden">
                    <h3 className="font-bold text-black dark:text-white truncate">{addr.fullName}</h3>
                    <p className="text-sm font-medium text-neutral-500">{addr.phone}</p>
                  </div>
                </div>
                
                <div className="flex-1 mb-6">
                  <p className="text-sm text-neutral-700 dark:text-neutral-300 font-medium mb-1">{addr.streetAddress}</p>
                  <p className="text-sm text-neutral-500">{addr.wardName}, {addr.districtName}</p>
                  <p className="text-sm text-neutral-500">{addr.provinceName}</p>
                </div>
                
                <div className="flex items-center gap-3 mt-auto pt-4 border-t border-neutral-100 dark:border-neutral-800">
                  <button 
                    onClick={() => openEditModal(addr)}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-black dark:text-white rounded-xl text-sm font-bold transition-colors"
                  >
                    <Pencil size={14} /> Sửa
                  </button>
                  
                  {!addr.isDefault && (
                    <button 
                      onClick={() => handleSetDefault(addr.id)}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 border-2 border-green-600 text-green-600 hover:bg-green-600 hover:text-white rounded-xl text-sm font-bold transition-colors"
                    >
                      Mặc định
                    </button>
                  )}

                  {!addr.isDefault && (
                    <button 
                      onClick={() => handleDelete(addr.id)}
                      className="w-10 h-10 flex items-center justify-center bg-red-50 hover:bg-red-100 dark:bg-red-950/30 dark:hover:bg-red-900/50 text-red-500 rounded-xl transition-colors shrink-0"
                      title="Xóa"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Address Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setIsModalOpen(false)}
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white dark:bg-neutral-900 rounded-2xl p-8 w-full max-w-lg shadow-xl relative z-10 border border-neutral-200 dark:border-neutral-800"
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-bold text-black dark:text-white tracking-tight">
                  {editingId ? 'Cập nhật địa chỉ' : 'Thêm địa chỉ mới'}
                </h3>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 text-neutral-400 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="relative">
                    <label className="absolute -top-2.5 left-3 bg-white dark:bg-neutral-900 px-1 text-xs text-neutral-500 font-medium z-10">Họ và tên</label>
                    <input 
                      value={fullName} onChange={e => setFullName(e.target.value)}
                      className="w-full px-4 py-3 bg-transparent border border-neutral-300 dark:border-neutral-700 focus:border-black dark:focus:border-white rounded-xl text-sm transition-all outline-none"
                    />
                  </div>
                  <div className="relative">
                    <label className="absolute -top-2.5 left-3 bg-white dark:bg-neutral-900 px-1 text-xs text-neutral-500 font-medium z-10">Số điện thoại</label>
                    <input 
                      value={phone} onChange={e => setPhone(e.target.value)}
                      className="w-full px-4 py-3 bg-transparent border border-neutral-300 dark:border-neutral-700 focus:border-black dark:focus:border-white rounded-xl text-sm transition-all outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-5 mt-2">
                  <div className="relative">
                    <label className="absolute -top-2.5 left-3 bg-white dark:bg-neutral-900 px-1 text-xs text-neutral-500 font-medium z-10">Tỉnh/Thành phố</label>
                    <select 
                      value={selectedProvince} onChange={e => {
                        setSelectedProvince(e.target.value);
                        setSelectedDistrict('');
                        setSelectedWard('');
                        setWards([]);
                      }}
                      className="w-full px-4 py-3 bg-transparent border border-neutral-300 dark:border-neutral-700 focus:border-black dark:focus:border-white rounded-xl text-sm transition-all outline-none appearance-none"
                    >
                      <option value="">Chọn Tỉnh/Thành phố</option>
                      {provinces.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="relative">
                      <label className="absolute -top-2.5 left-3 bg-white dark:bg-neutral-900 px-1 text-xs text-neutral-500 font-medium z-10">Quận/Huyện</label>
                      <select 
                        value={selectedDistrict} onChange={e => {
                          setSelectedDistrict(e.target.value);
                          setSelectedWard('');
                        }}
                        disabled={!selectedProvince}
                        className="w-full px-4 py-3 bg-transparent border border-neutral-300 dark:border-neutral-700 focus:border-black dark:focus:border-white rounded-xl text-sm transition-all outline-none appearance-none disabled:opacity-50"
                      >
                        <option value="">Chọn Quận/Huyện</option>
                        {districts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                      </select>
                    </div>
                    <div className="relative">
                      <label className="absolute -top-2.5 left-3 bg-white dark:bg-neutral-900 px-1 text-xs text-neutral-500 font-medium z-10">Phường/Xã</label>
                      <select 
                        value={selectedWard} onChange={e => setSelectedWard(e.target.value)}
                        disabled={!selectedDistrict}
                        className="w-full px-4 py-3 bg-transparent border border-neutral-300 dark:border-neutral-700 focus:border-black dark:focus:border-white rounded-xl text-sm transition-all outline-none appearance-none disabled:opacity-50"
                      >
                        <option value="">Chọn Phường/Xã</option>
                        {wards.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="relative mt-2">
                  <label className="absolute -top-2.5 left-3 bg-white dark:bg-neutral-900 px-1 text-xs text-neutral-500 font-medium z-10">Địa chỉ cụ thể</label>
                  <input 
                    placeholder="Tên tòa nhà, số nhà, ngõ..." 
                    value={streetAddress} onChange={e => setStreetAddress(e.target.value)}
                    className="w-full px-4 py-3 bg-transparent border border-neutral-300 dark:border-neutral-700 focus:border-black dark:focus:border-white rounded-xl text-sm transition-all outline-none"
                  />
                </div>

                <label className="flex items-center gap-3 cursor-pointer mt-6">
                  <div className={`w-5 h-5 rounded flex items-center justify-center transition-colors ${isDefault ? 'bg-black dark:bg-white' : 'bg-neutral-200 dark:bg-neutral-700'}`}>
                    {isDefault && <Check size={14} className="text-white dark:text-black" />}
                  </div>
                  <input type="checkbox" className="hidden" checked={isDefault} onChange={e => setIsDefault(e.target.checked)} />
                  <span className="text-sm font-medium text-black dark:text-white">
                    Đặt làm địa chỉ mặc định
                  </span>
                </label>

                <div className="flex gap-4 pt-6 mt-2 border-t border-neutral-100 dark:border-neutral-800">
                  <button 
                    type="button" onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-4 px-6 rounded-2xl font-bold text-sm bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-black dark:text-white transition-colors"
                  >
                    Hủy
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-4 px-6 rounded-2xl font-bold text-sm bg-black hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-black transition-colors"
                  >
                    Hoàn thành
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
