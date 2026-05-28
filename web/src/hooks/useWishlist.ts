import { create } from 'zustand';
import { useEffect } from 'react';
import type { Product } from '@types';
import toast from 'react-hot-toast';
import { apiClient } from '@services/api-client';
import { getAuth } from '@services/auth.service';

const requireLogin = (message: string) => {
  const shouldLogin = window.confirm(`${message}\n\nBấm Đồng ý để chuyển sang trang đăng nhập.`);
  if (shouldLogin) {
    window.location.assign('/login');
  }
  return shouldLogin;
};

interface WishlistState {
  items: Product[];
  loading: boolean;
  syncFromServer: () => Promise<void>;
  toggleWishlist: (product: Product) => Promise<void>;
}

export const useWishlistStore = create<WishlistState>()((set, get) => ({
  items: [],
  loading: false,
  syncFromServer: async () => {
    const auth = getAuth();
    if (!auth?.token) return;
    set({ loading: true });
    try {
      const result = await apiClient.getWishlist(auth.token);
      if (result.success && result.data) {
        const items = result.data.items.filter((item): item is Product => Boolean(item && typeof item.id === 'number' && typeof item.name === 'string'));
        set({ items });
      }
    } finally {
      set({ loading: false });
    }
  },
  toggleWishlist: async (product) => {
    const auth = getAuth();
    if (!auth?.token) {
      requireLogin('Bạn chưa đăng nhập để lưu yêu thích.');
      return;
    }
    const result = await apiClient.toggleWishlistItem(product.id, auth.token);
    toast.success(result.data?.added ? `Đã thêm ${product.name} vào yêu thích` : `Đã xoá ${product.name} khỏi yêu thích`);
    await get().syncFromServer();
  }
}));

export function useWishlist() {
  const store = useWishlistStore();

  useEffect(() => {
    void store.syncFromServer();
  }, [store.syncFromServer]);

  const isInWishlist = (productId: number) => store.items.some(item => item.id === productId);
  return { ...store, isInWishlist };
}
