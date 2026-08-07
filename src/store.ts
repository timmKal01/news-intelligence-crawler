import { Actor } from 'apify';
import type { ParsedArticle } from './parser.js';

const DEDUPE_STORE_NAME = 'article-fingerprints';
const FINGERPRINTS_KEY = 'seen-fingerprints';

/** Must match the event name configured in the Actor's pay-per-event pricing on Apify. */
export const ARTICLE_STORED_EVENT = 'article-stored';

export interface Store {
    hasFingerprint(fp: string): boolean;
    insert(article: ParsedArticle, sourceName: string, fp: string): Promise<void>;
    close(): Promise<void>;
}

/**
 * Dedupe state lives in a named (persistent) key-value store so it survives
 * across separate Actor runs; accepted articles are pushed to the run's
 * dataset as usual.
 */
export async function openStore(): Promise<Store> {
    const dedupeStore = await Actor.openKeyValueStore(DEDUPE_STORE_NAME);
    const existing = (await dedupeStore.getValue<string[]>(FINGERPRINTS_KEY)) ?? [];
    const seen = new Set(existing);
    let dirty = false;

    return {
        hasFingerprint(fp: string): boolean {
            return seen.has(fp);
        },
        async insert(article: ParsedArticle, sourceName: string, fp: string): Promise<void> {
            seen.add(fp);
            dirty = true;
            await Actor.pushData({
                fingerprint: fp,
                sourceName,
                url: article.url,
                canonicalUrl: article.canonicalUrl,
                title: article.title,
                author: article.author,
                publication: article.publication,
                publishedAt: article.publishedAt,
                body: article.body,
                rawHtml: article.rawHtml,
                imageUrl: article.imageUrl,
                discoveredAt: new Date().toISOString(),
            });
            await Actor.charge({ eventName: ARTICLE_STORED_EVENT });
        },
        async close(): Promise<void> {
            if (dirty) {
                await dedupeStore.setValue(FINGERPRINTS_KEY, Array.from(seen));
            }
        },
    };
}
