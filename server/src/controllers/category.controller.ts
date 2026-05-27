import type { Request, Response } from 'express';
import { createNewCategory, getCategories, getCategory, removeCategory, updateExistingCategory } from '../services/category.service.js';
import { sendError, sendSuccess } from '../utils/api-response.js';

const toNumber = (value: string | string[] | undefined) => Number(Array.isArray(value) ? value[0] : value);

export const listCategories = async (_req: Request, res: Response) => {
  const items = await getCategories();
  return sendSuccess(res, 200, 'Categories retrieved successfully', { items });
};

export const detailCategory = async (req: Request, res: Response) => {
  const item = await getCategory(toNumber(req.params.id));
  if (!item) return sendError(res, 404, 'Category not found');
  return sendSuccess(res, 200, 'Category found', { item });
};

export const createCategoryHandler = async (req: Request, res: Response) => {
  const id = await createNewCategory(req.body);
  return sendSuccess(res, 201, 'Category created', { id });
};

export const updateCategoryHandler = async (req: Request, res: Response) => {
  await updateExistingCategory(toNumber(req.params.id), req.body);
  return sendSuccess(res, 200, 'Category updated', null);
};

export const deleteCategoryHandler = async (req: Request, res: Response) => {
  await removeCategory(toNumber(req.params.id));
  return sendSuccess(res, 200, 'Category deleted', null);
};
