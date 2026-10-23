import express, { Application } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import { ENV } from './config/env';

// Route imports
import authRoutes from './routes/auth.routes';
import prescriptionRoutes from './routes/prescription.routes';
import medicineRoutes from './routes/medicine.routes';
import reminderRoutes from './routes/reminder.routes';
import priceRoutes from './routes/price.routes';
import aiRoutes from './routes/ai.routes';
import adminRoutes from './routes/admin.routes';

// Middleware imports
import { errorHandler, notFoundHandler } from './middleware/error.middleware';

export const createApp = (): Application => {
  const app = express();

  // Core Middlewares
  app.use(
    cors({
      origin: (_origin, callback) => {
        // Allow all origins, including mobile apps with null/exp:// origins
        callback(null, true);
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    })
  );
  app.use(express.json({ limit: '25mb' }));
  app.use(express.urlencoded({ extended: true, limit: '25mb' }));
  app.use(morgan('dev'));

  // Serve uploaded images statically
  app.use('/uploads', express.static(ENV.UPLOAD_DIR));

  // Health check endpoint
  app.get('/api/health', (_req, res) => {
    res.status(200).json({
      status: 'healthy',
      service: 'MediMate Backend API',
      timestamp: new Date().toISOString(),
    });
  });

  // API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/prescriptions', prescriptionRoutes);
  app.use('/api/medicines', medicineRoutes);
  app.use('/api/reminders', reminderRoutes);
  app.use('/api/prices', priceRoutes);
  app.use('/api/ai', aiRoutes);
  app.use('/api/admin', adminRoutes);

  // 404 & Error Handlers
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
