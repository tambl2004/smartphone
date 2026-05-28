import { create } from 'zustand';
import { useEffect } from 'react';
import type { Product, CartItem } from '@types';
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

const normalizeCartItem = (item: CartItem): CartItem | null => {
  if (!item?.product || typeof item.product.price !== 'number') return null;
  return item;
};

interface CartState {
  items: CartItem[];
  loading: boolean;
  hasFetched: boolean;
  syncFromServer: (force?: boolean) => Promise<void>;
  addToCart: (product: Product, quantity?: number) => Promise<void>;
  removeFromCart: (productId: number) => Promise<void>;
  updateQuantity: (productId: number, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
}

export const useCartStore = create<CartState>()((set, get) => ({
  items: [],
  loading: false,
  hasFetched: false,
  syncFromServer: async (force = false) => {
    if (!force && (get().loading || get().hasFetched)) return;
    const auth = getAuth();
    if (!auth?.token) return;
    set({ loading: true });
    try {
      const result = await apiClient.getCart(auth.token);
      if (result.success && result.data) {
        const items = result.data.items.map(normalizeCartItem).filter((item): item is CartItem => item !== null);
        set({ items, hasFetched: true });
      }
    } finally {
      set({ loading: false });
    }
  },
  addToCart: async (product, quantity = 1) => {
    const auth = getAuth();
    if (!auth?.token) {
      requireLogin('Bạn chưa đăng nhập để thêm vào giỏ hàng.');
      return;
    }
    const existingItem = get().items.find(item => item?.product?.id === product.id);
    const newQuantity = existingItem ? existingItem.quantity + quantity : quantity;
    
    if (newQuantity > product.stock) {
      toast.error(`Sản phẩm này chỉ còn tối đa ${product.stock} sản phẩm.`);
      return;
    }

    await apiClient.upsertCartItem(product.id, newQuantity, auth.token);
    toast.success(`Đã thêm ${product.name} vào giỏ hàng`);
    await get().syncFromServer(true);
  },
  removeFromCart: async (productId) => {
    const auth = getAuth();
    if (!auth?.token) {
      requireLogin('Bạn chưa đăng nhập để xoá sản phẩm khỏi giỏ hàng.');
      return;
    }
    await apiClient.deleteCartItem(productId, auth.token);
    await get().syncFromServer(true);
  },
  updateQuantity: async (productId, quantity) => {
    const auth = getAuth();
    if (!auth?.token) {
      requireLogin('Bạn chưa đăng nhập để cập nhật giỏ hàng.');
      return;
    }
    const existingItem = get().items.find(item => item.product.id === productId);
    if (existingItem && quantity > existingItem.product.stock) {
      toast.error(`Sản phẩm này chỉ còn tối đa ${existingItem.product.stock} sản phẩm.`);
      return;
    }

    if (quantity <= 0) {
      await apiClient.deleteCartItem(productId, auth.token);
    } else {
      await apiClient.upsertCartItem(productId, quantity, auth.token);
    }
    await get().syncFromServer(true);
  },
  clearCart: async () => {
    const auth = getAuth();
    if (!auth?.token) {
      requireLogin('Bạn chưa đăng nhập để xoá toàn bộ giỏ hàng.');
      return;
    }
    await apiClient.clearCart(auth.token);
    set({ items: [], hasFetched: true });
  }
}));

export function useCart() {
  const store = useCartStore();
  const syncFromServer = store.syncFromServer;

  useEffect(() => {
    void syncFromServer();
  }, [syncFromServer]);

  const validItems = store.items.map(normalizeCartItem).filter((item): item is CartItem => item !== null);
  const cartCount = validItems.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = validItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  return { ...store, items: validItems, cartCount, cartTotal };
}
