import { findAllUsers, findUserByEmail, findUserById } from '../models/user.model.js';
import type { ListQuery } from '../utils/pagination.js';

export const getUsers = async (query: ListQuery) => findAllUsers(query);
export const getUserByEmail = async (email: string) => findUserByEmail(email);
export const getUserById = async (id: number) => findUserById(id);
