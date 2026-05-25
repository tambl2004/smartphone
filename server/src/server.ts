import dotenv from 'dotenv';
import app from './app.js';
import { connectDatabase } from './config/database.js';

dotenv.config();

const PORT = Number(process.env.PORT ?? 5000);

const startServer = async () => {
  await connectDatabase();

  app.listen(PORT, () => {
    console.log(`Backend server is running at http://localhost:${PORT}`);
  });
};

void startServer();