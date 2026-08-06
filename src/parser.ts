import { extractFromHtml } from '@extractus/article-extractor';
import { isAllowedByRobots, politeFetch } from './http.js';

export interface ParsedArticle {
    url: string;
    canonicalUrl: string;
    title: string;
    author: string | null;
    publication: string | null;
    publishedAt: string | null;
    body: string;
    rawHtml: string;
    imageUrl: string | null;
}

/** Strips HTML tags and collapses whitespace. article-extractor already drops nav/ads/cookie banners. */
export function normalizeToText(html: string): string {
    return html
        .replace(/<[^>]+>/g, ' ')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/\s+/g, ' ')
        .trim();
}

/** Returns null if the article is disallowed by robots.txt or extraction fails. */
export async function fetchAndParse(url: string): Promise<ParsedArticle | null> {
    if (!(await isAllowedByRobots(url))) {
        return null;
    }

    const res = await politeFetch(url);
    if (!res.ok) return null;
    const rawHtml = await res.text();

    const extracted = await extractFromHtml(rawHtml, url);
    if (!extracted || !extracted.content) return null;

    return {
        url,
        canonicalUrl: extracted.url ?? url,
        title: extracted.title ?? '',
        author: extracted.author ?? null,
        publication: extracted.source ?? new URL(url).hostname,
        publishedAt: extracted.published ?? null,
        body: normalizeToText(extracted.content),
        rawHtml,
        imageUrl: extracted.image ?? null,
    };
}
