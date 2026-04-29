import env from './config/env';
import { createServer } from 'http';
import app from './app';
import { connectDB, disConnect } from './config/database';
import logger from './utils/logger';
import { initSocket } from './socket/socket';

// Connect to Database
connectDB();

const PORT = env.PORT || 5000;

// Wrap Express in an HTTP server so Socket.IO can share the port
const httpServer = createServer(app);

// Attach Socket.IO
const io = initSocket(httpServer);

// Make io available to routes if needed
(app as any).io = io;

const server = httpServer.listen(PORT, () => {
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