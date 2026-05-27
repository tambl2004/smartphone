import { createCategory, deleteCategory, findAllCategories, findCategoryById, updateCategory, type CategoryPayload } from '../models/category.model.js';

export const getCategories = async () => findAllCategories();
export const getCategory = async (id: number) => findCategoryById(id);
export const createNewCategory = async (payload: CategoryPayload) => createCategory(payload);
export const updateExistingCategory = async (id: number, payload: CategoryPayload) => updateCategory(id, payload);
export const removeCategory = async (id: number) => deleteCategory(id);
