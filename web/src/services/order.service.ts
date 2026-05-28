import { apiRequest } from './api-client';

export interface OrderItem {
  productId: number;
  productName: string;
  productImage: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface OrderPayload {
  orderCode: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  subtotalAmount: number;
  discountAmount: number;
  totalAmount: number;
  paymentMethod: string;
  promotionId?: number;
  promotionCode?: string;
  cartItems: OrderItem[];
}

export interface OrderRecord {
  id: number;
  orderCode: string;
  subtotalAmount: number;
  discountAmount: number;
  promotionCode: string | null;
  totalAmount: number;
  status: string;
  createdAt: string;
  paymentMethod: string;
  shippingAddress: string;
  customerName: string;
  customerEmail?: string;
  customerPhone: string;
  items: OrderItem[];
}

export const orderService = {
  async placeOrder(payload: OrderPayload, token: string) {
    return apiRequest<{ id: number; orderCode: string }>('/orders', {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: { Authorization: `Bearer ${token}` }
    });
  },

  async getMyOrders(token: string) {
    const res = await apiRequest<{ items: OrderRecord[] }>('/orders/my-orders', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return (res.data as unknown as OrderRecord[]) || [];
  },

  async getAllOrders(token: string, search?: string, status?: string) {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (status && status !== 'all') params.append('status', status);

    const res = await apiRequest<{ items: OrderRecord[] }>(`/orders?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    // In admin listOrders, result is { items, meta }. 
    // Wait, the sendSuccess formats it as { success, data, message }.
    // So res.data is { items, meta }.
    return res.data as { items: OrderRecord[], meta: Record<string, unknown> };
  },

  async updateOrderStatus(id: number, status: string, token: string) {
    return apiRequest(`/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
      headers: { Authorization: `Bearer ${token}` }
    });
  },

  async deleteOrder(id: number, token: string) {
    return apiRequest(`/orders/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
  }
};
