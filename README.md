# News Intelligence Crawler (MVP)

Minimal slice of the full [engineering spec](./docs/spec-source.md): discover
→ fetch → parse → dedupe → store, for a couple of configurable sources. No
NLP pipeline, no REST API, no cloud/K8s deployment yet — this proves the core
loop before layering those on.

## What's here

- **Discovery**: RSS feeds and Google News RSS search, both configured (not
  hardcoded) in `src/config.ts`.
- **Fetching**: per-domain rate limiting, timeouts, exponential-backoff
  retries on transient failures, a descriptive User-Agent, and a
  `robots.txt` check before every article fetch. No proxy.
- **Parsing**: title, author, publication, publish date, canonical URL, and
  cleaned body text via `@extractus/article-extractor` (strips nav/ads/cookie
  banners, then whitespace-normalized).
- **Dedupe**: SHA-256 fingerprint over canonical URL + normalized title +
  publish timestamp + body hash.
- **Storage**: local SQLite (`articles.db`) — raw HTML, cleaned text, and
  metadata per article.

## What's deliberately not here yet

NLP (summary/entities/sentiment), the REST API, Prometheus metrics/alerts,
Docker/Kubernetes/multi-cloud deployment, scheduling. Same architecture, add
incrementally once the core loop is validated against real sources.

## Run it

```bash
npm install
npm start
```

Prints a per-source discovery count and a run summary (discovered / stored /
skipped-duplicate / skipped-disallowed-or-failed). Articles land in
`articles.db` in the project root.

## Test

```bash
npm test
```

## Configuring sources

Edit `src/config.ts` — add a `{ type: 'rss', name, feedUrl, keywordFilter? }`
or `{ type: 'google-news', name, query }` entry. No code changes needed
elsewhere.
