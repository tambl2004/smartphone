import { findAllUsers } from '../models/user.model.js';

export const getUsers = async () => {
  return findAllUsers();
};