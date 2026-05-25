import { findAllCategories } from '../models/category.model.js';

export const getCategories = async () => {
  return findAllCategories();
};