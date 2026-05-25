import React from 'react';
import { motion } from 'motion/react';

const ZaloIcon = ({ size = 24 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    xmlns="http://www.w3.org/2000/svg"
  >

    <text
      x="32"
      y="40"
      textAnchor="middle"
      fill="#0068FF"
      fontSize="26"
      fontWeight="800"
      fontFamily="Arial, sans-serif"
    >
      Zalo
    </text>
  </svg>
);

export const ZaloContact: React.FC = () => {
  return (
    <motion.a
      href="https://zalo.me/0123456789" // Replace with real Zalo number
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 20, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className="fixed bottom-20 right-6 z-50 p-2 cursor-pointer rounded-full bg-white dark:bg-neutral-900 shadow-lg hover:shadow-xl transition-shadow border border-neutral-200 dark:border-neutral-800 focus:outline-none flex items-center justify-center w-[48px] h-[48px]"
      aria-label="Liên hệ Zalo"
      title="Liên hệ Zalo"
    >
      <ZaloIcon size={32} />
    </motion.a>
  );
};
