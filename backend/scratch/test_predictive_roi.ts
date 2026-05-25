/// <reference types="node" />
/**
 * Test predictive ROI with the new dynamic AI logic
 * Run: npx ts-node scratch/test_predictive_roi.ts
 */
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { predictAdvertiserROI } from '../src/modules/marketing-analysis/marketing-analysis.service';
dotenv.config();

async function main() {
    await mongoose.connect(process.env.MONGO_URI!);
    console.log('Connected to MongoDB\n');

    const User = mongoose.connection.collection('users');

    // Get a business owner
    const owner = await User.findOne({ role: 'business_owner' });
    if (!owner) {
        console.log('No business owner found');
        return;
    }

    // Get a few advertisers
    const advertisers = await User.find({ role: 'advertiser' }).limit(3).toArray();

    console.log(`Testing for Business Owner: ${owner.firstName} (${owner.profileData?.industry || 'N/A'})\n`);

    for (const adv of advertisers) {
        console.log('='.repeat(60));
        console.log(`Predicting for: ${adv.firstName} (@${adv.username})`);
        
        try {
            const result = await predictAdvertiserROI(owner._id.toString(), adv._id.toString());
            console.log(`AI Insight: ${result.aiInsight}`);
            console.log(`Metrics:`);
            console.log(`  Est. Reach: ${result.metrics.reach}`);
            console.log(`  Reach Factor: ${result.metrics.reachFactor}`);
            console.log(`  Conv. Rate: ${result.metrics.conversionRate}`);
            console.log(`  Avg. Price: ${result.metrics.avgProductPrice} ETB`);
            console.log(`Month 6 Revenue: ${result.projections[5].revenue} ETB`);
        } catch (e) {
            console.error(`Error for ${adv.firstName}:`, e);
        }
        console.log('');
    }

    await mongoose.disconnect();
    process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
