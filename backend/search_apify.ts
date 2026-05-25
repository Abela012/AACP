import { ApifyClient } from 'apify-client';

async function search() {
    const client = new ApifyClient({ token: process.env.APIFY_TOKEN || '' });
    const actors = await client.actors().list();
    const myActors = actors.items.map(a => a.name);
    console.log("My Actors:", myActors);
    
    // We can't search the store directly with the official client easily unless we use HTTP, but let's just try another popular one:
    // "clockworks/tiktok-scraper"
    // "clockworks/tiktok-profile-scraper"
    try {
        const run1 = await client.actor('clockworks/tiktok-scraper').call({
            profiles: ['therock'],
            resultsPerPage: 1
        });
        const { items: items1 } = await client.dataset(run1.defaultDatasetId).listItems();
        console.log("clockworks/tiktok-scraper items:", items1.length > 0 ? "Success" : "Empty");
    } catch(e: any) {
        console.error("clockworks/tiktok-scraper error:", e.message);
    }
}

search();
