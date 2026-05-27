import jwt, { type SignOptions } from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { findUserByEmail } from '../models/user.model.js';
import type { LoginResponseData } from '../types/auth.js';

const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-secret';
const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN ?? '7d') as SignOptions['expiresIn'];

export const loginUser = async ({ email, password }: { email: string; password: string }): Promise<LoginResponseData | null> => {
  const user = await findUserByEmail(email);

  if (!user) {
    return null;
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) {
    return null;
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN },
  );

  return {
    token,
    user: {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      status: user.status,
    },
  };
};
