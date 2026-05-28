import { findAllOrders, createOrder, findMyOrders, updateOrderStatus as updateOrderStatusModel, deleteOrder as deleteOrderModel } from '../models/order.model.js';
import type { ListQuery } from '../utils/pagination.js';

export const getOrders = async (query: ListQuery) => findAllOrders(query);

export const placeOrder = async (userId: number, orderData: Parameters<typeof createOrder>[1]) => {
  return createOrder(userId, orderData);
};

export const getMyOrders = async (userId: number) => {
  return findMyOrders(userId);
};

export const updateOrderStatus = async (id: number, status: string) => {
  return updateOrderStatusModel(id, status);
};

export const deleteOrder = async (id: number) => {
  return deleteOrderModel(id);
};
