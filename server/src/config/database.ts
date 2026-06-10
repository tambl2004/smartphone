import mysql from 'mysql2/promise';
import mongoose from 'mongoose';

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

// ─── MongoDB / Mongoose ───────────────────────────────────────────────────────
export const connectMongoDB = async (): Promise<void> => {
  const config = getMongoConfig();

  if (!config) {
    console.warn(
      '[MongoDB] MONGO_URI hoặc MONGO_DB_NAME chưa được cấu hình → bỏ qua kết nối MongoDB.',
    );
    return;
  }

  try {
    await mongoose.connect(config.uri, { dbName: config.dbName });
    console.log(
      `[MongoDB] Kết nối thành công → ${config.uri} (db: ${config.dbName})`,
    );
  } catch (err) {
    console.error('[MongoDB] Kết nối thất bại:', err);
    // Không throw để server vẫn khởi động được với MySQL
  }

  mongoose.connection.on('disconnected', () => {
    console.warn('[MongoDB] Đã mất kết nối MongoDB.');
  });

  mongoose.connection.on('reconnected', () => {
    console.log('[MongoDB] Đã kết nối lại MongoDB.');
  });
};

export const connectDatabase = async () => {
  if (connection) {
    return connection;
  }

  connection = await mysql.createConnection(getMySqlConfig());
  await connection.execute('SELECT 1');

  console.log('MySQL connected successfully');

  try {
    await connection.execute(`
      ALTER TABLE orders MODIFY COLUMN payment_method ENUM('cod', 'bank_transfer', 'credit_card', 'wallet', 'momo') NOT NULL DEFAULT 'cod';
    `);
    console.log('Database migrated: payment_method enum updated to support momo');
  } catch (error) {
    console.error('Failed to run database migration:', error);
  }

  try {
    await connection.execute(`
      ALTER TABLE users ADD COLUMN google_id VARCHAR(255) NULL;
    `);
    console.log('Database migrated: google_id column added to users table');
  } catch (error: any) {
    if (error.code !== 'ER_DUP_FIELDNAME') {
      console.error('Failed to add google_id column:', error);
    }
  }

  return connection;
};

export const getDatabaseConnection = () => {
  if (!connection) {
    throw new Error('Database has not been connected yet. Call connectDatabase() first.');
  }

  return connection;
};
