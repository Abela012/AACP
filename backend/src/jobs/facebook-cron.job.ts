import cron from 'node-cron';
import FacebookConnection from '../database/models/FacebookConnection';
import * as FacebookTokenService from '../services/facebook/facebook-token.service';
import logger from '../utils/logger';

/**
 * Initiates cron jobs related to Facebook background processes.
 */
export function initFacebookCronJobs() {
    // Run daily at 02:00 AM server time
    cron.schedule('0 2 * * *', async () => {
        logger.info('[Cron] Starting daily Facebook token refresh & data sync job');
        try {
            await refreshExpiringTokens();
            // Optional: You could also add a syncAllAccountData() here
        } catch (error: any) {
            logger.error(`[Cron] Facebook job failed: ${error.message}`);
        }
    });
}

/**
 * Finds all Facebook API connections whose tokens are expiring within the next 7 days
 * and proactively fetches a new long-lived token.
 */
async function refreshExpiringTokens() {
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    try {
        const expiringConnections = await FacebookConnection.find({
            isActive: true,
            $or: [
                { tokenExpiresAt: { $lte: sevenDaysFromNow } },
                { tokenExpiresAt: { $exists: false } }
            ]
        });

        if (expiringConnections.length === 0) {
            logger.info('[Cron] No Facebook tokens require refreshing today.');
            return;
        }

        logger.info(`[Cron] Found ${expiringConnections.length} expiring connections. Refreshing...`);

        for (const connection of expiringConnections) {
            try {
                // Assuming FacebookTokenService.refreshToken exists and handles the Graph API hit & saving
                // Note: If you don't have this exact method, ensure you implement the exchange flow:
                // GET oauth/access_token?grant_type=fb_exchange_token...
                await FacebookTokenService.refreshToken(connection._id.toString());
                logger.info(`[Cron] Successfully refreshed token for connection ${connection._id}`);
            } catch (err: any) {
                logger.error(`[Cron] Failed to refresh token for connection ${connection._id}: ${err.message}`);
                // Tag connection as having an issue, but don't stop the loop
                await FacebookConnection.findByIdAndUpdate(connection._id, {
                    connectionError: `Token refresh failed: ${err.message}`
                });
            }
        }
    } catch (error: any) {
        logger.error(`[Cron] Error scanning for expiring tokens: ${error.message}`);
    }
}
