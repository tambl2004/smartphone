import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useRouter } from '@routes/router';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  FileText,
  BarChart3,
  LogOut,
  ChevronDown,
  Image as ImageIcon,
  Tag,
  Layers,
  Award
} from 'lucide-react';
import logoImg from '../../assets/logo.png';

interface SidebarProps {
  collapsed: boolean;
  isDark: boolean;
}

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
  { icon: Package, label: 'Sản phẩm', path: '/admin/products' },
  { icon: ShoppingCart, label: 'Đơn hàng', path: '/admin/orders' },
  { icon: Users, label: 'Khách hàng', path: '/admin/customers' },
  { 
    icon: FileText, 
    label: 'Nội dung', 
    path: '/admin/content',
    subItems: [
      { icon: ImageIcon, label: 'Banner', path: '/admin/content/banners' },
      { icon: Tag, label: 'Khuyến mãi', path: '/admin/content/promotions' },
      { icon: Layers, label: 'Danh mục', path: '/admin/content/categories' },
      { icon: Award, label: 'Thương hiệu', path: '/admin/content/brands' },
    ]
  },
  { icon: BarChart3, label: 'Báo cáo', path: '/admin/reports' },
];

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, isDark }) => {
  const { path, navigate } = useRouter();
  const [contentExpanded, setContentExpanded] = useState(true);

  const isActive = (itemPath: string) => {
    if (itemPath === '/admin') return path === '/admin';
    return path === itemPath || path.startsWith(itemPath + '/');
  };

  const isContentActive = path.startsWith('/admin/content');

  // Theme classes
  const bg = isDark ? 'bg-[#0F0F0F]' : 'bg-white';
  const borderColor = isDark ? 'border-white/[0.06]' : 'border-black/[0.06]';
  const logoText = isDark ? 'text-white' : 'text-[#1d1d1f]';
  const labelColor = isDark ? 'text-white/30' : 'text-black/60';
  const activeItemBg = isDark ? 'bg-white/[0.1] text-white' : 'bg-black/[0.06] text-black';
  const activeIconColor = isDark ? 'text-indigo-400' : 'text-black';
  const inactiveColor = isDark
    ? 'text-white/50 hover:text-white/80 hover:bg-white/[0.04]'
    : 'text-black/70 hover:text-black hover:bg-black/[0.04]';
  const activeDot = isDark ? 'bg-indigo-400' : 'bg-black';
  const logoutColor = isDark
    ? 'text-white/40 hover:text-red-400 hover:bg-red-500/[0.08]'
    : 'text-black/40 hover:text-red-500 hover:bg-red-500/[0.06]';

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 72 : 260 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className={`fixed left-0 top-0 h-screen ${bg} border-r ${borderColor} z-50 flex flex-col transition-colors duration-300`}
    >
      {/* Logo */}
      <div className={`h-16 flex items-center px-5 border-b ${borderColor}`}>
        <Link to="/admin" className="flex items-center gap-3 no-underline">
          <div className={`w-9 h-9 flex items-center justify-center flex-shrink-0 ${isDark ? 'bg-white rounded-lg p-1' : ''}`}>
            <img src={logoImg} alt="Logo" className="w-full h-full object-contain" />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className={`${logoText} font-bold text-lg tracking-tight whitespace-nowrap`}
              >
                NEXPHONE
              </motion.span>
            )}
          </AnimatePresence>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 overflow-y-auto">
        <AnimatePresence>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={`text-[10px] font-semibold tracking-[0.15em] ${labelColor} uppercase px-3 mb-2 block`}
            >
              Menu chính
            </motion.span>
          )}
        </AnimatePresence>

        <div className="space-y-1 mt-1">
          {menuItems.map((item) => {
            if (item.subItems) {
              return (
                <div key={item.path} className="space-y-1">
                  <button
                    onClick={() => {
                      if (collapsed) {
                        navigate(item.subItems[0].path);
                      } else {
                        setContentExpanded(!contentExpanded);
                      }
                    }}
                    className={`
                      w-full flex items-center gap-3 px-3 h-11 rounded-lg transition-all duration-200 border-none outline-none
                      ${isContentActive && collapsed ? activeItemBg : inactiveColor}
                      ${collapsed ? 'justify-center' : ''}
                    `}
                    title={collapsed ? item.label : undefined}
                  >
                    <item.icon size={20} className={`flex-shrink-0 ${isContentActive && collapsed ? activeIconColor : ''}`} />
                    <AnimatePresence>
                      {!collapsed && (
                        <>
                          <motion.span
                            initial={{ opacity: 0, width: 0 }}
                            animate={{ opacity: 1, width: 'auto' }}
                            exit={{ opacity: 0, width: 0 }}
                            transition={{ duration: 0.2 }}
                            className={`text-sm whitespace-nowrap overflow-hidden font-medium`}
                          >
                            {item.label}
                          </motion.span>
                          <motion.div
                            animate={{ rotate: contentExpanded ? 180 : 0 }}
                            className="ml-auto"
                          >
                            <ChevronDown size={16} className="opacity-50" />
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </button>
                  
                  <AnimatePresence>
                    {!collapsed && contentExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="pl-9 space-y-1 overflow-hidden"
                      >
                        {item.subItems.map(subItem => {
                          const active = isActive(subItem.path);
                          return (
                            <button
                              key={subItem.path}
                              onClick={() => navigate(subItem.path)}
                              className={`
                                w-full flex items-center gap-3 px-3 h-9 rounded-lg transition-all duration-200 border-none outline-none
                                ${active ? activeItemBg : inactiveColor}
                              `}
                            >
                              <subItem.icon size={16} className={`flex-shrink-0 ${active ? activeIconColor : ''}`} />
                              <span className={`text-sm whitespace-nowrap ${active ? 'font-semibold' : 'font-medium'}`}>
                                {subItem.label}
                              </span>
                              {active && (
                                <motion.div
                                  layoutId="sidebar-indicator"
                                  className={`ml-auto w-1.5 h-1.5 rounded-full ${activeDot}`}
                                  transition={{ duration: 0.2 }}
                                />
                              )}
                            </button>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            }

            const active = isActive(item.path);
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`
                  w-full flex items-center gap-3 px-3 h-11 rounded-lg transition-all duration-200 border-none outline-none
                  ${active ? activeItemBg : inactiveColor}
                  ${collapsed ? 'justify-center' : ''}
                `}
                title={collapsed ? item.label : undefined}
              >
                <item.icon size={20} className={`flex-shrink-0 ${active ? activeIconColor : ''}`} />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.2 }}
                      className={`text-sm whitespace-nowrap overflow-hidden ${active ? 'font-semibold' : 'font-medium'}`}
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
                {active && !collapsed && (
                  <motion.div
                    layoutId="sidebar-indicator"
                    className={`ml-auto w-1.5 h-1.5 rounded-full ${activeDot}`}
                    transition={{ duration: 0.2 }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Bottom section */}
      <div className={`p-3 border-t ${borderColor}`}>
        <button
          onClick={() => navigate('/login')}
          className={`
            w-full flex items-center gap-3 px-3 h-11 rounded-lg transition-all duration-200
            ${logoutColor} border-none outline-none
            ${collapsed ? 'justify-center' : ''}
          `}
          title={collapsed ? 'Đăng xuất' : undefined}
        >
          <LogOut size={20} className="flex-shrink-0" />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-sm font-medium whitespace-nowrap"
              >
                Đăng xuất
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.aside>
  );
};
