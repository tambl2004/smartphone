import { apiRequest } from './api-client';

export interface Promotion {
  id: number;
  code: string;
  discountType: 'percent' | 'fixed';
  discountValue: number;
  minOrderValue: number;
  maxDiscountAmount: number | null;
  startDate: string;
  endDate: string;
  usageLimit: number | null;
  usedCount: number;
  perUserLimit: number;
  isActive: boolean;
}

export const promotionService = {
  async getPromotions(token: string): Promise<Promotion[]> {
    const res = await apiRequest<{ items: Promotion[] }>('/promotions', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data?.items || [];
  },
  
  async createPromotion(data: Partial<Promotion>, token: string) {
    return apiRequest('/promotions', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { Authorization: `Bearer ${token}` }
    });
  },

  async updatePromotion(id: number, data: Partial<Promotion>, token: string) {
    return apiRequest(`/promotions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      headers: { Authorization: `Bearer ${token}` }
    });
  },

  async deletePromotion(id: number, token: string) {
    return apiRequest(`/promotions/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
  },
  
  async validatePromotion(code: string, orderValue: number, token: string) {
    return apiRequest<{ promo: Promotion }>('/promotions/validate', {
      method: 'POST',
      body: JSON.stringify({ code, orderValue }),
      headers: { Authorization: `Bearer ${token}` }
    });
  }
};
