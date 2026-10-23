import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// 1. Load server-specific environment file (server/.env)
const serverEnvPath = path.resolve(__dirname, '../../.env');
if (fs.existsSync(serverEnvPath)) {
  dotenv.config({ path: serverEnvPath });
}

// 2. Fallback check: also check root .env in case GEMINI_API_KEY was placed at project root
if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY.trim() === '') {
  const rootEnvPath = path.resolve(__dirname, '../../../.env');
  if (fs.existsSync(rootEnvPath)) {
    dotenv.config({ path: rootEnvPath, override: true });
  }
}

export const ENV = {
  PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATABASE_URL: process.env.DATABASE_URL || '',
  JWT_SECRET: process.env.JWT_SECRET || 'medimate_fallback_secret_key_2026',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  // Dynamic getter so changes to environment variables are evaluated immediately
  get GEMINI_API_KEY(): string {
    return (process.env.GEMINI_API_KEY || '').trim();
  },
  get GEMINI_MODEL(): string {
    return (process.env.GEMINI_MODEL || 'gemini-3.6-flash').trim();
  },
  UPLOAD_DIR: path.resolve(__dirname, '../../uploads'),
};

// Safe startup check: Never log the actual API key string
if (!ENV.GEMINI_API_KEY) {
  console.warn('⚠️  [MediMate Server] GEMINI_API_KEY is not configured in server/.env or root .env');
} else {
  console.log('✅ [MediMate Server] GEMINI_API_KEY is detected and active.');
  console.log(`[Gemini] Using model: ${ENV.GEMINI_MODEL}`);
}
