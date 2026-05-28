import type { Request, Response } from 'express';
import { getOrders, placeOrder, getMyOrders, updateOrderStatus, deleteOrder } from '../services/order.service.js';
import { sendSuccess } from '../utils/api-response.js';
import { parseListQuery } from '../utils/pagination.js';

export const listOrders = async (req: Request, res: Response) => {
  const result = await getOrders(parseListQuery(req.query as Record<string, unknown>));
  return sendSuccess(res, 200, 'Orders retrieved successfully', result);
};

export const createOrderController = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const orderData = req.body;
  const orderId = await placeOrder(userId, orderData);
  return sendSuccess(res, 201, 'Order placed successfully', { id: orderId, orderCode: orderData.orderCode });
};

export const getMyOrdersController = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const result = await getMyOrders(userId);
  return sendSuccess(res, 200, 'My orders retrieved successfully', result);
};

export const updateOrderStatusController = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  const success = await updateOrderStatus(Number(id), status);
  if (!success) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }
  return sendSuccess(res, 200, 'Order status updated successfully', { id: Number(id), status });
};

export const deleteOrderController = async (req: Request, res: Response) => {
  const { id } = req.params;
  const success = await deleteOrder(Number(id));
  if (!success) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }
  return sendSuccess(res, 200, 'Order deleted successfully', null);
};
