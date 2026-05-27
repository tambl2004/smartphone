import type { Request, Response } from 'express';
import { createNewBrand, getBrand, getBrands, removeBrand, updateExistingBrand } from '../services/brand.service.js';
import { sendError, sendSuccess } from '../utils/api-response.js';

const toNumber = (value: string | string[] | undefined) => Number(Array.isArray(value) ? value[0] : value);

export const listBrands = async (_req: Request, res: Response) => {
  const items = await getBrands();
  return sendSuccess(res, 200, 'Brands retrieved successfully', { items });
};

export const detailBrand = async (req: Request, res: Response) => {
  const item = await getBrand(toNumber(req.params.id));
  if (!item) return sendError(res, 404, 'Brand not found');
  return sendSuccess(res, 200, 'Brand found', { item });
};

export const createBrandHandler = async (req: Request, res: Response) => {
  const id = await createNewBrand(req.body);
  return sendSuccess(res, 201, 'Brand created', { id });
};

export const updateBrandHandler = async (req: Request, res: Response) => {
  await updateExistingBrand(toNumber(req.params.id), req.body);
  return sendSuccess(res, 200, 'Brand updated', null);
};

export const deleteBrandHandler = async (req: Request, res: Response) => {
  await removeBrand(toNumber(req.params.id));
  return sendSuccess(res, 200, 'Brand deleted', null);
};
