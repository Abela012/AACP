import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import errorHandler from './middlewares/error.middleware';
import routes from './routes/index';
import { clerkMiddleware } from "@clerk/express";

const app: Application = express();

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Security headers
app.use(helmet());

// CORS
app.use(cors());

// Logging
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Routes
app.use(clerkMiddleware());
app.use('/api/v1', routes);

// Error handling
app.use(errorHandler);

export default app;
