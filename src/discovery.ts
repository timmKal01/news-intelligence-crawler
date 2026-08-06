import Parser from 'rss-parser';
import { googleNewsRssUrl, type Source } from './config.js';
import { politeFetch } from './http.js';

export interface DiscoveredItem {
    sourceName: string;
    url: string;
    title: string;
    publishedAt: string | null;
}

const rssParser = new Parser();

async function fetchFeed(feedUrl: string) {
    const res = await politeFetch(feedUrl);
    if (!res.ok) throw new Error(`Feed fetch failed: ${feedUrl} (${res.status})`);
    const xml = await res.text();
    return rssParser.parseString(xml);
}

function matchesKeywords(text: string, keywords?: string[]): boolean {
    if (!keywords || keywords.length === 0) return true;
    const lower = text.toLowerCase();
    return keywords.some((k) => lower.includes(k.toLowerCase()));
}

export async function discover(source: Source): Promise<DiscoveredItem[]> {
    const feedUrl = source.type === 'google-news' ? googleNewsRssUrl(source.query) : source.feedUrl;
    const feed = await fetchFeed(feedUrl);

    const items: DiscoveredItem[] = [];
    for (const item of feed.items) {
        if (!item.link || !item.title) continue;
        if (source.type === 'rss' && !matchesKeywords(`${item.title} ${item.contentSnippet ?? ''}`, source.keywordFilter)) {
            continue;
        }
        items.push({
            sourceName: source.name,
            url: item.link,
            title: item.title,
            publishedAt: item.isoDate ?? item.pubDate ?? null,
        });
    }
    return items;
}
