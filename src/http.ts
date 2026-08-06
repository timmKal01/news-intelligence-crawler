import robotsParserImport from 'robots-parser';
import { MAX_RETRIES, MIN_DELAY_PER_DOMAIN_MS, REQUEST_TIMEOUT_MS, USER_AGENT } from './config.js';

// The robots-parser package ships a malformed .d.ts (ambient `declare module`
// alongside a default export), so its inferred type is unusable. Recast to
// the shape we actually rely on.
interface Robots {
    isAllowed(url: string, ua?: string): boolean | undefined;
}
const robotsParser = robotsParserImport as unknown as (url: string, robotstxt: string) => Robots;

const lastRequestAtByDomain = new Map<string, number>();
const robotsCache = new Map<string, Robots | null>();

function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function throttle(domain: string): Promise<void> {
    const last = lastRequestAtByDomain.get(domain) ?? 0;
    const wait = last + MIN_DELAY_PER_DOMAIN_MS - Date.now();
    if (wait > 0) await sleep(wait);
    lastRequestAtByDomain.set(domain, Date.now());
}

async function getRobots(domain: string): Promise<Robots | null> {
    if (robotsCache.has(domain)) return robotsCache.get(domain)!;
    try {
        const url = `https://${domain}/robots.txt`;
        const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT }, signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) });
        if (!res.ok) {
            robotsCache.set(domain, null);
            return null;
        }
        const body = await res.text();
        const robots = robotsParser(url, body);
        robotsCache.set(domain, robots);
        return robots;
    } catch {
        robotsCache.set(domain, null);
        return null;
    }
}

export async function isAllowedByRobots(url: string): Promise<boolean> {
    const domain = new URL(url).hostname;
    const robots = await getRobots(domain);
    if (!robots) return true; // no robots.txt or unreachable: default to allowed
    return robots.isAllowed(url, USER_AGENT) ?? true;
}

/** Fetch with per-domain rate limiting, timeout, and exponential-backoff retries on transient failures. */
export async function politeFetch(url: string): Promise<Response> {
    const domain = new URL(url).hostname;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
        await throttle(domain);
        try {
            const res = await fetch(url, {
                headers: {
                    'User-Agent': USER_AGENT,
                    Accept: 'text/html,application/xhtml+xml,application/xml,application/rss+xml;q=0.9,*/*;q=0.8',
                },
                signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
            });
            if (res.status >= 500 || res.status === 429) {
                throw new Error(`Transient HTTP ${res.status}`);
            }
            return res;
        } catch (err) {
            if (attempt === MAX_RETRIES) throw err;
            const backoffMs = 2 ** attempt * 500;
            await sleep(backoffMs);
        }
    }
    throw new Error('unreachable');
}
