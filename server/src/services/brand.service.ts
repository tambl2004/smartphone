import { createBrand, deleteBrand, findAllBrands, findBrandById, updateBrand, type BrandPayload } from '../models/brand.model.js';

export const getBrands = async () => findAllBrands();
export const getBrand = async (id: number) => findBrandById(id);
export const createNewBrand = async (payload: BrandPayload) => createBrand(payload);
export const updateExistingBrand = async (id: number, payload: BrandPayload) => updateBrand(id, payload);
export const removeBrand = async (id: number) => deleteBrand(id);
