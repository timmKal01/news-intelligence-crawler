# News & Brand Mention Monitor — RSS & Google News, Deduplicated

Track new coverage of a brand, company, product, or keyword across RSS feeds
and Google News search. Every run only returns articles it hasn't seen
before — dedupe holds across scheduled runs, not just within one — so this
is built to run on a schedule as a standing mention monitor, not a one-off
scrape.

## Who this is for

- **PR/comms teams** tracking new press coverage of their company or a campaign.
- **Market researchers & analysts** watching a topic or competitor across many sources at once.
- **Competitive intelligence** teams monitoring what's being published about competitors.

## Input

| Field | Type | Description |
|---|---|---|
| `sources` | array | List of sources to pull from. Each item is either `{ "type": "rss", "name": "...", "feedUrl": "...", "keywordFilter"?: [...] }` or `{ "type": "google-news", "name": "...", "query": "..." }`. Leave empty to use a built-in default source list. |

```json
{
  "sources": [
    { "type": "rss", "name": "techcrunch", "feedUrl": "https://techcrunch.com/feed/", "keywordFilter": ["tesla", "battery"] },
    { "type": "google-news", "name": "google-news-tesla", "query": "Tesla OR robotaxi" }
  ]
}
```

## Output

One record per newly discovered article:

```json
{
  "url": "https://example.com/article",
  "canonicalUrl": "https://example.com/article",
  "title": "Example headline",
  "author": "Jane Doe",
  "publication": "Example News",
  "publishedAt": "2026-09-18T12:00:00.000Z",
  "body": "Cleaned article text...",
  "imageUrl": "https://example.com/image.jpg",
  "sourceName": "techcrunch",
  "fingerprint": "sha256-hash",
  "discoveredAt": "2026-09-19T08:00:00.000Z"
}
```

## How it works

Pulls from RSS feeds and Google News RSS search, checks `robots.txt` before
fetching each article, and extracts clean title/author/body text (nav, ads,
and cookie banners stripped). Each article is fingerprinted (canonical URL +
title + publish time + body hash) against a persistent store, so re-running
on a schedule only returns what's genuinely new — already-seen articles are
skipped, not re-charged.

A source's `robots.txt` is checked per article at run time — if a publisher
changes its policy, that source may start getting skipped. That's enforced
by design, not a bug.

No proxy, no scraping beyond each source's own public RSS/search feed.

## Related products

- [Hacker News Keyword Tracker](https://github.com/timmKal01/hacker-news-keyword-tracker) — same mention-monitoring idea, scoped to Hacker News discussions instead of news coverage
