import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import type { Request, Response } from 'express';
import { sendSuccess, sendError } from '../utils/api-response.js';

// Resolve the path to dvhcvn.json relative to the current file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dvhcvnPath = path.resolve(__dirname, '../data/dvhcvn.json');

// Types for the JSON structure
type Level3 = { level3_id: string; name: string; type: string };
type Level2 = { level2_id: string; name: string; type: string; level3s: Level3[] };
type Level1 = { level1_id: string; name: string; type: string; level2s: Level2[] };

let provinces: Level1[] = [];

// Load data synchronously into memory on startup
try {
  const rawData = fs.readFileSync(dvhcvnPath, 'utf-8');
  const parsedData = JSON.parse(rawData) as { data: Level1[] };
  provinces = parsedData.data;
  console.log(`Loaded ${provinces.length} provinces successfully.`);
} catch (error) {
  console.error('Error loading dvhcvn.json:', error);
}

// 1. Lấy danh sách tất cả Tỉnh/Thành
export const getProvinces = (req: Request, res: Response) => {
  const list = provinces.map(p => ({
    id: p.level1_id,
    name: p.name,
    type: p.type
  }));
  return sendSuccess(res, 200, 'Lấy danh sách tỉnh/thành thành công', list);
};

// 2. Lấy danh sách Quận/Huyện dựa vào ID Tỉnh
export const getDistricts = (req: Request, res: Response) => {
  const { provinceId } = req.params;
  const province = provinces.find(p => p.level1_id === provinceId);
  
  if (!province) {
    return sendError(res, 404, 'Không tìm thấy Tỉnh/Thành phố');
  }

  const list = province.level2s.map(d => ({
    id: d.level2_id,
    name: d.name,
    type: d.type
  }));
  return sendSuccess(res, 200, 'Lấy danh sách quận/huyện thành công', list);
};

// 3. Lấy danh sách Phường/Xã dựa vào ID Tỉnh và ID Huyện
export const getWards = (req: Request, res: Response) => {
  const { provinceId, districtId } = req.params;
  
  const province = provinces.find(p => p.level1_id === provinceId);
  if (!province) return sendError(res, 404, 'Không tìm thấy Tỉnh/Thành');

  const district = province.level2s.find(d => d.level2_id === districtId);
  if (!district) return sendError(res, 404, 'Không tìm thấy Quận/Huyện');

  const list = district.level3s.map(w => ({
    id: w.level3_id,
    name: w.name,
    type: w.type
  }));
  return sendSuccess(res, 200, 'Lấy danh sách phường/xã thành công', list);
};
