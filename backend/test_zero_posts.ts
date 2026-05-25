import { ApifyClient } from 'apify-client';
import dotenv from 'dotenv';
dotenv.config();

async function runTest() {
    const apifyToken = process.env.APIFY_TOKEN || '';
    const client = new ApifyClient({ token: apifyToken });

    // Test with various common/corporate usernames to find ones with 0 or few videos
    const usernames = ['microsoft', 'google', 'amazon', 'facebook', 'instagram', 'empty', 'test', 'zero'];

    for (const username of usernames) {
        console.log(`\n--- Testing ${username} with scrapePosts: true ---`);
        try {
            const run = await client.actor('clockworks/free-tiktok-scraper').call({
                profiles: [username],
                scrapePosts: true,
                maxPostsPerProfile: 5
            });
            const { items } = await client.dataset(run.defaultDatasetId).listItems();
            console.log(`Result items count: ${items.length}`);
            if (items.length > 0) {
                console.log(`First item keys:`, Object.keys(items[0]));
                console.log(`Profile item found:`, items.find((item: any) => !item.id) ? 'Yes' : 'No');
            }
        } catch (e: any) {
            console.error(`Error:`, e.message);
        }

        console.log(`\n--- Testing ${username} with scrapePosts: false ---`);
        try {
            const run = await client.actor('clockworks/free-tiktok-scraper').call({
                profiles: [username],
                scrapePosts: false
            });
            const { items } = await client.dataset(run.defaultDatasetId).listItems();
            console.log(`Result items count: ${items.length}`);
            if (items.length > 0) {
                console.log(`First item keys:`, Object.keys(items[0]));
                console.log(`Item structure preview:`, JSON.stringify(items[0]).substring(0, 400));
            }
        } catch (e: any) {
            console.error(`Error:`, e.message);
        }
    }
}

runTest();
