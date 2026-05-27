import { Router } from 'express';
import { getProvinces, getDistricts, getWards } from '../controllers/location.controller.js';

const router = Router();

/**
 * @openapi
 * /api/locations/provinces:
 *   get:
 *     summary: Lấy danh sách Tỉnh/Thành phố
 *     tags: [Location]
 */
router.get('/provinces', getProvinces);

/**
 * @openapi
 * /api/locations/provinces/{provinceId}/districts:
 *   get:
 *     summary: Lấy danh sách Quận/Huyện theo Tỉnh/Thành phố
 *     tags: [Location]
 */
router.get('/provinces/:provinceId/districts', getDistricts);

/**
 * @openapi
 * /api/locations/provinces/{provinceId}/districts/{districtId}/wards:
 *   get:
 *     summary: Lấy danh sách Phường/Xã theo Tỉnh và Huyện
 *     tags: [Location]
 */
router.get('/provinces/:provinceId/districts/:districtId/wards', getWards);

export default router;
