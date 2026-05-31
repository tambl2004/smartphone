import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Plus, Edit, Trash2, X, Lock, Unlock, ShieldAlert, Mail, Phone, Users as UsersIcon, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { apiClient } from '@services/api-client';
import { getAuth } from '@services/auth.service';
import type { User } from '@types';
import { StatusBadge } from '@components/admin/StatusBadge';
import { ConfirmationModal } from '@components/admin/ConfirmationModal';

export const UsersPage: React.FC = () => {
  const SERVER_BASE = (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000/api').replace('/api', '');
  const getAvatarUrl = (url: string | null | undefined) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `${SERVER_BASE}${url.startsWith('/') ? '' : '/'}${url}`;
  };
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<{
    fullName: string;
    email: string;
    password: string;
    phone: string;
    role: 'user' | 'admin';
    status: 'active' | 'blocked';
  }>({
    fullName: '',
    email: '',
    password: '',
    phone: '',
    role: 'user',
    status: 'active'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [lockTarget, setLockTarget] = useState<User | null>(null);

  const fetchUsers = useCallback(async () => {
    const auth = getAuth();
    if (!auth?.token) return;
    try {
      const params: Record<string, string> = {};
      if (searchQuery) params.search = searchQuery;
      if (filterRole !== 'all') params.role = filterRole;
      const res = await apiClient.getUsers(params, auth.token);
      if (res.data) {
        setUsers(res.data.items);
      }
    } catch (error) {
      console.error('Failed to fetch users', error);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, filterRole]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      setLoading(true);
      void fetchUsers();
    }, 300);
    return () => clearTimeout(debounce);
  }, [fetchUsers]);

  const handleOpenModal = (user?: User) => {
    if (user) {
      if (user.role === 'admin') {
        toast.error('Không thể sửa tài khoản Admin');
        return;
      }
      setEditingUser(user);
      setFormData({
        fullName: user.fullName,
        email: user.email,
        password: '',
        phone: user.phone || '',
        role: user.role,
        status: user.status
      });
    } else {
      setEditingUser(null);
      setFormData({
        fullName: '',
        email: '',
        password: '',
        phone: '',
        role: 'user',
        status: 'active'
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email || (!editingUser && !formData.password)) {
      toast.error('Vui lòng điền đầy đủ họ tên, email và mật khẩu');
      return;
    }
    
    setIsSubmitting(true);
    const auth = getAuth();
    if (!auth?.token) return;

    try {
      const payload: Partial<User> & { password?: string } = {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone || undefined,
        role: formData.role,
        status: formData.status
      };
      if (formData.password) {
        payload.password = formData.password;
      }

      if (editingUser) {
        const res = await apiClient.updateUser(editingUser.id, payload, auth.token);
        if (res.success) {
          toast.success('Cập nhật tài khoản thành công');
          void fetchUsers();
          setIsModalOpen(false);
        } else {
          toast.error(res.message || 'Cập nhật thất bại');
        }
      } else {
        const res = await apiClient.createUser(payload, auth.token);
        if (res.success) {
          toast.success('Thêm tài khoản thành công');
          void fetchUsers();
          setIsModalOpen(false);
        } else {
          toast.error(res.message || 'Thêm thất bại');
        }
      }
    } catch (error: unknown) {
      toast.error('Có lỗi xảy ra: ' + (error instanceof Error ? error.message : String(error)));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const auth = getAuth();
    if (!auth?.token) return;
    
    try {
      const res = await apiClient.deleteUser(deleteTarget.id, auth.token);
      if (res.success) {
        toast.success('Đã xóa tài khoản');
        void fetchUsers();
      } else {
        toast.error(res.message || 'Xóa thất bại');
      }
    } catch {
      toast.error('Có lỗi xảy ra');
    }
    setDeleteTarget(null);
  };

  const handleLock = async () => {
    if (!lockTarget) return;
    const auth = getAuth();
    if (!auth?.token) return;
    
    try {
      const newStatus = lockTarget.status === 'active' ? 'blocked' : 'active';
      const res = await apiClient.updateUser(lockTarget.id, { status: newStatus }, auth.token);
      
      if (res.success) {
        toast.success(newStatus === 'blocked' ? 'Đã khóa tài khoản' : 'Đã mở khóa tài khoản');
        setUsers(users.map(u => u.id === lockTarget.id ? { ...u, status: newStatus } : u));
      } else {
        toast.error(res.message || 'Thao tác thất bại');
      }
    } catch {
      toast.error('Thao tác thất bại');
    }
    setLockTarget(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Quản lý tài khoản</h1>
          <p className="text-sm opacity-40 mt-1">{loading ? 'Đang tải...' : `${users.length} tài khoản hệ thống`}</p>
        </div>
        <button onClick={() => handleOpenModal()} className="h-10 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg flex items-center gap-2 text-sm font-medium transition-all shadow-lg shadow-indigo-500/20">
          <Plus size={18} /> Thêm tài khoản
        </button>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-30" />
          <input type="text" placeholder="Tìm tên, email..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-10 pr-4 bg-white/[0.04] border border-white/[0.08] rounded-lg text-sm placeholder:opacity-30 outline-none focus:border-indigo-500/50 transition-all" />
        </div>
        <div className="flex items-center gap-2">
          {['all', 'admin', 'user'].map(r => (
            <button key={r} onClick={() => setFilterRole(r)}
              className={`h-8 px-3 rounded-full text-xs font-medium transition-all border-none outline-none ${filterRole === r ? 'bg-indigo-600 text-white' : 'bg-white/[0.04] opacity-50 hover:opacity-100 hover:bg-white/[0.08]'}`}>
              {r === 'all' ? 'Tất cả' : r === 'admin' ? 'Admin' : 'Khách hàng'}
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div className="py-16 text-center"><Loader2 size={32} className="animate-spin opacity-20 mx-auto mb-3" /><p className="text-sm opacity-30">Đang tải dữ liệu...</p></div>
      )}

      {!loading && (
        <div className="bg-[#141414] border border-white/[0.06] rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                  <th className="p-4 text-xs font-semibold text-white/40 uppercase tracking-wider">ID</th>
                  <th className="p-4 text-xs font-semibold text-white/40 uppercase tracking-wider text-center">Hình ảnh</th>
                  <th className="p-4 text-xs font-semibold text-white/40 uppercase tracking-wider">Họ và tên</th>
                  <th className="p-4 text-xs font-semibold text-white/40 uppercase tracking-wider">Email</th>
                  <th className="p-4 text-xs font-semibold text-white/40 uppercase tracking-wider">Số điện thoại</th>
                  <th className="p-4 text-xs font-semibold text-white/40 uppercase tracking-wider text-center">Vai trò</th>
                  <th className="p-4 text-xs font-semibold text-white/40 uppercase tracking-wider text-center">Trạng thái</th>
                  <th className="p-4 text-xs font-semibold text-white/40 uppercase tracking-wider text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="p-4 text-sm text-white/60">#{user.id}</td>
                    <td className="p-4 text-center">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs mx-auto overflow-hidden">
                        {getAvatarUrl(user.avatarUrl) ? (
                          <img src={getAvatarUrl(user.avatarUrl)!} alt={user.fullName} className="w-full h-full object-cover" />
                        ) : (
                          user.fullName.charAt(0).toUpperCase()
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-sm font-medium text-white">{user.fullName}</td>
                    <td className="p-4 text-sm text-white/60">
                      <span className="flex items-center gap-1.5"><Mail size={14} className="opacity-50" /> {user.email}</span>
                    </td>
                    <td className="p-4 text-sm text-white/60">
                      {user.phone ? (
                        <span className="flex items-center gap-1.5"><Phone size={14} className="opacity-50" /> {user.phone}</span>
                      ) : '—'}
                    </td>
                    <td className="p-4 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${user.role === 'admin' ? 'bg-purple-500/10 text-purple-400' : 'bg-white/5 text-white/60'}`}>
                        {user.role === 'admin' ? <ShieldAlert size={12} /> : <UsersIcon size={12} />}
                        {user.role === 'admin' ? 'Admin' : 'User'}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex justify-center">
                        <StatusBadge status={user.status as 'active' | 'blocked'} />
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {user.role !== 'admin' ? (
                          <>
                            <button onClick={() => setLockTarget(user)} className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all outline-none border-none ${user.status === 'active' ? 'bg-red-500/[0.08] text-red-400 hover:bg-red-500/[0.15]' : 'bg-emerald-500/[0.08] text-emerald-400 hover:bg-emerald-500/[0.15]'}`} title={user.status === 'active' ? 'Khóa' : 'Mở khóa'}>
                              {user.status === 'active' ? <Lock size={14} /> : <Unlock size={14} />}
                            </button>
                            <button onClick={() => handleOpenModal(user)} className="w-8 h-8 rounded-lg flex items-center justify-center bg-indigo-500/[0.08] text-indigo-400 hover:bg-indigo-500/[0.15] transition-all outline-none border-none" title="Sửa">
                              <Edit size={14} />
                            </button>
                            <button onClick={() => setDeleteTarget(user)} className="w-8 h-8 rounded-lg flex items-center justify-center bg-red-500/[0.08] text-red-400 hover:bg-red-500/[0.15] transition-all outline-none border-none" title="Xóa">
                              <Trash2 size={14} />
                            </button>
                          </>
                        ) : (
                          <span className="text-xs text-white/30 italic mr-2">Admin protected</span>
                        )}
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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-[#1A1A1A] border border-white/[0.08] rounded-2xl w-full max-w-md overflow-hidden">
              <div className="flex items-center justify-between p-5 border-b border-white/[0.06]">
                <h3 className="text-lg font-semibold text-white">{editingUser ? 'Sửa tài khoản' : 'Thêm tài khoản'}</h3>
                <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-white/[0.08] transition-all border-none outline-none"><X size={18} /></button>
              </div>

              <form onSubmit={handleSubmit} className="p-5 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-white/60 mb-1.5">Họ tên <span className="text-red-400">*</span></label>
                  <input type="text" value={formData.fullName} onChange={(e) => setFormData({...formData, fullName: e.target.value})} required
                    className="w-full h-10 px-3 bg-white/[0.04] border border-white/[0.08] rounded-lg text-sm text-white focus:border-indigo-500/50 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-white/60 mb-1.5">Email <span className="text-red-400">*</span></label>
                  <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required
                    className="w-full h-10 px-3 bg-white/[0.04] border border-white/[0.08] rounded-lg text-sm text-white focus:border-indigo-500/50 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-white/60 mb-1.5">Mật khẩu {editingUser ? '(Để trống nếu không đổi)' : <span className="text-red-400">*</span>}</label>
                  <input type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})}
                    required={!editingUser}
                    className="w-full h-10 px-3 bg-white/[0.04] border border-white/[0.08] rounded-lg text-sm text-white focus:border-indigo-500/50 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-white/60 mb-1.5">Số điện thoại</label>
                  <input type="tel" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full h-10 px-3 bg-white/[0.04] border border-white/[0.08] rounded-lg text-sm text-white focus:border-indigo-500/50 outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-white/60 mb-1.5">Vai trò</label>
                    <select value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value as 'user' | 'admin'})}
                      className="w-full h-10 px-3 bg-transparent border border-white/[0.08] dark:border-white/[0.08] border-gray-200 rounded-lg text-sm text-gray-900 dark:text-white outline-none cursor-pointer">
                      <option value="user" className="bg-white dark:bg-[#1A1A1A] text-gray-900 dark:text-white">User</option>
                      <option value="admin" className="bg-white dark:bg-[#1A1A1A] text-gray-900 dark:text-white">Admin</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-white/60 mb-1.5">Trạng thái</label>
                    <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value as 'active' | 'blocked'})}
                      className="w-full h-10 px-3 bg-transparent border border-white/[0.08] dark:border-white/[0.08] border-gray-200 rounded-lg text-sm text-gray-900 dark:text-white outline-none cursor-pointer">
                      <option value="active" className="bg-white dark:bg-[#1A1A1A] text-gray-900 dark:text-white">Hoạt động</option>
                      <option value="blocked" className="bg-white dark:bg-[#1A1A1A] text-gray-900 dark:text-white">Khóa</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  <button type="button" onClick={() => setIsModalOpen(false)}
                    className="flex-1 h-10 bg-white/[0.04] hover:bg-white/[0.08] text-white rounded-lg text-sm font-medium transition-all outline-none border-none">
                    Hủy
                  </button>
                  <button type="submit" disabled={isSubmitting}
                    className="flex-1 h-10 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed outline-none border-none">
                    {isSubmitting ? 'Đang lưu...' : 'Lưu lại'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmationModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Xóa tài khoản"
        message={`Bạn có chắc muốn xóa vĩnh viễn tài khoản "${deleteTarget?.fullName}"?`}
        confirmText="Xóa vĩnh viễn"
        confirmColor="red"
      />

      <ConfirmationModal
        isOpen={!!lockTarget}
        onClose={() => setLockTarget(null)}
        onConfirm={handleLock}
        title={lockTarget?.status === 'active' ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
        message={lockTarget?.status === 'active'
          ? `Bạn có chắc muốn khóa tài khoản "${lockTarget?.fullName}"? Khách hàng sẽ bị đăng xuất và không thể đăng nhập.`
          : `Bạn có chắc muốn mở khóa tài khoản "${lockTarget?.fullName}"?`
        }
        confirmText={lockTarget?.status === 'active' ? 'Khóa' : 'Mở khóa'}
        confirmColor={lockTarget?.status === 'active' ? 'red' : 'emerald'}
      />
    </div>
  );
};
