import type { Request, Response } from 'express';
import { getOrders, placeOrder, getMyOrders, updateOrderStatus, deleteOrder, cancelMyOrder } from '../services/order.service.js';
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
  try {
    const success = await updateOrderStatus(Number(id), status);
    if (!success) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
    }
    return sendSuccess(res, 200, 'Cập nhật trạng thái đơn hàng thành công', { id: Number(id), status });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message || 'Lỗi khi cập nhật trạng thái đơn hàng' });
  }
};

export const deleteOrderController = async (req: Request, res: Response) => {
  const { id } = req.params;
  const success = await deleteOrder(Number(id));
  if (!success) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }
  return sendSuccess(res, 200, 'Order deleted successfully', null);
};

export const cancelMyOrderController = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { id } = req.params;
  try {
    const success = await cancelMyOrder(Number(id), userId);
    if (!success) {
      return res.status(400).json({ success: false, message: 'Could not cancel order' });
    }
    return sendSuccess(res, 200, 'Order cancelled successfully', null);
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message || 'Error cancelling order' });
  }
};

