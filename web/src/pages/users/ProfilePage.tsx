import React, { useState, useEffect, useRef } from 'react';
import { getAuth, updateProfile, updatePassword, updateAvatar } from '@services/auth.service';
import { motion } from 'motion/react';
import toast from 'react-hot-toast';
import { useRouter, Link } from '@routes/router';
import { Shield, Eye, EyeOff, Camera, CheckCircle2 } from 'lucide-react';
import { getMyAddresses, type Address } from '@services/address.service';

export const ProfilePage: React.FC = () => {
  const { navigate } = useRouter();
  const auth = getAuth();
  
  // Profile State
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [defaultAddress, setDefaultAddress] = useState<Address | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPwd, setShowPwd] = useState({ current: false, new: false, confirm: false });

  useEffect(() => {
    if (!auth) {
      navigate('/login');
    } else {
      setTimeout(() => {
        setFullName(auth.user.fullName);
        setPhone(auth.user.phone || '');
        setDateOfBirth(auth.user.dateOfBirth ? new Date(auth.user.dateOfBirth).toISOString().split('T')[0] : '');
        
        void getMyAddresses().then(res => {
          if (res.ok && res.data) {
            const def = res.data.find(a => a.isDefault);
            if (def) setDefaultAddress(def);
          }
        });
      }, 0);
    }
  }, [auth?.user.id, navigate]);

  if (!auth) return null;

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone) {
      toast.error('Họ tên và số điện thoại không được để trống');
      return;
    }

    const res = await updateProfile({ fullName, phone, dateOfBirth: dateOfBirth || null });
    if (res.ok) {
      toast.success('Đã cập nhật thông tin cá nhân');
    } else {
      toast.error(res.message || 'Cập nhật thất bại');
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Vui lòng điền đầy đủ các trường mật khẩu');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp');
      return;
    }

    if (newPassword.length < 8) {
      toast.error('Mật khẩu mới phải có ít nhất 8 ký tự');
      return;
    }

    const res = await updatePassword(currentPassword, newPassword);
    if (res.ok) {
      toast.success('Đã đổi mật khẩu thành công');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      toast.error(res.message || 'Đổi mật khẩu thất bại');
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Chỉ chấp nhận file ảnh');
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Kích thước ảnh tối đa 5MB');
      return;
    }

    setIsUploading(true);
    const toastId = toast.loading('Đang tải ảnh lên...');
    
    const res = await updateAvatar(file);
    
    setIsUploading(false);
    if (res.ok) {
      toast.success('Đã cập nhật ảnh đại diện', { id: toastId });
    } else {
      toast.error(res.message || 'Lỗi khi tải ảnh lên', { id: toastId });
    }
    
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const API_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api').replace('/api', '');

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950 pt-24 pb-12">
      <div className="max-w-[1200px] mx-auto px-6">
        <h1 className="text-3xl font-bold text-black dark:text-white mb-8 text-center sm:text-left tracking-tight">
          Quản lý Hồ sơ
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* LEFT COLUMN */}
          <div className="lg:col-span-2 space-y-6">
            
            <form onSubmit={handleUpdateProfile}>
              {/* Profile Card */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-neutral-900 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-800 p-8"
              >
                <div className="flex flex-col md:flex-row gap-8 items-start">
                  {/* Avatar */}
                  <div className="relative shrink-0 mx-auto md:mx-0">
                    <div className="w-32 h-32 rounded-full border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-4xl font-bold text-black dark:text-white overflow-hidden shadow-inner relative">
                      {auth.user.avatarUrl ? (
                        <img src={`${API_URL}${auth.user.avatarUrl}`} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        auth.user.fullName.charAt(0).toUpperCase()
                      )}
                      
                      {isUploading && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      )}
                    </div>
                    <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleAvatarChange} />
                    <button 
                      type="button" 
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="absolute bottom-1 right-1 w-8 h-8 bg-black dark:bg-white hover:bg-neutral-800 dark:hover:bg-neutral-200 rounded-full flex items-center justify-center text-white dark:text-black border-2 border-white dark:border-neutral-900 shadow-md transition-colors"
                    >
                      <Camera size={14} />
                    </button>
                  </div>

                  {/* Fields */}
                  <div className="flex-1 w-full space-y-5">
                    <div className="relative">
                      <label className="absolute -top-2.5 left-3 bg-white dark:bg-neutral-900 px-1 text-xs text-neutral-500 font-medium z-10">Họ tên</label>
                      <input 
                        value={fullName} onChange={e => setFullName(e.target.value)}
                        className="w-full px-5 py-4 bg-transparent border border-neutral-300 dark:border-neutral-700 rounded-2xl text-sm focus:border-black dark:focus:border-white outline-none transition-colors"
                      />
                    </div>
                    <div className="relative">
                      <label className="absolute -top-2.5 left-3 bg-white dark:bg-neutral-900 px-1 text-xs text-neutral-500 font-medium z-10">Email</label>
                      <input 
                        value={auth.user.email} disabled
                        className="w-full px-5 py-4 bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-800 rounded-2xl text-sm outline-none text-neutral-500 cursor-not-allowed"
                      />
                      <span className="absolute right-4 top-4 text-[10px] bg-green-600 text-white px-3 py-1 rounded-full font-bold uppercase">Đã xác minh</span>
                    </div>
                    <div className="relative">
                      <label className="absolute -top-2.5 left-3 bg-white dark:bg-neutral-900 px-1 text-xs text-neutral-500 font-medium z-10">Số điện thoại</label>
                      <input 
                        value={phone} onChange={e => setPhone(e.target.value)}
                        className="w-full px-5 py-4 bg-transparent border border-neutral-300 dark:border-neutral-700 rounded-2xl text-sm focus:border-black dark:focus:border-white outline-none transition-colors"
                        placeholder="Nhập số điện thoại"
                      />
                    </div>
                    <div className="relative">
                      <label className="absolute -top-2.5 left-3 bg-white dark:bg-neutral-900 px-1 text-xs text-neutral-500 font-medium z-10">Ngày sinh</label>
                      <input 
                        type="date"
                        value={dateOfBirth} onChange={e => setDateOfBirth(e.target.value)}
                        className="w-full px-5 py-4 bg-transparent border border-neutral-300 dark:border-neutral-700 rounded-2xl text-sm focus:border-black dark:focus:border-white outline-none transition-colors"
                      />
                    </div>

                    {/* Address Box */}
                    <div className="mt-6 bg-neutral-50 dark:bg-neutral-800/50 rounded-2xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border border-neutral-200 dark:border-neutral-800">
                      <div>
                        <p className="text-xs text-neutral-500 font-medium mb-1">Địa chỉ mặc định</p>
                        <p className="text-sm font-medium text-black dark:text-white">
                          {defaultAddress 
                            ? `${defaultAddress.streetAddress}, ${defaultAddress.wardName}, ${defaultAddress.districtName}, ${defaultAddress.provinceName}`
                            : 'Chưa thiết lập địa chỉ mặc định'}
                        </p>
                      </div>
                      <Link to="/addresses" className="shrink-0 px-4 py-2 rounded-xl border border-black dark:border-white text-black dark:text-white text-xs font-bold hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors">
                        Quản lý địa chỉ
                      </Link>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Status Card */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className="mt-6 bg-white dark:bg-neutral-900 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-800 p-6 flex flex-col sm:flex-row justify-between items-center gap-6"
              >
                <div>
                  <h3 className="flex items-center gap-2 text-base font-bold text-black dark:text-white mb-3">
                    <CheckCircle2 size={20} className="text-black dark:text-white" /> Trạng thái tài khoản
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-4 py-1.5 bg-green-600 text-white text-xs font-bold rounded-full uppercase tracking-wider">
                      Tài khoản hoạt động
                    </span>
                  </div>
                </div>
                <button 
                  type="submit"
                  className="w-full sm:w-auto px-8 py-3.5 bg-black hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-black rounded-xl font-bold shadow-md transition-all shrink-0"
                >
                  Lưu thay đổi
                </button>
              </motion.div>
            </form>
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-6">
            
            {/* Password Card */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="bg-white dark:bg-neutral-900 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-800 p-6 lg:p-8"
            >
              <h3 className="flex items-center gap-2 text-lg font-bold text-black dark:text-white mb-6">
                <Shield size={20} /> Bảo mật
              </h3>

              <form onSubmit={handleUpdatePassword} className="space-y-5">
                <div className="relative">
                  <input 
                    type={showPwd.current ? "text" : "password"}
                    value={currentPassword} onChange={e => setCurrentPassword(e.target.value)}
                    placeholder="Mật khẩu hiện tại"
                    className="w-full pl-5 pr-10 py-4 bg-neutral-50 dark:bg-neutral-800 border border-transparent rounded-2xl text-sm focus:border-black dark:focus:border-white outline-none transition-all"
                  />
                  <button type="button" onClick={() => setShowPwd(s => ({ ...s, current: !s.current }))} className="absolute right-4 top-4 text-neutral-400 hover:text-black dark:hover:text-white transition-colors">
                    {showPwd.current ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <div className="relative">
                  <input 
                    type={showPwd.new ? "text" : "password"}
                    value={newPassword} onChange={e => setNewPassword(e.target.value)}
                    placeholder="Mật khẩu mới"
                    className="w-full pl-5 pr-10 py-4 bg-neutral-50 dark:bg-neutral-800 border border-transparent rounded-2xl text-sm focus:border-black dark:focus:border-white outline-none transition-all"
                  />
                  <button type="button" onClick={() => setShowPwd(s => ({ ...s, new: !s.new }))} className="absolute right-4 top-4 text-neutral-400 hover:text-black dark:hover:text-white transition-colors">
                    {showPwd.new ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <div className="relative">
                  <input 
                    type={showPwd.confirm ? "text" : "password"}
                    value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Xác nhận mật khẩu mới"
                    className="w-full pl-5 pr-10 py-4 bg-neutral-50 dark:bg-neutral-800 border border-transparent rounded-2xl text-sm focus:border-black dark:focus:border-white outline-none transition-all"
                  />
                  <button type="button" onClick={() => setShowPwd(s => ({ ...s, confirm: !s.confirm }))} className="absolute right-4 top-4 text-neutral-400 hover:text-black dark:hover:text-white transition-colors">
                    {showPwd.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                <div className="pt-2">
                  <button 
                    type="submit"
                    className="w-full py-4 rounded-2xl border-2 border-black dark:border-white text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black text-sm font-bold transition-colors"
                  >
                    Đổi mật khẩu
                  </button>
                </div>
              </form>
            </motion.div>

          </div>
        </div>
      </div>
    </div>
  );
};
