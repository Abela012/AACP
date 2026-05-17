import Analytics, { IAnalytics } from '../../database/models/Analytics';
import Collaboration from '../../database/models/Collaboration';
import { fetchPostMetrics, detectPlatform, SupportedPlatform } from './apify.service';
import logger from '../../utils/logger';

/** Simple in-memory rate limiter: max 10 submissions per minute per collaboration */
const submissionTimestamps: Map<string, number[]> = new Map();
const RATE_LIMIT = 10;
const RATE_WINDOW_MS = 60_000;

const checkRateLimit = (collaborationId: string) => {
    const now = Date.now();
    const timestamps = (submissionTimestamps.get(collaborationId) ?? []).filter(
        (t) => now - t < RATE_WINDOW_MS
    );

    if (timestamps.length >= RATE_LIMIT) {
        throw new Error(
            `Rate limit exceeded: maximum ${RATE_LIMIT} analytics submissions per minute per collaboration.`
        );
    }

    timestamps.push(now);
    submissionTimestamps.set(collaborationId, timestamps);
};

/** ── Submit a post URL for analytics ── */
export const submitAnalytics = async (
    collaborationId: string,
    submittedById: string,
    platform: string,
    postUrl: string,
    notes?: string
): Promise<IAnalytics> => {

    // 1. Rate limit check
    checkRateLimit(collaborationId);

    // 2. Validate the collaboration exists
    const collab = await Collaboration.findById(collaborationId);
    if (!collab) throw new Error('Collaboration not found.');

    // 3. Validate URL — auto-detect the platform from the URL itself
    const detectedPlatform = detectPlatform(postUrl);
    if (!detectedPlatform) {
        throw new Error(
            'Invalid URL. Please paste a direct link to a POST (video/reel/photo), not a profile page.'
        );
    }

    // 4. Create a "pending" record immediately so UI can show it
    const analyticsDoc = await Analytics.create({
        collaborationId,
        submittedBy: submittedById,
        platform: detectedPlatform,
        postUrl,
        notes,
        status: 'pending',
        metrics: { views: 0, likes: 0, comments: 0, shares: 0 },
    });

    // 5. Fire scrape job asynchronously — update doc on completion
    (async () => {
        try {
            const metrics = await fetchPostMetrics(detectedPlatform as SupportedPlatform, postUrl);
            await Analytics.findByIdAndUpdate(analyticsDoc._id, {
                metrics,
                status: 'completed',
                refreshedAt: new Date(),
            });
            logger.info(`[Analytics] Completed scrape for ${postUrl} (id: ${analyticsDoc._id})`);
        } catch (err: any) {
            logger.error(`[Analytics] Scrape failed for ${postUrl}: ${err.message}`);
            await Analytics.findByIdAndUpdate(analyticsDoc._id, {
                status: 'failed',
                errorMessage: err.message,
            });
        }
    })();

    return analyticsDoc;
};

/** ── Get all analytics for a collaboration ── */
export const getAnalyticsByCollaboration = async (
    collaborationId: string
): Promise<IAnalytics[]> => {
    return Analytics.find({ collaborationId })
        .populate('submittedBy', 'firstName lastName profilePicture')
        .sort({ createdAt: -1 });
};

/** ── Refresh a single analytics record ── */
export const refreshAnalytics = async (
    analyticsId: string,
    requestingUserId: string
): Promise<IAnalytics> => {
    const doc = await Analytics.findById(analyticsId);
    if (!doc) throw new Error('Analytics record not found.');

    // Mark as pending immediately
    doc.status = 'pending';
    doc.errorMessage = undefined;
    await doc.save();

    // Fire async refresh
    (async () => {
        try {
            const metrics = await fetchPostMetrics(doc.platform as SupportedPlatform, doc.postUrl);
            await Analytics.findByIdAndUpdate(analyticsId, {
                metrics,
                status: 'completed',
                refreshedAt: new Date(),
            });
            logger.info(`[Analytics] Refreshed ${doc.postUrl} (id: ${analyticsId})`);
        } catch (err: any) {
            logger.error(`[Analytics] Refresh failed for ${doc.postUrl}: ${err.message}`);
            await Analytics.findByIdAndUpdate(analyticsId, {
                status: 'failed',
                errorMessage: err.message,
            });
        }
    })();

    return doc;
};
