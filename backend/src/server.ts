import env from './config/env';
import { createServer } from 'http';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger';
import { connectDB, disConnect } from './config/database';
import logger from './utils/logger';
import { initSocket } from './socket/socket';
import { createApp } from './app';
import { initSyncJobs } from './jobs/metricSync';

connectDB();
initSyncJobs();

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
      '[Clerk] Publishable key and secret key look like different Clerk environments (test vs live).'
    );
  }
};
logClerkKeyAlignment();

const app = createApp();

if (env.NODE_ENV === 'development') {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

const PORT = env.PORT || 5000;
const httpServer = createServer(app);
const io = initSocket(httpServer);
(app as any).io = io;

const server = httpServer.listen(Number(PORT), () => {
  logger.info(`Server running in ${env.NODE_ENV} mode on port ${PORT}`);
});

process.on('unhandledRejection', (err: any) => {
  logger.error(`Unhandled Rejection: ${err.message}`);
  server.close(async () => {
    await disConnect();
    process.exit(1);
  });
});

process.on('uncaughtException', async (err: any) => {
  logger.error(`Uncaught Exception: ${err.message}`);
  await disConnect();
  process.exit(1);
});

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
