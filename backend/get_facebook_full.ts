import { ApifyClient } from 'apify-client';

async function run() {
    const client = new ApifyClient({ token: process.env.APIFY_TOKEN || '' });
    try {
        const run = await client.actor('clockworks/free-tiktok-scraper').call({
            profiles: ['facebook'],
            scrapePosts: false
        });
        const { items } = await client.dataset(run.defaultDatasetId).listItems();
        console.log("FULL ITEM JSON:");
        console.log(JSON.stringify(items[0], null, 2));
    } catch (e: any) {
        console.error("Error:", e.message);
    }
}

run();
