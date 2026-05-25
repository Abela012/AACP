import { ApifyClient } from 'apify-client';

async function test() {
    const client = new ApifyClient({ token: process.env.APIFY_TOKEN || '' });

    console.log("Testing clockworks/free-tiktok-scraper...");
    try {
        const run1 = await client.actor('clockworks/free-tiktok-scraper').call({
            profiles: ['therock'],
            scrapePosts: true,
            maxPostsPerProfile: 2
        });
        const { items: items1 } = await client.dataset(run1.defaultDatasetId).listItems();
        console.log("clockworks/free-tiktok-scraper items:", JSON.stringify(items1, null, 2));
    } catch(e: any) {
        console.error("clockworks error:", e.message);
    }
    
    console.log("\nTesting official apify/tiktok-profile-scraper...");
    try {
        const run2 = await client.actor('apify/tiktok-profile-scraper').call({
            profiles: ['therock'],
            resultsPerPage: 1
        });
        const { items: items2 } = await client.dataset(run2.defaultDatasetId).listItems();
        console.log("apify/tiktok-profile-scraper items:", JSON.stringify(items2, null, 2));
    } catch(e: any) {
        console.error("apify/tiktok-profile-scraper error:", e.message);
    }
}

test();
