import type { Product, Category } from '@types';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000/api';

export interface ProductListParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  categoryId?: number;
  brand?: string;
  status?: string;
}

export interface ProductListMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ProductListResult {
  items: Product[];
  meta: ProductListMeta;
}

async function get<T>(path: string): Promise<{ ok: boolean; data?: T; message?: string }> {
  try {
    const res = await fetch(`${API_BASE}${path}`);
    const json = await res.json() as { success: boolean; data?: T; message?: string };
    return { ok: json.success, data: json.data, message: json.message };
  } catch {
    return { ok: false, message: 'Không thể kết nối đến máy chủ' };
  }
}

async function adminRequest<T>(path: string, method: 'POST' | 'PUT' | 'DELETE', body?: unknown): Promise<{ ok: boolean; data?: T; message?: string }> {
  try {
    const token = localStorage.getItem('auth_token:v1');
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
    const json = await res.json() as { success: boolean; data?: T; message?: string };
    return { ok: json.success, data: json.data, message: json.message };
  } catch {
    return { ok: false, message: 'Không thể kết nối đến máy chủ' };
  }
}

export const getProducts = async (params?: ProductListParams): Promise<ProductListResult> => {
  const query = new URLSearchParams();
  if (params?.page) query.set('page', String(params.page));
  if (params?.limit) query.set('limit', String(params.limit));
  if (params?.search) query.set('search', params.search);
  if (params?.sortBy) query.set('sortBy', params.sortBy);
  if (params?.sortOrder) query.set('sortOrder', params.sortOrder);
  if (params?.categoryId) query.set('categoryId', String(params.categoryId));
  if (params?.brand) query.set('brand', params.brand);
  if (params?.status) query.set('status', params.status);

  const qs = query.toString() ? `?${query.toString()}` : '';
  const res = await get<ProductListResult>(`/products${qs}`);
  return res.data ?? { items: [], meta: { page: 1, limit: 20, total: 0, totalPages: 1 } };
};

export const getProductById = async (id: number): Promise<Product | null> => {
  const res = await get<{ item: Product }>(`/products/${id}`);
  return res.data?.item ?? null;
};

export const getCategories = async (): Promise<Category[]> => {
  const res = await get<{ items: Category[] }>('/categories');
  return res.data?.items ?? [];
};

export const createProduct = async (data: Partial<Product>) => {
  return await adminRequest<{ id: number }>('/products', 'POST', data);
};

export const updateProduct = async (id: number, data: Partial<Product>) => {
  return await adminRequest<null>(`/products/${id}`, 'PUT', data);
};

export const deleteProduct = async (id: number) => {
  return await adminRequest<null>(`/products/${id}`, 'DELETE');
};
