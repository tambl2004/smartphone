import http from 'http';
import dotenv from 'dotenv';
import app from './app.js';
import { connectDatabase, connectMongoDB } from './config/database.js';
import { initSocket } from './sockets/chat.socket.js';

dotenv.config();

const PORT = Number(process.env.PORT ?? 5000);

const startServer = async () => {
  // 1. Kết nối MySQL
  await connectDatabase();

  // 2. Kết nối MongoDB (song song, không block MySQL)
  await connectMongoDB();

  // 3. Tạo HTTP server từ Express app (để Socket.IO attach)
  const httpServer = http.createServer(app);

  // 4. Khởi tạo Socket.IO
  initSocket(httpServer);

  // 5. Lắng nghe
  httpServer.listen(PORT, () => {
    console.log(`Backend server is running at http://localhost:${PORT}`);
    console.log(`API docs available at http://localhost:${PORT}/api-docs`);
    console.log(`Socket.IO is ready on ws://localhost:${PORT}`);
  });
};

void startServer();