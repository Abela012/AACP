import FacebookConnection from '../../database/models/FacebookConnection';
import { encrypt, decrypt } from '../../utils/encryption';
import { exchangeForLongLivedToken, debugToken } from './facebook-graph.service';
import logger from '../../utils/logger';

/**
 * Facebook Token Management Service
 *
 * Handles secure storage, retrieval, exchange, and refresh of Facebook tokens.
 * All tokens are encrypted at rest using AES-256-GCM.
 */

/**
 * Store a Facebook access token securely.
 * Automatically exchanges short-lived tokens for long-lived ones.
 */
export async function storeToken(
    connectionId: string,
    rawToken: string,
    autoExchange: boolean = true
): Promise<{ token: string; expiresAt: Date | null; tokenType: 'short_lived' | 'long_lived' }> {
    let tokenToStore = rawToken;
    let expiresAt: Date | null = null;
    let tokenType: 'short_lived' | 'long_lived' = 'short_lived';

    if (autoExchange) {
        try {
            const longLived = await exchangeForLongLivedToken(rawToken);
            tokenToStore = longLived.access_token;
            tokenType = 'long_lived';

            if (longLived.expires_in) {
                expiresAt = new Date(Date.now() + longLived.expires_in * 1000);
            }

            logger.info(`[TokenService] Exchanged to long-lived token for connection ${connectionId}`);
        } catch (error: any) {
            // If exchange fails (e.g., no app secret configured), store original token
            logger.warn(
                `[TokenService] Long-lived exchange failed, storing short-lived token: ${error.message}`
            );
        }
    }

    // Debug token to get scopes and validity info
    let scopes: string[] = [];
    try {
        const debug = await debugToken(tokenToStore);
        scopes = debug.scopes || [];

        if (!expiresAt && debug.expires_at) {
            expiresAt = new Date(debug.expires_at * 1000);
        }
    } catch (error: any) {
        logger.warn(`[TokenService] Token debug failed: ${error.message}`);
    }

    // Encrypt and store
    const encryptedToken = encrypt(tokenToStore);

    await FacebookConnection.findByIdAndUpdate(connectionId, {
        accessToken: encryptedToken,
        tokenExpiresAt: expiresAt,
        tokenType,
        scopes,
        lastTokenRefresh: new Date(),
        connectionError: null,
        isActive: true,
    });

    return { token: tokenToStore, expiresAt, tokenType };
}

/**
 * Retrieve and decrypt a token for a connection.
 * Throws if the connection is inactive or token is expired.
 */
export async function getDecryptedToken(connectionId: string): Promise<string> {
    const connection = await FacebookConnection.findById(connectionId);

    if (!connection) {
        throw new Error('Facebook connection not found');
    }

    if (!connection.isActive) {
        throw new Error('Facebook connection is inactive. Please reconnect.');
    }

    // Check if token is expired
    if (connection.tokenExpiresAt && connection.tokenExpiresAt < new Date()) {
        // Mark as inactive
        await FacebookConnection.findByIdAndUpdate(connectionId, {
            isActive: false,
            connectionError: 'Token has expired. Please reconnect your Facebook account.',
        });
        throw new Error('Facebook token has expired. Please reconnect.');
    }

    // Warn if token expires within 7 days
    if (connection.tokenExpiresAt) {
        const daysRemaining = Math.floor(
            (connection.tokenExpiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        );
        if (daysRemaining <= 7) {
            logger.warn(
                `[TokenService] Token for connection ${connectionId} expires in ${daysRemaining} days`
            );
        }
    }

    return decrypt(connection.accessToken);
}

/**
 * Get decrypted token by Clerk user ID.
 * Returns the first active connection's token.
 */
export async function getDecryptedTokenByClerkId(clerkId: string): Promise<{
    token: string;
    connectionId: string;
}> {
    const connection = await FacebookConnection.findOne({
        clerkId,
        isActive: true,
    }).sort({ updatedAt: -1 }); // Most recently updated

    if (!connection) {
        throw new Error('No active Facebook connection found. Please connect your Facebook account.');
    }

    const connId = connection._id.toString();
    const token = await getDecryptedToken(connId);
    return { token, connectionId: connId };
}

/**
 * Check all connections and flag those with expiring tokens.
 * Intended to be called by a scheduled job.
 */
export async function flagExpiringTokens(daysThreshold: number = 7): Promise<number> {
    const thresholdDate = new Date(Date.now() + daysThreshold * 24 * 60 * 60 * 1000);

    const result = await FacebookConnection.updateMany(
        {
            isActive: true,
            tokenExpiresAt: { $lt: thresholdDate, $gt: new Date() },
        },
        {
            connectionError: `Token expires within ${daysThreshold} days. Please reconnect.`,
        }
    );

    if (result.modifiedCount > 0) {
        logger.warn(
            `[TokenService] Flagged ${result.modifiedCount} connections with expiring tokens`
        );
    }

    // Mark truly expired tokens as inactive
    const expired = await FacebookConnection.updateMany(
        {
            isActive: true,
            tokenExpiresAt: { $lt: new Date() },
        },
        {
            isActive: false,
            connectionError: 'Token has expired. Please reconnect your Facebook account.',
        }
    );

    if (expired.modifiedCount > 0) {
        logger.warn(`[TokenService] Deactivated ${expired.modifiedCount} expired connections`);
    }

    return result.modifiedCount + expired.modifiedCount;
}

/**
 * Proactively refresh an expiring token by re-exchanging it.
 */
export async function refreshToken(connectionId: string): Promise<void> {
    const connection = await FacebookConnection.findById(connectionId);
    if (!connection) throw new Error('Connection not found');

    try {
        const decryptedToken = decrypt(connection.accessToken);
        // Try to re-exchange the currently stored token
        await storeToken(connectionId, decryptedToken, true);
    } catch (error: any) {
        logger.error(`[TokenService] Failed to refresh token for connection ${connectionId}: ${error.message}`);
        throw error;
    }
}
