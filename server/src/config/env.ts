import dotenv from 'dotenv';
import path from 'path';

// Load .env from root or server dir
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config();

export const ENV = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '5000', 10),
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  MONGODB_URI: process.env.MONGODB_URI || '',
  JWT_SECRET: process.env.JWT_SECRET || 'roleforge-super-secure-jwt-secret-key-change-in-prod-2025',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || '',
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || '',
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || '',
};

export const getIntegrationStatus = () => {
  return {
    mongoConfigured: Boolean(ENV.MONGODB_URI),
    geminiConfigured: Boolean(ENV.GEMINI_API_KEY),
    openaiConfigured: Boolean(ENV.OPENAI_API_KEY),
    googleOAuthConfigured: Boolean(ENV.GOOGLE_CLIENT_ID),
    cloudinaryConfigured: Boolean(ENV.CLOUDINARY_CLOUD_NAME && ENV.CLOUDINARY_API_KEY),
  };
};

