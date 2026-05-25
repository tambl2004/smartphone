import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Sidebar } from './Sidebar';
import { AdminNavbar } from './AdminNavbar';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const sidebarWidth = sidebarCollapsed ? 72 : 260;

  return (
    <div className={`admin-layout min-h-screen transition-colors duration-300 ${isDark ? 'bg-[#0A0A0A] text-white' : 'bg-[#F5F5F7] text-[#1d1d1f]'}`}
      data-admin-theme={isDark ? 'dark' : 'light'}>
      <Sidebar collapsed={sidebarCollapsed} isDark={isDark} />
      <AdminNavbar
        sidebarWidth={sidebarWidth}
        isDark={isDark}
        onToggleTheme={() => setIsDark(!isDark)}
        onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <motion.main
        initial={false}
        animate={{ marginLeft: sidebarWidth }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className="pt-16 min-h-screen"
      >
        <div className="p-6">
          {children}
        </div>
      </motion.main>
    </div>
  );
};
