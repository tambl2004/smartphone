import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { sendError } from '../utils/api-response.js';
import type { JwtRole, JwtUserPayload } from '../types/auth.js';

declare global {
  namespace Express {
    interface Request {
      user?: JwtUserPayload;
    }
  }
}

const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-secret';

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const header = req.headers.authorization;

  if (!header?.startsWith('Bearer ')) {
    return sendError(res, 401, 'Unauthorized');
  }

  try {
    const token = header.replace('Bearer ', '');
    const decoded = jwt.verify(token, JWT_SECRET) as JwtUserPayload;
    req.user = decoded;
    return next();
  } catch {
    return sendError(res, 401, 'Invalid token');
  }
};

export const authorizeRoles = (...roles: JwtRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return sendError(res, 401, 'Unauthorized');
    }

    if (!roles.includes(req.user.role)) {
      return sendError(res, 403, 'Forbidden');
    }

    return next();
  };
};
