import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

async function run() {
    await mongoose.connect(process.env.MONGO_URI as string);
    const User = (await import('./src/database/models/User')).default;
    
    // Find the user with tiktokHandle yaikob_9
    const u = await User.findOne({ 
        $or: [
            { 'profileData.tiktokHandle': { $regex: 'yaikob', $options: 'i' } },
            { 'socialProfiles.username': { $regex: 'yaikob', $options: 'i' } },
            { email: { $regex: 'nopara', $options: 'i' } }
        ]
    }).lean() as any;
    
    if (!u) { console.log('User not found'); process.exit(1); }
    
    console.log('=== connectedAccounts ===');
    console.log(JSON.stringify(u.connectedAccounts, null, 2));
    
    console.log('\n=== socialProfiles (metrics only) ===');
    (u.socialProfiles || []).forEach((p: any) => {
        console.log({ platform: p.platform, followers: p.followers, avgViews: p.tiktokAnalytics?.avgViews, er: p.engagementRate });
    });

    console.log('\n=== profileData.tiktok ===');
    console.log(JSON.stringify(u.profileData?.tiktok, null, 2));

    await mongoose.disconnect();
}

run().catch(console.error);
