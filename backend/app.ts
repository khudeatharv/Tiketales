import express from 'express';
import cors from 'cors';

import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import adminRoutes from './routes/adminRoutes';
import movieRoutes from './routes/movieRoutes';
import { initDb } from './config/db';

const parseAllowedOrigins = () => {
  const originEnv = process.env.CORS_ORIGINS || process.env.FRONTEND_URL || '';
  return originEnv
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
};

const isVercelPreviewOrigin = (origin: string) => {
  return origin.endsWith('.vercel.app');
};

export const createApp = () => {
  const app = express();

  initDb().catch((error) => {
    console.error('DB initialization failed', error);
  });
  const allowedOrigins = parseAllowedOrigins();

  app.use(cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin) || isVercelPreviewOrigin(origin)) {
        callback(null, true);
        return;
      }
      callback(null, false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }));

  app.use(express.json());

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, timestamp: new Date().toISOString() });
  });

  // Legacy root routes (local compatibility)
  app.use('/auth', authRoutes);
  app.use('/movies', movieRoutes);
  app.use('/user', userRoutes);
  app.use('/admin', adminRoutes);

  // Production-prefixed API routes
  app.use('/api/auth', authRoutes);
  app.use('/api/movies', movieRoutes);
  app.use('/api/user', userRoutes);
  app.use('/api/admin', adminRoutes);

  app.use('/api/*', (_req, res) => {
    res.status(404).json({ message: 'API route not found' });
  });

  return app;
};
