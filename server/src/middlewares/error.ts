import type { NextFunction, Request, Response } from 'express';

export const notFound = (req: Request, res: Response) => {
  res.status(404).json({
    message: `Route ${req.originalUrl} not found`,
  });
};

export const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  void req;
  void next;

  const message = err instanceof Error ? err.message : 'Internal Server Error';

  res.status(500).json({
    message,
  });
};