import type { Request, Response } from 'express';
import { loginUser } from '../services/auth.service.js';

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body as {
    email?: string;
    password?: string;
  };

  if (!email || !password) {
    return res.status(400).json({
      message: 'Email and password are required',
    });
  }

  const user = await loginUser({ email, password });

  if (!user) {
    return res.status(401).json({
      message: 'Invalid credentials',
    });
  }

  return res.status(200).json({
    message: 'Login successful',
    user,
  });
};