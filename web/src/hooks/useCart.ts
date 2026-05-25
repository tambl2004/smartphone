import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product, CartItem } from '@types';
import { STORAGE_KEYS } from '@utils/constants';
import toast from 'react-hot-toast';

interface CartState {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      addToCart: (product, quantity = 1) => set((state) => {
        const existing = state.items.find(item => item.product.id === product.id);
        toast.success(`Đã thêm ${product.name} vào giỏ hàng`);
        if (existing) {
          return {
            items: state.items.map(item =>
              item.product.id === product.id
                ? { ...item, quantity: item.quantity + quantity }
                : item
            )
          };
        }
        return { items: [...state.items, { product, quantity }] };
      }),
      removeFromCart: (productId) => set((state) => ({
        items: state.items.filter(item => item.product.id !== productId)
      })),
      updateQuantity: (productId, quantity) => set((state) => {
        if (quantity <= 0) {
          return { items: state.items.filter(item => item.product.id !== productId) };
        }
        return {
          items: state.items.map(item =>
            item.product.id === productId ? { ...item, quantity } : item
          )
        };
      }),
      clearCart: () => set({ items: [] })
    }),
    {
      name: STORAGE_KEYS.CART
    }
  )
);

export function useCart() {
  const store = useCartStore();
  const cartCount = store.items.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = store.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  return { ...store, cartCount, cartTotal };
}
