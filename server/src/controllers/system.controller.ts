import { Request, Response } from 'express';
import { getDbStatus } from '../config/db';
import { getAIConfigStatus } from '../services/ai';
import { ENV } from '../config/env';
import { SystemStatusResponse } from '@roleforge/shared';

export const getSystemStatus = (_req: Request, res: Response): void => {
  const dbStatus = getDbStatus();
  const aiStatus = getAIConfigStatus();

  const response: SystemStatusResponse = {
    healthy: dbStatus.connected,
    timestamp: new Date().toISOString(),
    environment: ENV.NODE_ENV,
    database: {
      connected: dbStatus.connected,
      provider: dbStatus.provider,
      message: dbStatus.message,
    },
    ai: {
      configured: aiStatus.configured,
      activeProvider: aiStatus.activeProvider,
      model: aiStatus.model,
      message: aiStatus.message,
    },
    ocr: {
      available: true,
      engine: 'tesseract.js',
    },
    fileStorage: {
      configured: Boolean(ENV.CLOUDINARY_CLOUD_NAME),
      driver: ENV.CLOUDINARY_CLOUD_NAME ? 'cloudinary' : 'local-disk',
    },
  };

  res.status(200).json({
    success: true,
    data: response,
  });
};

