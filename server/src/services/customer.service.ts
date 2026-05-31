import { findAllCustomers, updateCustomerStatus, findCustomerOrders, findCustomerById } from '../models/customer.model.js';

export const getCustomers = async (search?: string, status?: string) =>
  findAllCustomers(search, status);

export const toggleCustomerStatus = async (id: number) => {
  const customer = await findCustomerById(id);
  if (!customer) return null;

  const newStatus = customer.status === 'active' ? 'blocked' : 'active';
  const updated = await updateCustomerStatus(id, newStatus);
  return updated ? newStatus : null;
};

export const getCustomerOrders = async (customerId: number) =>
  findCustomerOrders(customerId);
