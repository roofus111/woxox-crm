import mongoose from 'mongoose';
import { env } from './env.js';

let memoryServer: { stop: () => Promise<boolean> } | null = null;

export async function connectDatabase(): Promise<typeof mongoose> {
  mongoose.set('strictQuery', true);

  mongoose.connection.on('connected', () => {
    console.info('[legalos-api] MongoDB connected');
  });

  mongoose.connection.on('error', (err) => {
    console.error('[legalos-api] MongoDB connection error:', err);
  });

  let uri = env.MONGODB_URI;

  if (env.NODE_ENV === 'production' && (env.LEGALOS_USE_MEMORY_MONGO || uri === 'memory')) {
    throw new Error('In-memory MongoDB is not allowed in production');
  }

  if (env.LEGALOS_USE_MEMORY_MONGO || uri === 'memory') {
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    const server = await MongoMemoryServer.create();
    memoryServer = server;
    uri = server.getUri('woxox_legalos');
    console.info('[legalos-api] Using in-memory MongoDB for local development');
  }

  return mongoose.connect(uri, {
    autoIndex: env.NODE_ENV !== 'production',
  });
}

export async function disconnectDatabase(): Promise<void> {
  await mongoose.disconnect();
  if (memoryServer) {
    await memoryServer.stop();
    memoryServer = null;
  }
}
