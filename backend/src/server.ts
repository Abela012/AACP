import env from './config/env';
import { createServer } from 'http';
import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import errorHandler from './middlewares/error.middleware';
import routes from './routes/index';

import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./config/swagger";

import { clerkMiddleware } from "@clerk/express";
import { connectDB, disConnect } from './config/database';
import logger from './utils/logger';
import { initSocket } from './socket/socket';


// Connect to Database
connectDB();



const app: Application = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(helmet());
app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, Postman, etc.)
        if (!origin) return callback(null, true);
        // In development, allow all localhost origins regardless of port
        if (env.NODE_ENV === 'development' && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
            return callback(null, true);
        }
        // Production whitelist from env
        const allowedOrigins = [
            env.CORS_ORIGIN,
            process.env.FRONTEND_URL,
        ].filter(Boolean);
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        callback(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true,
}));


if (env.NODE_ENV === 'development') {
    app.use(morgan('dev'))
}

// Swagger UI
if (process.env.NODE_ENV === 'development') {
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

app.use(clerkMiddleware());

app.use('/api/v1', routes);

app.use(errorHandler);

const PORT = env.PORT || 5000;

const httpServer = createServer(app);

const io = initSocket(httpServer);

(app as any).io = io;


const server = httpServer.listen(Number(PORT), () => {
    logger.info(`Server running in ${env.NODE_ENV} mode on port ${PORT}`);
    logger.info(`Socket.IO ready on ws://localhost:${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: any) => {
    logger.error(`Unhandled Rejection: ${err.message}`);
    server.close(async () => {
        await disConnect();
        process.exit(1);
    });
});

// Handle uncaught exceptions
process.on('uncaughtException', async (err: any) => {
    logger.error(`Uncaught Exception: ${err.message}`);
    await disConnect();
    process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
    logger.info('SIGTERM received — shutting down gracefully');
    server.close(async () => {
        await disConnect();
        process.exit(0);
    });
});

export default app;
