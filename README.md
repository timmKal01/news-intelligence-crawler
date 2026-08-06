# News Intelligence Crawler (MVP)

An [Apify actor](https://apify.com). Minimal slice of the full
[engineering spec](./docs/spec-source.md): discover → fetch → parse → dedupe
→ store, for a handful of configurable sources. No NLP pipeline, no REST
API — this proves the core loop before layering those on.

## What's here

- **Discovery**: RSS feeds and Google News RSS search, configurable via
  Actor input (`sources`) or `src/config.ts` (used as the default when no
  input is given).
- **Fetching**: per-domain rate limiting, timeouts, exponential-backoff
  retries on transient failures, a descriptive User-Agent, and a
  `robots.txt` check before every article fetch. No proxy.
- **Parsing**: title, author, publication, publish date, canonical URL, raw
  HTML, and cleaned body text via `@extractus/article-extractor` (strips
  nav/ads/cookie banners, then whitespace-normalized).
- **Dedupe**: SHA-256 fingerprint over canonical URL + normalized title +
  publish timestamp + body hash. The set of seen fingerprints lives in a
  named, persistent Apify key-value store (`article-fingerprints`) so
  dedupe holds across separate runs, not just within one.
- **Storage**: accepted articles are pushed to the run's Apify dataset.

## What's deliberately not here yet

NLP (summary/entities/sentiment), the REST API, Prometheus metrics/alerts,
Kubernetes/multi-cloud deployment, scheduling. Same architecture, add
incrementally once validated against real sources.

## Input

```json
{
  "sources": [
    { "type": "rss", "name": "techcrunch", "feedUrl": "https://techcrunch.com/feed/", "keywordFilter": ["tesla", "battery"] },
    { "type": "google-news", "name": "google-news-tesla", "query": "Tesla OR robotaxi" }
  ]
}
```

Leave `sources` empty (or omit it) to use the built-in defaults in
`src/config.ts`. Note: a source's `robots.txt` gets checked per article at
run time — a source that works today can start getting skipped if a
publisher changes its policy; that's enforced by design, not a bug to route
around.

## Output

One dataset record per stored article: `url`, `canonicalUrl`, `title`,
`author`, `publication`, `publishedAt`, `body` (cleaned text), `rawHtml`,
`imageUrl`, `sourceName`, `fingerprint`, `discoveredAt`.

## Run it locally

```bash
npm install
npm start        # runs src/main.ts directly via tsx
```

Or as the Actor would run it in production:

```bash
npm run build     # compiles src/ -> dist/
npm run start:prod
```

## Test

```bash
npm test
```

## Configuring default sources

Edit `src/config.ts` — add a `{ type: 'rss', name, feedUrl, keywordFilter? }`
or `{ type: 'google-news', name, query }` entry. No other code changes
needed. (Per-run overrides go through Actor input instead — see above.)
