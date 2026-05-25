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

import { initSyncJobs } from './jobs/metricSync';
initSyncJobs();



/** Warn if frontend publishable key env and backend secret look like different Clerk instances (common cause of “user not found” on login). */
const logClerkKeyAlignment = () => {
    const pk = process.env.CLERK_PUBLISHABLE_KEY || process.env.VITE_CLERK_PUBLISHABLE_KEY;
    const sk = process.env.CLERK_SECRET_KEY;
    if (!sk) {
        logger.warn('[Clerk] CLERK_SECRET_KEY is not set — authenticated routes will fail.');
        return;
    }
    if (!pk) return;
    const isTest = (k: string) => k.includes('_test_') || k.includes('pk_test') || k.includes('sk_test');
    const isLive = (k: string) => k.includes('_live_') || k.includes('pk_live') || k.includes('sk_live');
    const pkDev = isTest(pk);
    const skDev = isTest(sk);
    const pkProd = isLive(pk);
    const skProd = isLive(sk);
    if ((pkDev && skProd) || (pkProd && skDev)) {
        logger.warn(
            '[Clerk] Publishable key and secret key look like different Clerk environments (test vs live). ' +
                'API-created users will not match the app the browser uses — use matching keys in frontend/.env and backend/.env.'
        );
    }
};
logClerkKeyAlignment();

const app: Application = express();

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.use(helmet());
app.use(cors({
    origin: (origin, callback) => {
        // Log the origin for debugging
        if (process.env.NODE_ENV === 'development') {
            console.log(`[CORS] Request from origin: ${origin}`);
        }

        // Allow requests with no origin (mobile apps, Postman, etc.)
        if (!origin) return callback(null, true);

        // In development, allow all localhost origins
        if (process.env.NODE_ENV === 'development' && origin.includes('localhost')) {
            return callback(null, true);
        }

        // Whitelist from env and common dev ports
        const allowedOrigins = [
            env.CORS_ORIGIN,
            process.env.FRONTEND_URL,
            'http://localhost:5173',
            'http://localhost:3000',
            'https://aacp-frontend-delta.vercel.app'
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
    logger.info(`Socket.IO ready on ${env.NODE_ENV === 'production' ? 'https://aacp.onrender.com' : 'ws://localhost:' + PORT}`);
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
// Trigger nodemon restart
// Trigger nodemon restart
