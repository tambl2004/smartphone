import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Bell, Sun, Moon, User, ChevronDown, LogOut, Settings, Menu } from 'lucide-react';
import { useRouter } from '@routes/router';
import { getAuth } from '../../services/auth.service';

interface AdminNavbarProps {
  sidebarWidth: number;
  isDark: boolean;
  onToggleTheme: () => void;
  onToggleSidebar: () => void;
}

export const AdminNavbar: React.FC<AdminNavbarProps> = ({ sidebarWidth, isDark, onToggleTheme, onToggleSidebar }) => {
  const { navigate } = useRouter();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [user, setUser] = useState(() => getAuth()?.user || null);

  React.useEffect(() => {
    const handleStorageChange = () => setUser(getAuth()?.user || null);
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const notifications = [
    { id: 1, text: 'Đơn hàng mới #ORD-2024-009', time: '2 phút trước', unread: true },
    { id: 2, text: 'Xiaomi 14 Ultra sắp hết hàng (còn 8)', time: '15 phút trước', unread: true },
    { id: 3, text: 'Khách hàng mới đăng ký', time: '1 giờ trước', unread: false },
    { id: 4, text: 'Đơn hàng #ORD-2024-006 đã giao thành công', time: '3 giờ trước', unread: false },
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  // Themed classes
  const headerBg = isDark ? 'bg-[#0F0F0F]/80' : 'bg-white/80';
  const borderColor = isDark ? 'border-white/[0.06]' : 'border-black/[0.06]';
  const searchBg = isDark ? 'bg-white/[0.04] border-white/[0.08]' : 'bg-black/[0.03] border-black/[0.08]';
  const searchText = isDark ? 'text-white placeholder:text-white/30' : 'text-[#1d1d1f] placeholder:text-black/30';
  const iconColor = isDark ? 'text-white/40 hover:text-white/80 hover:bg-white/[0.06]' : 'text-black/40 hover:text-black/80 hover:bg-black/[0.06]';
  const dropdownBg = isDark ? 'bg-[#1A1A1A] border-white/[0.08]' : 'bg-white border-black/[0.08]';
  const dropdownText = isDark ? 'text-white' : 'text-[#1d1d1f]';
  const dropdownTextSub = isDark ? 'text-white/80' : 'text-black/70';
  const dropdownTextMuted = isDark ? 'text-white/30' : 'text-black/30';
  const dropdownHover = isDark ? 'hover:bg-white/[0.03]' : 'hover:bg-black/[0.03]';
  const dropdownDivider = isDark ? 'border-white/[0.06]' : 'border-black/[0.06]';
  const dotBg = isDark ? 'bg-indigo-400' : 'bg-indigo-500';
  const unreadBg = isDark ? 'bg-indigo-500/[0.04]' : 'bg-indigo-500/[0.06]';
  const profileTextSub = isDark ? 'text-white/40' : 'text-black/40';
  const menuItemHover = isDark ? 'text-white/60 hover:text-white hover:bg-white/[0.06]' : 'text-black/60 hover:text-black hover:bg-black/[0.06]';

  return (
    <header
      className={`fixed top-0 right-0 h-16 ${headerBg} backdrop-blur-xl border-b ${borderColor} z-40 flex items-center justify-between px-6 transition-colors duration-300`}
      style={{ left: sidebarWidth }}
    >
      {/* Left: Hamburger + Search */}
      <div className="flex items-center gap-3 max-w-md w-full">
        <button
          onClick={onToggleSidebar}
          className={`w-9 h-9 rounded-lg flex items-center justify-center ${iconColor} transition-all duration-200 border-none outline-none flex-shrink-0`}
          title="Thu gọn menu"
        >
          <Menu size={20} />
        </button>
        <div className="relative flex-1">
          <Search size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-white/30' : 'text-black/30'}`} />
          <input
            type="text"
            placeholder="Tìm kiếm sản phẩm, đơn hàng, khách hàng..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className={`w-full h-10 pl-10 pr-4 ${searchBg} rounded-lg text-sm ${searchText} outline-none focus:border-indigo-500/50 transition-all duration-200`}
          />
        </div>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-2">
        {/* Theme Toggle */}
        <button
          onClick={onToggleTheme}
          className={`w-9 h-9 rounded-lg flex items-center justify-center ${iconColor} transition-all duration-200 border-none outline-none`}
          title={isDark ? 'Chế độ sáng' : 'Chế độ tối'}
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => { setShowNotifications(!showNotifications); setShowProfile(false); }}
            className={`relative w-9 h-9 rounded-lg flex items-center justify-center ${iconColor} transition-all duration-200 border-none outline-none`}
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                transition={{ duration: 0.15 }}
                className={`absolute right-0 top-12 w-80 ${dropdownBg} rounded-xl shadow-2xl overflow-hidden`}
              >
                <div className={`px-4 py-3 border-b ${dropdownDivider}`}>
                  <h3 className={`text-sm font-semibold ${dropdownText}`}>Thông báo</h3>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`px-4 py-3 ${dropdownHover} cursor-pointer transition-colors border-b ${isDark ? 'border-white/[0.04]' : 'border-black/[0.04]'} last:border-b-0 ${n.unread ? unreadBg : ''}`}
                    >
                      <div className="flex items-start gap-3">
                        {n.unread && <div className={`w-2 h-2 rounded-full ${dotBg} mt-1.5 flex-shrink-0`} />}
                        <div className={n.unread ? '' : 'pl-5'}>
                          <p className={`text-sm ${dropdownTextSub}`}>{n.text}</p>
                          <p className={`text-xs ${dropdownTextMuted} mt-1`}>{n.time}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Divider */}
        <div className={`w-px h-6 ${isDark ? 'bg-white/[0.08]' : 'bg-black/[0.08]'} mx-1`} />

        {/* Profile */}
        <div className="relative">
          <button
            onClick={() => { setShowProfile(!showProfile); setShowNotifications(false); }}
            className={`flex items-center gap-2.5 px-2 h-9 rounded-lg ${isDark ? 'hover:bg-white/[0.06]' : 'hover:bg-black/[0.06]'} transition-all duration-200 border-none outline-none`}
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center overflow-hidden">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <User size={14} className="text-white" />
              )}
            </div>
            <span className={`text-sm ${isDark ? 'text-white/70' : 'text-black/70'} font-medium hidden sm:block truncate max-w-[120px]`}>
              {user?.fullName || 'Admin'}
            </span>
            <ChevronDown size={14} className={`${isDark ? 'text-white/30' : 'text-black/30'} hidden sm:block`} />
          </button>

          <AnimatePresence>
            {showProfile && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                transition={{ duration: 0.15 }}
                className={`absolute right-0 top-12 w-56 ${dropdownBg} rounded-xl shadow-2xl overflow-hidden`}
              >
                <div className={`px-4 py-3 border-b ${dropdownDivider}`}>
                  <p className={`text-sm font-semibold ${dropdownText}`}>Admin NEXPHONE</p>
                  <p className={`text-xs ${profileTextSub} mt-0.5`}>admin@nexphone.vn</p>
                </div>
                <div className="p-1.5">
                  <button className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm ${menuItemHover} transition-all border-none outline-none`}>
                    <Settings size={16} />
                    Cài đặt
                  </button>
                  <button
                    onClick={() => navigate('/login')}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-red-400/80 hover:text-red-400 hover:bg-red-500/[0.08] transition-all border-none outline-none"
                  >
                    <LogOut size={16} />
                    Đăng xuất
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};
