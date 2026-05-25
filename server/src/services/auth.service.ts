import { findUserByEmail } from '../models/user.model.js';

export type LoginInput = {
  email: string;
  password: string;
};

export const loginUser = async (input: LoginInput) => {
  const user = await findUserByEmail(input.email);

  if (!user) {
    return null;
  }

  const isPasswordValid = user.password === input.password;

  if (!isPasswordValid) {
    return null;
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
  };
};