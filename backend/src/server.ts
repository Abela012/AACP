import app from './app';
import env from './config/env';
import { connectDB, disConnect } from './config/database';
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



// Handle unhandled promise rejections
process.on("unhandledRejection", async (err: any) => {
    console.log("Unhandled Rejection:", err);
    server.close(async () => {
        await disConnect();
        process.exit(1);
    });
});

//  Handle uncaught exceptions
process.on("uncaughtException", async (err: any) => {
    console.error("Uncaught Exception:", err);
    await disConnect();
    process.exit(1);
});

// Gracefull shutdown
process.on("SIGTERM", async () => {
    console.log("SIGTERM received, shutting down gracefully");
    server.close(async () => {
        await disConnect();
        process.exit(0);
    });
});