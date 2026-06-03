import React from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { FloatingCart } from './FloatingCart';
import { ScrollToTop } from '@components/common/ScrollToTop';
import { ChatWidget } from '@components/common/ChatWidget';

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-black font-sans text-black dark:text-white">
      <Navbar />
      <main className="flex-grow flex flex-col w-full relative">{children}</main>
      <Footer />
      <FloatingCart />
      <ChatWidget />
      <ScrollToTop />
    </div>
  );
};
