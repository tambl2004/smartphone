import mysql from 'mysql2/promise';

type DatabaseConnection = mysql.Connection;

type MongoConfig = {
  uri: string;
  dbName: string;
};

let connection: DatabaseConnection | null = null;

const getMySqlConfig = () => {
  const requiredVars = ['MYSQL_HOST', 'MYSQL_USER', 'MYSQL_DATABASE'];
  const missingVars = requiredVars.filter((key) => !process.env[key]);

  if (missingVars.length > 0) {
    throw new Error(`Missing required MySQL environment variables: ${missingVars.join(', ')}`);
  }

  return {
    host: process.env.MYSQL_HOST as string,
    port: Number(process.env.MYSQL_PORT ?? 3306),
    user: process.env.MYSQL_USER as string,
    password: process.env.MYSQL_PASSWORD ?? '',
    database: process.env.MYSQL_DATABASE as string,
  };
};

export const getMongoConfig = (): MongoConfig | null => {
  const uri = process.env.MONGO_URI;
  const dbName = process.env.MONGO_DB_NAME;

  if (!uri || !dbName) {
    return null;
  }

  return { uri, dbName };
};

export const connectDatabase = async () => {
  if (connection) {
    return connection;
  }

  connection = await mysql.createConnection(getMySqlConfig());
  await connection.execute('SELECT 1');

  console.log('MySQL connected successfully');

  return connection;
};

export const getDatabaseConnection = () => {
  if (!connection) {
    throw new Error('Database has not been connected yet. Call connectDatabase() first.');
  }

  return connection;
};
