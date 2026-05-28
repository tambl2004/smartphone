import type { ApiResponse, PaginatedResponse } from '../types/api';
import type { Brand, Category, Product, User } from '../types';

export type Order = Record<string, unknown>;

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

  getBrands: () => request<{ items: Brand[] }>('/brands'),
  createBrand: (payload: Partial<Brand>, token?: string) => request<{ id: number }>('/brands', { method: 'POST', body: JSON.stringify(payload), token }),
  updateBrand: (id: number, payload: Partial<Brand>, token?: string) => request<null>(`/brands/${id}`, { method: 'PUT', body: JSON.stringify(payload), token }),

  getUsers: (params?: ListParams, token?: string) => request<PaginatedResponse<User>['data']>(`/users${toQueryString(params)}`, { token }),
  getOrders: (params?: ListParams, token?: string) => request<PaginatedResponse<Order>['data']>(`/orders${toQueryString(params)}`, { token }),
};
