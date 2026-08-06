import { Actor, log } from 'apify';
import { sources as defaultSources, type Source } from './config.js';
import { fingerprint } from './dedupe.js';
import { discover } from './discovery.js';
import { fetchAndParse } from './parser.js';
import { openStore } from './store.js';

await Actor.init();

interface Input {
    sources?: Source[];
}

const input = ((await Actor.getInput()) ?? {}) as Input;
const sources: Source[] = input.sources && input.sources.length > 0 ? input.sources : defaultSources;

const store = await openStore();
let discovered = 0;
let stored = 0;
let skippedDuplicate = 0;
let skippedDisallowedOrFailed = 0;

for (const source of sources) {
    log.info(`Discovering: ${source.name}`);
    let items;
    try {
        items = await discover(source);
    } catch (err) {
        log.warning(`Discovery failed for ${source.name}`, { error: (err as Error).message });
        continue;
    }
    discovered += items.length;
    log.info(`${source.name}: ${items.length} candidate items`);

    for (const item of items) {
        let article;
        try {
            article = await fetchAndParse(item.url);
        } catch (err) {
            log.warning(`Fetch failed: ${item.url}`, { error: (err as Error).message });
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

        await store.insert(article, source.name, fp);
        stored++;
        log.info(`Stored: ${article.title}`, { source: source.name });
    }
}

await store.close();
log.info('Run summary', { discovered, stored, skippedDuplicate, skippedDisallowedOrFailed });

await Actor.exit();
