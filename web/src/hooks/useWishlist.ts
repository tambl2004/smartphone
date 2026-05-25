import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product } from '@types';
import { STORAGE_KEYS } from '@utils/constants';
import toast from 'react-hot-toast';

interface WishlistState {
  items: Product[];
  toggleWishlist: (product: Product) => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set) => ({
      items: [],
      toggleWishlist: (product) => set((state) => {
        const exists = state.items.some(item => item.id === product.id);
        if (exists) {
          toast.success(`Đã xoá ${product.name} khỏi yêu thích`);
          return { items: state.items.filter(item => item.id !== product.id) };
        }
        toast.success(`Đã thêm ${product.name} vào yêu thích`);
        return { items: [...state.items, product] };
      })
    }),
    {
      name: STORAGE_KEYS.WISHLIST
    }
  )
);

export function useWishlist() {
  const store = useWishlistStore();
  const isInWishlist = (productId: string) => store.items.some(item => item.id === productId);
  return { ...store, isInWishlist };
}
