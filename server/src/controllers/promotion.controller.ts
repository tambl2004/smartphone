import type { Request, Response } from 'express';
import * as promotionModel from '../models/promotion.model.js';
import { sendSuccess, sendError } from '../utils/api-response.js';

export const listPromotions = async (req: Request, res: Response) => {
  try {
    const items = await promotionModel.getAllPromotions();
    return sendSuccess(res, 200, 'Lấy danh sách khuyến mãi thành công', { items });
  } catch (error) {
    console.error(error);
    return sendError(res, 500, 'Lỗi lấy danh sách khuyến mãi');
  }
};

export const getPromotion = async (req: Request, res: Response) => {
  try {
    const { code } = req.params;
    const promo = await promotionModel.getPromotionByCode(code as string);
    if (!promo) return sendError(res, 404, 'Không tìm thấy mã khuyến mãi');
    return sendSuccess(res, 200, 'Lấy mã khuyến mãi thành công', { item: promo });
  } catch (error) {
    console.error(error);
    return sendError(res, 500, 'Lỗi lấy khuyến mãi');
  }
};

export const createPromotion = async (req: Request, res: Response) => {
  try {
    const id = await promotionModel.createPromotion(req.body);
    return sendSuccess(res, 201, 'Tạo mã khuyến mãi thành công', { id });
  } catch (error: any) {
    if (error.code === 'ER_DUP_ENTRY') return sendError(res, 400, 'Mã khuyến mãi đã tồn tại');
    console.error(error);
    return sendError(res, 500, 'Lỗi tạo mã khuyến mãi');
  }
};

export const updatePromotion = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    await promotionModel.updatePromotion(id, req.body);
    return sendSuccess(res, 200, 'Cập nhật mã khuyến mãi thành công', null);
  } catch (error: any) {
    if (error.code === 'ER_DUP_ENTRY') return sendError(res, 400, 'Mã khuyến mãi đã tồn tại');
    console.error(error);
    return sendError(res, 500, 'Lỗi cập nhật mã khuyến mãi');
  }
};

export const deletePromotion = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    await promotionModel.deletePromotion(id);
    return sendSuccess(res, 200, 'Xóa mã khuyến mãi thành công', null);
  } catch (error) {
    console.error(error);
    return sendError(res, 500, 'Lỗi xóa mã khuyến mãi');
  }
};

export const validatePromotion = async (req: Request, res: Response) => {
  try {
    const { code, orderValue } = req.body;
    const userId = req.user?.id;
    if (!userId) return sendError(res, 401, 'Vui lòng đăng nhập');

    const promo = await promotionModel.getPromotionByCode(code);
    if (!promo) return sendError(res, 404, 'Mã khuyến mãi không hợp lệ');

    if (!promo.isActive) return sendError(res, 400, 'Mã khuyến mãi đã bị khóa');

    const now = new Date();
    if (new Date(promo.startDate) > now) return sendError(res, 400, 'Mã khuyến mãi chưa bắt đầu');
    if (new Date(promo.endDate) < now) return sendError(res, 400, 'Mã khuyến mãi đã hết hạn');

    if (promo.minOrderValue > orderValue) return sendError(res, 400, `Đơn hàng tối thiểu ${promo.minOrderValue}đ để sử dụng mã này`);

    if (promo.usageLimit && promo.usedCount >= promo.usageLimit) return sendError(res, 400, 'Mã khuyến mãi đã hết lượt sử dụng');

    const userUsages = await promotionModel.getUserPromotionUsageCount(promo.id, userId);
    if (userUsages >= promo.perUserLimit) return sendError(res, 400, `Bạn đã hết lượt sử dụng mã này (Tối đa ${promo.perUserLimit} lần)`);

    return sendSuccess(res, 200, 'Mã hợp lệ', { promo });
  } catch (error) {
    console.error(error);
    return sendError(res, 500, 'Lỗi kiểm tra mã khuyến mãi');
  }
};
