import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import path from 'path';
import { ApifyClient } from 'apify-client';

dotenv.config({ path: path.join(__dirname, '.env') });

import User from './src/database/models/User';

async function run() {
    try {
        await mongoose.connect(process.env.MONGO_URI as string);
        console.log('Connected to DB');

        const apifyToken = process.env.APIFY_TOKEN;
        if (!apifyToken) throw new Error('APIFY_TOKEN not found');

        const client = new ApifyClient({ token: apifyToken });

        // Find users with connected Instagram
        const users = await User.find({ 'connectedAccounts.instagram.connected': true });
        console.log(`Found ${users.length} users with Instagram connected.`);

        for (const user of users) {
            const igAccount = user.connectedAccounts?.instagram;
            if (!igAccount || !igAccount.username) continue;

            const cleanUsername = igAccount.username;
            console.log(`Fetching Instagram data for user: ${cleanUsername}`);

            const run = await client.actor('apify/instagram-profile-scraper').call({
                usernames: [cleanUsername]
            });
            const { items } = await client.dataset(run.defaultDatasetId).listItems();
            if (!items || items.length === 0) {
                console.log(`No data found for ${cleanUsername}`);
                continue;
            }

            const userData: any = items[0];
            const latestPosts = userData?.latestPosts || [];
            
            let avgViews = 0, avgLikes = 0, avgComments = 0;
            let engagementRate = 0;
            let totalLikes = 0;
            
            if (latestPosts.length > 0) {
                const totalPostViews = latestPosts.reduce((s: number, p: any) => s + (p.videoViewCount || 0), 0);
                totalLikes = latestPosts.reduce((s: number, p: any) => s + (p.likesCount || 0), 0);
                const totalPostComments = latestPosts.reduce((s: number, p: any) => s + (p.commentsCount || 0), 0);
                
                avgViews = Math.round(totalPostViews / latestPosts.length);
                avgLikes = Math.round(totalLikes / latestPosts.length);
                avgComments = Math.round(totalPostComments / latestPosts.length);
            }
            
            const followers = userData?.followersCount || 0;
            if (followers > 0 && (avgLikes > 0 || avgComments > 0)) {
                engagementRate = parseFloat((((avgLikes + avgComments) / followers) * 100).toFixed(2));
            }

            // Also check old socialProfiles array
            const metrics = {
                followers,
                following: userData?.followsCount || 0,
                totalPosts: userData?.postsCount || 0,
                totalLikes,
                avgViews,
                avgLikes,
                avgComments,
                engagementRate
            };

            igAccount.metrics = metrics;
            
            // update legacy socialProfiles if exists
            const spIdx = user.socialProfiles.findIndex(p => p.platform.toLowerCase() === 'instagram');
            if (spIdx > -1) {
                user.socialProfiles[spIdx].followers = metrics.followers;
                user.socialProfiles[spIdx].following = metrics.following;
                user.socialProfiles[spIdx].engagementRate = metrics.engagementRate;
            }

            user.markModified('connectedAccounts');
            user.markModified('socialProfiles');

            await user.save();
            console.log(`Updated metrics for ${cleanUsername}: avgViews=${avgViews}, engagementRate=${engagementRate}%`);
        }
    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
}

run();
