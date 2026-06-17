import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Sidebar } from './Sidebar';
import { AdminNavbar } from './AdminNavbar';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarCollapsed(true);
      } else {
        setSidebarCollapsed(window.innerWidth < 1024);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const sidebarWidth = isMobile ? 0 : (sidebarCollapsed ? 72 : 260);

  return (
    <div className={`admin-layout min-h-screen transition-colors duration-300 ${isDark ? 'bg-[#0A0A0A] text-white' : 'bg-[#F5F5F7] text-[#1d1d1f]'}`}
      data-admin-theme={isDark ? 'dark' : 'light'}>
      
      {isMobile && !sidebarCollapsed && (
        <div 
          className="fixed inset-0 bg-black/45 backdrop-blur-xs z-[45]"
          onClick={() => setSidebarCollapsed(true)}
        />
      )}

      <Sidebar 
        collapsed={sidebarCollapsed} 
        isDark={isDark} 
        isMobile={isMobile}
        onCloseMobile={() => setSidebarCollapsed(true)}
      />
      <AdminNavbar
        sidebarWidth={sidebarWidth}
        isDark={isDark}
        onToggleTheme={() => setIsDark(!isDark)}
        onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <motion.main
        initial={false}
        animate={{ marginLeft: `${sidebarWidth}px` }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className="pt-16 min-h-screen"
      >
        <div className="p-4 sm:p-6 overflow-x-hidden">
          {children}
        </div>
      </motion.main>
    </div>
  );
};
