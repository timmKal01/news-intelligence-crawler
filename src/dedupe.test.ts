import assert from 'node:assert/strict';
import { test } from 'node:test';
import { fingerprint, normalizeTitle } from './dedupe.js';
import type { ParsedArticle } from './parser.js';

test('normalizeTitle lowercases, strips punctuation, collapses whitespace', () => {
    assert.equal(normalizeTitle('  Tesla\'s New Robotaxi:  Explained!  '), 'teslas new robotaxi explained');
});

function makeArticle(overrides: Partial<ParsedArticle> = {}): ParsedArticle {
    return {
        url: 'https://example.com/a',
        canonicalUrl: 'https://example.com/a',
        title: 'Example title',
        author: null,
        publication: 'example.com',
        publishedAt: '2026-08-01T00:00:00Z',
        body: 'Body text',
        rawHtml: '<html></html>',
        imageUrl: null,
        ...overrides,
    };
}

test('fingerprint is stable for identical articles', () => {
    const a = makeArticle();
    const b = makeArticle();
    assert.equal(fingerprint(a), fingerprint(b));
});

test('fingerprint differs when body changes', () => {
    const a = makeArticle();
    const b = makeArticle({ body: 'Different body text' });
    assert.notEqual(fingerprint(a), fingerprint(b));
});

test('fingerprint is insensitive to title punctuation/case differences', () => {
    const a = makeArticle({ title: 'Tesla Unveils Robotaxi' });
    const b = makeArticle({ title: "tesla unveils robotaxi!!" });
    assert.equal(fingerprint(a), fingerprint(b));
});
