import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

async function run() {
    await mongoose.connect(process.env.MONGO_URI as string);
    const User = (await import('./src/database/models/User')).default;
    
    // Find users with connectedAccounts.tiktok.metrics where engagementRate is 0 but followers > 0
    const users = await User.find({
        'connectedAccounts.tiktok.connected': true,
        'connectedAccounts.tiktok.metrics.followers': { $gt: 0 },
        'connectedAccounts.tiktok.metrics.engagementRate': 0,
    });

    console.log(`Found ${users.length} users to backfill engagementRate...`);

    for (const user of users) {
        const metrics = (user as any).connectedAccounts?.tiktok?.metrics;
        if (!metrics) continue;

        const { followers, totalLikes, totalPosts, avgLikes, avgComments } = metrics;

        let engagementRate = 0;
        if (followers > 0) {
            if (avgLikes > 0 || avgComments > 0) {
                engagementRate = parseFloat((((avgLikes + avgComments) / followers) * 100).toFixed(2));
            } else if (totalLikes > 0 && totalPosts > 0) {
                // Estimate: avg likes per post / followers
                const avgLikesEstimate = totalLikes / totalPosts;
                engagementRate = parseFloat(((avgLikesEstimate / followers) * 100).toFixed(2));
            }
        }

        console.log(`User ${user.email}: followers=${followers}, totalLikes=${totalLikes}, totalPosts=${totalPosts} → engagementRate=${engagementRate}%`);

        await User.updateOne(
            { _id: user._id },
            { $set: { 'connectedAccounts.tiktok.metrics.engagementRate': engagementRate } }
        );
    }

    console.log('Done!');
    await mongoose.disconnect();
}

run().catch(console.error);
