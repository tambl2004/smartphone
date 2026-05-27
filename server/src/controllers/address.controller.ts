import type { Request, Response } from 'express';
import {
  findAddressesByUserId,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  type AddressPayload,
} from '../models/address.model.js';
import { sendError, sendSuccess } from '../utils/api-response.js';

export const getMyAddresses = async (req: Request, res: Response) => {
  if (!req.user) return sendError(res, 401, 'Chưa xác thực');
  
  const addresses = await findAddressesByUserId(req.user.id);
  return sendSuccess(res, 200, 'Lấy danh sách địa chỉ thành công', addresses);
};

export const addAddress = async (req: Request, res: Response) => {
  if (!req.user) return sendError(res, 401, 'Chưa xác thực');
  
  const payload = req.body as AddressPayload;
  
  // Basic validation
  if (!payload.fullName || !payload.phone || !payload.provinceId || !payload.districtId || !payload.wardId || !payload.streetAddress) {
    return sendError(res, 400, 'Vui lòng điền đầy đủ thông tin địa chỉ');
  }

  const newId = await createAddress(req.user.id, payload);
  return sendSuccess(res, 201, 'Thêm địa chỉ mới thành công', { id: newId });
};

export const editAddress = async (req: Request, res: Response) => {
  if (!req.user) return sendError(res, 401, 'Chưa xác thực');
  
  const addressId = Number(req.params.id);
  if (isNaN(addressId)) return sendError(res, 400, 'ID địa chỉ không hợp lệ');

  const payload = req.body as AddressPayload;
  await updateAddress(addressId, req.user.id, payload);
  
  return sendSuccess(res, 200, 'Cập nhật địa chỉ thành công', null);
};

export const removeAddress = async (req: Request, res: Response) => {
  if (!req.user) return sendError(res, 401, 'Chưa xác thực');
  
  const addressId = Number(req.params.id);
  if (isNaN(addressId)) return sendError(res, 400, 'ID địa chỉ không hợp lệ');

  await deleteAddress(addressId, req.user.id);
  return sendSuccess(res, 200, 'Xóa địa chỉ thành công', null);
};

export const setAsDefault = async (req: Request, res: Response) => {
  if (!req.user) return sendError(res, 401, 'Chưa xác thực');
  
  const addressId = Number(req.params.id);
  if (isNaN(addressId)) return sendError(res, 400, 'ID địa chỉ không hợp lệ');

  await setDefaultAddress(addressId, req.user.id);
  return sendSuccess(res, 200, 'Đã đặt làm địa chỉ mặc định', null);
};
