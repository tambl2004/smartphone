import type { ApiResponse, PaginatedResponse } from '../types/api';
import type { Category, Product, User, FAQ, CartItem } from '../types';

export type Order = Record<string, unknown>;

export type AdminCustomer = {
  id: number;
  fullName: string;
  email: string;
  phone: string | null;
  avatarUrl: string | null;
  totalOrders: number;
  totalSpent: string;
  status: 'active' | 'blocked';
  joinDate: string | null;
  lastOrderDate: string | null;
};

export type AdminCustomerOrder = {
  id: number;
  orderCode: string;
  totalAmount: string;
  status: string;
  paymentMethod: string;
  createdAt: string;
  items: { productName: string; productImage: string; quantity: number; unitPrice: string; lineTotal: string }[];
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000/api';

type ApiFetchOptions = RequestInit & {
  token?: string;
};

export type ListParams = {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  [key: string]: string | number | undefined;
};

const toQueryString = (params?: ListParams) => {
  if (!params) return '';

  const query = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      query.set(key, String(value));
    }
  }

  const serialized = query.toString();
  return serialized ? `?${serialized}` : '';
};

async function request<T>(path: string, options: ApiFetchOptions = {}): Promise<ApiResponse<T>> {
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');

  if (options.token) {
    headers.set('Authorization', `Bearer ${options.token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  return response.json();
}

export const apiClient = {
  login: (payload: { email: string; password: string }) =>
    request<{ token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getProducts: (params?: ListParams) => request<PaginatedResponse<Product>['data']>(`/products${toQueryString(params)}`),
  getProduct: (id: number, token?: string) => request<{ item: Product }>(`/products/${id}`, { token }),
  createProduct: (payload: Partial<Product>, token?: string) => request<{ id: number }>(`/products`, { method: 'POST', body: JSON.stringify(payload), token }),
  updateProduct: (id: number, payload: Partial<Product>, token?: string) => request<null>(`/products/${id}`, { method: 'PUT', body: JSON.stringify(payload), token }),
  deleteProduct: (id: number, token?: string) => request<null>(`/products/${id}`, { method: 'DELETE', token }),

  getCategories: () => request<{ items: Category[] }>('/categories'),
  createCategory: (payload: Partial<Category>, token?: string) => request<{ id: number }>('/categories', { method: 'POST', body: JSON.stringify(payload), token }),
  updateCategory: (id: number, payload: Partial<Category>, token?: string) => request<null>(`/categories/${id}`, { method: 'PUT', body: JSON.stringify(payload), token }),
  deleteCategory: (id: number, token?: string) => request<null>(`/categories/${id}`, { method: 'DELETE', token }),

  getFAQs: () => request<{ items: FAQ[] }>('/faqs'),
  createFAQ: (payload: Partial<FAQ>, token?: string) => request<{ id: number }>('/faqs', { method: 'POST', body: JSON.stringify(payload), token }),
  updateFAQ: (id: number, payload: Partial<FAQ>, token?: string) => request<null>(`/faqs/${id}`, { method: 'PUT', body: JSON.stringify(payload), token }),
  deleteFAQ: (id: number, token?: string) => request<null>(`/faqs/${id}`, { method: 'DELETE', token }),

  getUsers: (params?: ListParams, token?: string) => request<PaginatedResponse<User>['data']>(`/users${toQueryString(params)}`, { token }),
  createUser: (payload: Partial<User> & { password?: string }, token?: string) => request<{ id: number }>('/users', { method: 'POST', body: JSON.stringify(payload), token }),
  updateUser: (id: number, payload: Partial<User> & { password?: string }, token?: string) => request<null>(`/users/${id}`, { method: 'PUT', body: JSON.stringify(payload), token }),
  deleteUser: (id: number, token?: string) => request<null>(`/users/${id}`, { method: 'DELETE', token }),
  getOrders: (params?: ListParams, token?: string) => request<PaginatedResponse<Order>['data']>(`/orders${toQueryString(params)}`, { token }),

  getCart: (token: string) => request<{ items: CartItem[] }>('/customers/me/cart', { token }),
  upsertCartItem: (productId: number, quantity: number, token: string) => request<null>(`/customers/me/cart/${productId}`, { method: 'POST', body: JSON.stringify({ quantity }), token }),
  deleteCartItem: (productId: number, token: string) => request<null>(`/customers/me/cart/${productId}`, { method: 'DELETE', token }),
  clearCart: (token: string) => request<null>('/customers/me/cart', { method: 'DELETE', token }),

  getWishlist: (token: string) => request<{ items: Product[] }>('/customers/me/wishlist', { token }),
  toggleWishlistItem: (productId: number, token: string) => request<{ added: boolean }>(`/customers/me/wishlist/${productId}`, { method: 'POST', token }),
  deleteWishlistItem: (productId: number, token: string) => request<null>(`/customers/me/wishlist/${productId}`, { method: 'DELETE', token }),

  // Admin customer management
  // Admin customer management
  getCustomers: (params?: ListParams, token?: string) => request<{ items: AdminCustomer[] }>(`/customers${toQueryString(params)}`, { token }),
  toggleCustomerStatus: (id: number, token?: string) => request<{ status: string }>(`/customers/${id}/status`, { method: 'PATCH', token }),
  getCustomerOrders: (id: number, token?: string) => request<{ items: AdminCustomerOrder[] }>(`/customers/${id}/orders`, { token }),
  
  // Dashboard & Reports
  getDashboardData: (token: string) => request<Record<string, unknown>>('/dashboard/overview', { token }),
};

export { request as apiRequest };
