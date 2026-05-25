import type { Request, Response } from 'express';
import { getDevices } from '../services/device.service.js';

export const listDevices = async (_req: Request, res: Response) => {
  const items = await getDevices();

  return res.status(200).json({
    items,
  });
};