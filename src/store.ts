import { DatabaseSync } from 'node:sqlite';
import type { ParsedArticle } from './parser.js';

export interface Store {
    hasFingerprint(fp: string): boolean;
    insert(article: ParsedArticle, sourceName: string, fp: string): void;
    close(): void;
}

export function openStore(dbPath = 'articles.db'): Store {
    const db = new DatabaseSync(dbPath);
    db.exec('PRAGMA journal_mode = WAL');

    db.exec(`
        CREATE TABLE IF NOT EXISTS articles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            fingerprint TEXT NOT NULL UNIQUE,
            source_name TEXT NOT NULL,
            url TEXT NOT NULL,
            canonical_url TEXT NOT NULL,
            title TEXT NOT NULL,
            author TEXT,
            publication TEXT,
            published_at TEXT,
            body TEXT NOT NULL,
            raw_html TEXT NOT NULL,
            image_url TEXT,
            discovered_at TEXT NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_articles_source ON articles(source_name);
        CREATE INDEX IF NOT EXISTS idx_articles_published_at ON articles(published_at);
    `);

    const checkStmt = db.prepare('SELECT 1 FROM articles WHERE fingerprint = ?');
    const insertStmt = db.prepare(`
        INSERT INTO articles (
            fingerprint, source_name, url, canonical_url, title, author,
            publication, published_at, body, raw_html, image_url, discovered_at
        ) VALUES (@fingerprint, @sourceName, @url, @canonicalUrl, @title, @author,
            @publication, @publishedAt, @body, @rawHtml, @imageUrl, @discoveredAt)
    `);

    return {
        hasFingerprint(fp: string): boolean {
            return checkStmt.get(fp) !== undefined;
        },
        insert(article: ParsedArticle, sourceName: string, fp: string): void {
            insertStmt.run({
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
        },
        close(): void {
            db.close();
        },
    };
}
