import { createApp } from './app';
import { ENV } from './config/env';

const app = createApp();

const server = app.listen(ENV.PORT, '0.0.0.0', () => {
  console.log(`=============================================`);
  console.log(`🚀 MediMate API Server running on port ${ENV.PORT} (0.0.0.0)`);
  console.log(`🌐 Health check: http://localhost:${ENV.PORT}/api/health`);
  console.log(`📱 LAN Mobile endpoint: http://192.168.0.102:${ENV.PORT}/api/health`);
  console.log(`📁 Uploads dir:  ${ENV.UPLOAD_DIR}`);
  console.log(`=============================================`);
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed.');
  });
});
