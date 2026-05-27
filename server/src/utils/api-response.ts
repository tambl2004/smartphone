import type { Response } from 'express';
import type { ApiErrorItem, ApiResponse } from '../types/api.js';

export const sendSuccess = <T>(
  res: Response,
  status: number,
  message: string,
  data: T | null,
) => {
  const payload: ApiResponse<T> = {
    success: true,
    message,
    data,
    errors: null,
  };

  return res.status(status).json(payload);
};

export const sendError = (
  res: Response,
  status: number,
  message: string,
  errors: ApiErrorItem[] | null = null,
) => {
  const payload: ApiResponse<null> = {
    success: false,
    message,
    data: null,
    errors,
  };

  return res.status(status).json(payload);
};
