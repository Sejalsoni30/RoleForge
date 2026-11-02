import mongoose from 'mongoose';
import { ENV } from './env';

let isConnected = false;
let dbProvider: 'local-mongodb' | 'atlas-mongodb' | 'memory-mongodb' = 'local-mongodb';
let memoryServerInstance: any = null;

export const connectDB = async (): Promise<void> => {
  if (isConnected) return;

  try {
    if (ENV.MONGODB_URI) {
      await mongoose.connect(ENV.MONGODB_URI);
      isConnected = true;
      dbProvider = ENV.MONGODB_URI.includes('mongodb+srv') ? 'atlas-mongodb' : 'local-mongodb';
      console.log(`[Database] Connected successfully to MongoDB (${dbProvider})`);
      return;
    }

    // Try default local mongodb first if URI wasn't specified
    try {
      const defaultLocalUri = 'mongodb://127.0.0.1:27017/roleforge';
      await mongoose.connect(defaultLocalUri, { serverSelectionTimeoutMS: 2000 });
      isConnected = true;
      dbProvider = 'local-mongodb';
      console.log(`[Database] Connected to local MongoDB instance: ${defaultLocalUri}`);
      return;
    } catch (localErr) {
      console.log('[Database] Local MongoDB not running on 27017, initializing embedded in-memory MongoDB engine...');
    }

    // Fallback: Start MongoMemoryServer for instant zero-dependency execution
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    memoryServerInstance = await MongoMemoryServer.create();
    const uri = memoryServerInstance.getUri();
    await mongoose.connect(uri);
    isConnected = true;
    dbProvider = 'memory-mongodb';
    console.log(`[Database] Embedded in-memory MongoDB ready at ${uri}`);
  } catch (error) {
    console.error('[Database] MongoDB connection failed:', error);
    throw error;
  }
};

export const getDbStatus = () => ({
  connected: isConnected,
  provider: dbProvider,
  message: isConnected
    ? `Active (${dbProvider})`
    : 'Not connected. Set MONGODB_URI in .env or run local MongoDB.',
});

export const disconnectDB = async (): Promise<void> => {
  if (!isConnected) return;
  await mongoose.disconnect();
  if (memoryServerInstance) {
    await memoryServerInstance.stop();
  }
  isConnected = false;
};

