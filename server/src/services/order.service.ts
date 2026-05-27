import { findAllOrders } from '../models/order.model.js';
import type { ListQuery } from '../utils/pagination.js';

export const getOrders = async (query: ListQuery) => findAllOrders(query);
