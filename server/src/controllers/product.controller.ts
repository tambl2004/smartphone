import type { Request, Response } from 'express';
import { createNewProduct, getProduct, getProducts, removeProduct, updateExistingProduct } from '../services/product.service.js';
import { sendError, sendSuccess } from '../utils/api-response.js';
import { parseListQuery } from '../utils/pagination.js';

const toNumber = (value: string | string[] | undefined) => Number(Array.isArray(value) ? value[0] : value);

export const listProducts = async (req: Request, res: Response) => {
  const result = await getProducts(parseListQuery(req.query as Record<string, unknown>));
  return sendSuccess(res, 200, 'Products retrieved successfully', result);
};

export const detailProduct = async (req: Request, res: Response) => {
  const product = await getProduct(toNumber(req.params.id));
  if (!product) return sendError(res, 404, 'Product not found');
  return sendSuccess(res, 200, 'Product found', { item: product });
};

export const createProductHandler = async (req: Request, res: Response) => {
  const id = await createNewProduct(req.body);
  return sendSuccess(res, 201, 'Product created', { id });
};

export const updateProductHandler = async (req: Request, res: Response) => {
  await updateExistingProduct(toNumber(req.params.id), req.body);
  return sendSuccess(res, 200, 'Product updated', null);
};

export const deleteProductHandler = async (req: Request, res: Response) => {
  await removeProduct(toNumber(req.params.id));
  return sendSuccess(res, 200, 'Product deleted', null);
};
