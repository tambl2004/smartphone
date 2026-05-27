import type { Request, Response } from 'express';
import { loginUser } from '../services/auth.service.js';
import { sendError, sendSuccess } from '../utils/api-response.js';

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body as {
    email?: string;
    password?: string;
  };

  if (!email || !password) {
    return sendError(res, 400, 'Email and password are required', [
      { field: 'email', message: 'email is required' },
      { field: 'password', message: 'password is required' },
    ]);
  }

  const result = await loginUser({ email, password });

  if (!result) {
    return sendError(res, 401, 'Invalid credentials');
  }

  return sendSuccess(res, 200, 'Login successful', result);
};
