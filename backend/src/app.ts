import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { clerkMiddleware } from '@clerk/express';
import errorHandler from './middlewares/error.middleware';
import routes from './routes/index';
import env from './config/env';

/**
 * Factory for Express app (used by server and Supertest).
 * Does not connect to MongoDB or start HTTP listener.
 */
export function createApp(): Application {
  const app = express();

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));
  app.use(helmet());

  const isDevOrTest =
    process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test';

  const isAllowedDevOrigin = (origin: string): boolean => {
    try {
      const { hostname, port } = new URL(origin);
      const devPorts = new Set(['5173', '3000', '4173', '5174']);
      if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return !port || devPorts.has(port);
      }
      // LAN / link-local — Vite often binds to 169.254.x.x or 192.168.x.x
      if (
        /^192\.168\.\d{1,3}\.\d{1,3}$/.test(hostname) ||
        /^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname) ||
        /^172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3}$/.test(hostname) ||
        /^169\.254\.\d{1,3}\.\d{1,3}$/.test(hostname)
      ) {
        return !port || devPorts.has(port);
      }
    } catch {
      return false;
    }
    return false;
  };

  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (isDevOrTest && isAllowedDevOrigin(origin)) {
          return callback(null, true);
        }
        const allowedOrigins = [
          env.CORS_ORIGIN,
          process.env.FRONTEND_URL,
          'http://localhost:5173',
          'http://localhost:3000',
        ].filter(Boolean);
        if (allowedOrigins.includes(origin)) {
          return callback(null, true);
        }
        callback(new Error(`CORS: origin ${origin} not allowed`));
      },
      credentials: true,
    })
  );

  if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
  }

  app.use(clerkMiddleware());

  app.use('/api/v1', routes);
  app.use(errorHandler);

  return app;
}

export default createApp;
