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

  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (process.env.NODE_ENV === 'development' && origin.includes('localhost')) {
          return callback(null, true);
        }
        if (process.env.NODE_ENV === 'test') {
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
