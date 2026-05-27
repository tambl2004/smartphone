import { createProduct, deleteProduct, findAllProducts, findProductById, updateProduct, type ProductPayload } from '../models/product.model.js';
import type { ListQuery } from '../utils/pagination.js';

export const getProducts = async (query: ListQuery) => findAllProducts(query);
export const getProduct = async (id: number) => findProductById(id);
export const createNewProduct = async (payload: ProductPayload) => createProduct(payload);
export const updateExistingProduct = async (id: number, payload: ProductPayload) => updateProduct(id, payload);
export const removeProduct = async (id: number) => deleteProduct(id);
