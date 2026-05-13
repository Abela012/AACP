/**
 * Quick script to check what profileData looks like in the database
 * Run: npx ts-node scratch/check_profile_data.ts
 */
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { extractMetrics } from '../src/modules/marketing-analysis/marketing-analysis.service';
dotenv.config();

async function main() {
    await mongoose.connect(process.env.MONGO_URI!);
    console.log('Connected to MongoDB\n');

    const User = mongoose.connection.collection('users');

    // Get a few advertisers with their profileData
    const advertisers = await User.find({ role: 'advertiser' }).limit(3).toArray();
    
    // Get a few business owners
    const owners = await User.find({ role: 'business_owner' }).limit(3).toArray();

    // Get a few opportunities
    const Opportunity = mongoose.connection.collection('opportunities');
    const opportunities = await Opportunity.find({}).limit(3).toArray();

    console.log('--- ADVERTISERS ---');
    for (const adv of advertisers) {
        console.log('='.repeat(60));
        console.log(`Name: ${adv.firstName} ${adv.lastName} (@${adv.username})`);
        
        const pd = adv.profileData;
        if (!pd) {
            console.log('  profileData: NULL/EMPTY');
        } else {
            const metrics = (extractMetrics as any)(pd);
            console.log('  Extracted Metrics:');
            console.log(`    Followers: ${metrics.followers}`);
            console.log(`    Engagement: ${metrics.engagementRate}%`);
            console.log(`    Niche: ${metrics.niche}`);
            console.log(`    All Niches: ${JSON.stringify(metrics.allNiches)}`);
            console.log(`    Platforms: ${metrics.platforms.join(', ')}`);
        }
        console.log('');
    }

    console.log('\n--- BUSINESS OWNERS ---');
    for (const owner of owners) {
        console.log('='.repeat(60));
        console.log(`Name: ${owner.firstName} ${owner.lastName} (@${owner.username})`);
        
        const pd = owner.profileData;
        if (!pd) {
            console.log('  profileData: NULL/EMPTY');
        } else {
            const metrics = (extractMetrics as any)(pd);
            console.log('  Extracted Metrics:');
            console.log(`    Industry/Niche: ${metrics.niche}`);
            console.log(`    All Niches/Tags: ${JSON.stringify(metrics.allNiches)}`);
        }
    }

    console.log('\n--- OPPORTUNITIES ---');
    for (const opp of opportunities) {
        console.log('='.repeat(60));
        console.log(`Title: ${opp.title}`);
        console.log(`Category: ${opp.category}`);
        console.log(`Budget: ${JSON.stringify(opp.budget)}`);
    }

    await mongoose.disconnect();
    console.log('\nDone!');
    process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
