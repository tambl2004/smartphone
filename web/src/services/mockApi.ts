import productsData from '@data/products.json';
import categoriesData from '@data/categories.json';

import bannersData from '@data/banners.json';
import { Product, Category } from '@types';

// Giả lập delay mạng (để loading skeleton hiển thị mượt mà)
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const mockApi = {
  getProducts: async (filters?: {
    category?: string;
    brand?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    sort?: string;
  }): Promise<Product[]> => {
    await delay(400);
    let list = [...productsData] as unknown as Product[];

    if (filters) {
      if (filters.category && filters.category !== 'all') {
        list = list.filter(p => String(p.categoryId) === String(filters.category));
      }
      if (filters.search) {
        const q = filters.search.toLowerCase().trim();
        list = list.filter(p => p.name.toLowerCase().includes(q) || (p.description || '').toLowerCase().includes(q));
      }
      if (filters.minPrice !== undefined) {
        list = list.filter(p => p.price >= filters.minPrice!);
      }
      if (filters.maxPrice !== undefined) {
        list = list.filter(p => p.price <= filters.maxPrice!);
      }
      if (filters.sort) {
        if (filters.sort === 'price_asc') {
          list.sort((a, b) => a.price - b.price);
        } else if (filters.sort === 'price_desc') {
          list.sort((a, b) => b.price - a.price);
        } else if (filters.sort === 'rating') {
          list.sort((a, b) => b.rating - a.rating);
        } else if (filters.sort === 'featured') {
          list.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
        }
      }
    }
    return list;
  },

  getProductById: async (id: string): Promise<Product | null> => {
    await delay(300);
    const item = productsData.find(p => p.id === id);
    return item ? (item as unknown as Product) : null;
  },

  getCategories: async (): Promise<Category[]> => {
    await delay(200);
    return (categoriesData as Record<string, unknown>[]).map(c => ({ ...c, id: Number(c.id) })) as unknown as Category[];
  },

  getBanners: async () => {
    await delay(200);
    return bannersData;
  }
};
