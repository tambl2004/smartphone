import React from 'react';
import { Link } from '@routes/router';
import { AlertCircle, Home } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center text-center py-32 px-6 max-w-md mx-auto">
      <div className="w-20 h-20 rounded-full bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center mb-6">
        <AlertCircle size={40} className="text-black dark:text-white" />
      </div>
      <h2 className="text-3xl font-bold tracking-tight text-black dark:text-white mb-3">
        404 - Không tìm thấy trang
      </h2>
      <p className="text-neutral-500 dark:text-neutral-400 mb-8 text-sm">
        Đường dẫn này không tồn tại hoặc đã được di chuyển đi nơi khác.
      </p>
      <Link 
        to="/" 
        className="inline-flex h-11 items-center justify-center bg-black text-white dark:bg-white dark:text-black px-6 font-semibold rounded-md hover:opacity-85 transition-opacity text-sm gap-2 shadow-sm"
      >
        <Home size={16} /> Quay lại trang chủ
      </Link>
    </div>
  );
};
