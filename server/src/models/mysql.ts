import { getDatabaseConnection } from '../config/database.js';

export const getDb = () => getDatabaseConnection();
