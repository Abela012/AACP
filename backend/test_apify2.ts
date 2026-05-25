import { ApifyClient } from 'apify-client';

async function test() {
    const client = new ApifyClient({ token: process.env.APIFY_TOKEN || '' });

    console.log("Testing clockworks/free-tiktok-scraper with khaby.lame...");
    try {
        const run1 = await client.actor('clockworks/free-tiktok-scraper').call({
            profiles: ['khaby.lame'],
            scrapePosts: true,
            maxPostsPerProfile: 1
        });
        const { items: items1 } = await client.dataset(run1.defaultDatasetId).listItems();
        console.log("khaby.lame items:", JSON.stringify(items1.map((i:any) => i.authorMeta?.name), null, 2));
    } catch(e: any) {
        console.error("clockworks error:", e.message);
    }
}

test();
