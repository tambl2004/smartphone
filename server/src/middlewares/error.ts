import type { NextFunction, Request, Response } from 'express';
import { sendError } from '../utils/api-response.js';

type MysqlError = Error & {
  code?: string;
  errno?: number;
  sqlMessage?: string;
};

export const notFound = (req: Request, res: Response) => {
  return sendError(res, 404, `Route ${req.originalUrl} not found`);
};

export const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  void req;
  void next;

  const error = err as MysqlError;

  if (error.code === 'ER_DUP_ENTRY') {
    return sendError(res, 409, 'Duplicate entry', [{ message: error.sqlMessage ?? 'Duplicate entry' }]);
  }

  if (error.code === 'ER_NO_REFERENCED_ROW_2' || error.code === 'ER_ROW_IS_REFERENCED_2') {
    return sendError(res, 400, 'Related record is missing', [{ message: error.sqlMessage ?? 'Related record is missing' }]);
  }

  if (error.code === 'ER_BAD_NULL_ERROR') {
    return sendError(res, 400, 'Missing required value', [{ message: error.sqlMessage ?? 'Missing required value' }]);
  }

  const message = error instanceof Error ? error.message : 'Internal Server Error';

  return sendError(res, 500, message);
};
