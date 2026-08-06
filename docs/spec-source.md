Engineering Specification: News Intelligence Crawler
Objective

Build a production-grade news collection service that continuously discovers, fetches, extracts, and indexes publicly available news articles relevant to the company.

The service must prioritize reliability, data quality, low operating cost, and maintainability.
Requirements
Sources

Support configurable sources including:

    Google News search results

    Reuters

    AP News

    Bloomberg (public pages only)

    TechCrunch

    The Verge

    Ars Technica

    CNBC

    Financial Times (metadata only where content is paywalled)

    Company blogs

    Government announcements

    Industry-specific publications

New sources must be addable through configuration rather than code changes.
Search Queries

Accept dynamic queries such as:

    "Tesla"

    "Electric vehicles"

    "Battery technology"

    "Autonomous driving"

    "Robotaxi"

    "Artificial Intelligence"

    "Humanoid robots"

Support Boolean operators.
Discovery

Use RSS feeds whenever available.

Use official site search endpoints where available.

Use Google News search for broader discovery.

Follow pagination until no new articles remain.
Fetching

Fetch only publicly accessible content.

Respect robots.txt where applicable.

Identify using a descriptive User-Agent.

Retry transient failures with exponential backoff.

Implement configurable request timeouts.

Compress requests using gzip or brotli when supported.
Networking

Do not use Apify Proxy.

Run from company-controlled infrastructure.

Support deployment on Kubernetes.

Support deployment on AWS.

Support deployment on GCP.

Support deployment on Azure.

Allow outbound traffic through company NAT gateways.

Implement configurable rate limits per domain.

Never overload publisher websites.
Parsing

Extract:

    title

    subtitle

    author

    publication

    publication date

    update date

    URL

    canonical URL

    article body

    tags

    category

    images

    embedded videos

    language

Normalize whitespace.

Remove advertisements.

Remove navigation elements.

Remove cookie banners.

Remove unrelated page elements.
Deduplication

Generate a stable article fingerprint using:

    canonical URL

    normalized title

    publication timestamp

    body hash

Avoid storing duplicate articles.
NLP Pipeline

Automatically compute:

    summary

    keywords

    named entities

    organizations

    people

    locations

    products

    sentiment

    relevance score

    topic classification

Storage

Store raw HTML.

Store cleaned text.

Store extracted metadata.

Store extraction logs.

Store screenshots optionally.

Store historical versions when articles change.
Scheduling

Support:

    hourly runs

    daily runs

    custom cron schedules

Resume interrupted crawls automatically.
Monitoring

Record:

    request count

    success rate

    extraction rate

    parsing failures

    crawl duration

    articles discovered

    articles stored

Export Prometheus metrics.
Alerts

Notify when:

    extraction success falls below threshold

    source changes HTML structure

    crawl duration exceeds threshold

    no articles are discovered

    repeated HTTP failures occur

API

Expose REST endpoints:

GET /articles

GET /articles/{id}

GET /sources

GET /metrics

POST /crawl

POST /reindex
Performance Targets

    10,000+ articles/day

    <500 ms parsing time/article

    horizontal scalability

    idempotent crawls

    fault tolerance

Code Quality

Use TypeScript.

Implement unit tests.

Implement integration tests.

Implement structured logging.

Use dependency injection.

Document every module.

Avoid hardcoded selectors where possible.
Security

Never bypass authentication.

Never scrape content behind login walls.

Never attempt to evade anti-bot protections.

Store secrets securely.

Encrypt credentials.

Sanitize all inputs.
Deliverables

    Docker image

    Kubernetes manifests

    CI/CD pipeline

    Developer documentation

    API documentation

    Architecture diagram

    Monitoring dashboard

    Example configuration files