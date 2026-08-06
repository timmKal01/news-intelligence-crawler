import { sources } from './config.js';
import { fingerprint } from './dedupe.js';
import { discover } from './discovery.js';
import { fetchAndParse } from './parser.js';
import { openStore } from './store.js';

async function run(): Promise<void> {
    const store = openStore();
    let discovered = 0;
    let stored = 0;
    let skippedDuplicate = 0;
    let skippedDisallowedOrFailed = 0;

    for (const source of sources) {
        console.log(`[discover] ${source.name}`);
        let items;
        try {
            items = await discover(source);
        } catch (err) {
            console.error(`[discover] ${source.name} failed:`, (err as Error).message);
            continue;
        }
        discovered += items.length;
        console.log(`[discover] ${source.name}: ${items.length} candidate items`);

        for (const item of items) {
            let article;
            try {
                article = await fetchAndParse(item.url);
            } catch (err) {
                console.error(`[fetch] ${item.url} failed:`, (err as Error).message);
                skippedDisallowedOrFailed++;
                continue;
            }
            if (!article) {
                skippedDisallowedOrFailed++;
                continue;
            }

            const fp = fingerprint(article);
            if (store.hasFingerprint(fp)) {
                skippedDuplicate++;
                continue;
            }

            store.insert(article, source.name, fp);
            stored++;
            console.log(`[store] ${article.title} (${source.name})`);
        }
    }

    store.close();
    console.log('\n--- Run summary ---');
    console.log({ discovered, stored, skippedDuplicate, skippedDisallowedOrFailed });
}

run().catch((err) => {
    console.error('Crawl failed:', err);
    process.exitCode = 1;
});
