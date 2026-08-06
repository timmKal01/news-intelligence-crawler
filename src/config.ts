export interface GoogleNewsSource {
    type: 'google-news';
    name: string;
    query: string;
}

export interface RssSource {
    type: 'rss';
    name: string;
    feedUrl: string;
    /** Only keep items whose title/summary match one of these (case-insensitive). Omit to keep everything. */
    keywordFilter?: string[];
}

export type Source = GoogleNewsSource | RssSource;

export const USER_AGENT = 'NewsIntelligenceCrawler/0.1 (+contact: news-crawler-admin@example.com)';

export const REQUEST_TIMEOUT_MS = 15_000;
export const MAX_RETRIES = 3;
export const MIN_DELAY_PER_DOMAIN_MS = 1_000;

export const sources: Source[] = [
    {
        type: 'google-news',
        name: 'google-news-tesla',
        query: 'Tesla OR "electric vehicles" OR "autonomous driving" OR robotaxi',
    },
    {
        type: 'rss',
        name: 'techcrunch',
        feedUrl: 'https://techcrunch.com/feed/',
        keywordFilter: ['tesla', 'electric vehicle', 'ev ', 'battery', 'autonomous', 'robotaxi', 'humanoid robot'],
    },
    {
        type: 'rss',
        name: 'electrek',
        feedUrl: 'https://electrek.co/feed/',
    },
    {
        type: 'rss',
        name: 'engadget',
        feedUrl: 'https://www.engadget.com/rss.xml',
        keywordFilter: ['tesla', 'electric vehicle', 'ev ', 'battery', 'autonomous', 'robotaxi', 'humanoid robot', 'artificial intelligence', ' ai '],
    },
];

export function googleNewsRssUrl(query: string): string {
    const params = new URLSearchParams({ q: query, hl: 'en-US', gl: 'US', ceid: 'US:en' });
    return `https://news.google.com/rss/search?${params.toString()}`;
}
