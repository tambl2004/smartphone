import { findAllProducts } from '../models/product.model.js';

export const getProducts = async () => {
  return findAllProducts();
};