import { createHash } from 'node:crypto';
import type { ParsedArticle } from './parser.js';

export function normalizeTitle(title: string): string {
    return title
        .toLowerCase()
        .normalize('NFKD')
        .replace(/[^\w\s]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
}

/** Stable fingerprint from canonical URL + normalized title + publish timestamp + body hash. */
export function fingerprint(article: ParsedArticle): string {
    const bodyHash = createHash('sha256').update(article.body).digest('hex');
    const parts = [article.canonicalUrl, normalizeTitle(article.title), article.publishedAt ?? '', bodyHash];
    return createHash('sha256').update(parts.join('|')).digest('hex');
}
