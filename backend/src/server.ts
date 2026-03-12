import app from './app';
import env from './config/env';
import connectDB from './config/database';
import logger from './utils/logger';
import { Server } from 'http';

// Connect to Database
connectDB();

const PORT = env.PORT || 5000;

const server: Server = app.listen(PORT, () => {
    logger.info(`Server running in ${env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: any, promise: Promise<any>) => {
    logger.error(`Error: ${err.message}`);
    // Close server & exit process
    server.close(() => process.exit(1));
});
