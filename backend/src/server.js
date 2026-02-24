const app = require('./app');
const env = require('./config/env');
const connectDB = require('./config/database');
const logger = require('./utils/logger');

// Connect to Database
connectDB();

const PORT = env.PORT || 5000;

const server = app.listen(PORT, () => {
    logger.info(`Server running in ${env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    logger.error(`Error: ${err.message}`);
    // Close server & exit process
    server.close(() => process.exit(1));
});
