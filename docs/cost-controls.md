# Cost Controls

ReviewRaven uses `@reviewraven/shared-cost-control` for request cost tracking and per-domain cost buckets.

## Cost Entry Types

| Type | Description | Tracked From |
| --- | --- | --- |
| `fetch` | HTTP request to product page | `src/lib/scraper.ts` |
| `retry` | Retry attempt after failure | (future) |
| `cache_miss` | No cached result, full analysis required | `analyzeWithCache()` |
| `cache_hit` | Result served from memory cache | `analyzeWithCache()` |
| `blocked_domain` | Circuit breaker blocked the request | `src/lib/scraper.ts` |
| `analyzer_runtime` | Time spent in signal evaluation | `/api/analyze` route |

## Per-Domain Cost Buckets

Costs are tracked per domain. Each bucket tracks:

- `fetchAttempts` - total fetch requests
- `retries` - total retry attempts
- `cacheMisses` - analyses that bypassed cache
- `cacheHits` - analyses served from cache
- `blockedDomainEvents` - circuit breaker activations
- `totalCostMs` - cumulative processing time
- `unknownCount` - UNKNOWN verdict count
- `totalAnalyses` - total analyses completed

### Domain Buckets

| Domain | Bucket Key |
| --- | --- |
| Amazon (all regions) | `amazon` |
| Walmart | `walmart` |
| Best Buy | `bestbuy` |
| Other | resolved from URL hostname |

## Cache Strategy

- Memory cache with 5-minute TTL (`DEFAULT_CACHE_TTL_MS`)
- In-flight deduplication prevents concurrent analysis of same URL
- Cache key: `analysis:${hashNormalizedUrl(url)}`
- Cache hits record `cache_hit` diagnostic event and cost entry
- Cache misses record `cache_miss` diagnostic event and cost entry

## Unknown Rate Tracking

`getUnknownRate(domain)` returns the ratio of UNKNOWN verdicts to total analyses per domain. This helps identify domains with increasing scrape failures.

## Cost Monitoring

Cost metrics are accessible via:

- `getDomainBucket(domain)` - retrieve a single domain's bucket
- `getAllBuckets()` - retrieve all domain buckets
- `getUnknownRate(domain)` - unknown verdict ratio per domain
- Diagnostic events include cost-related metadata

## Scraper Cost Controls

- Fetch timeout: 10 seconds (`FETCH_TIMEOUT_MS`)
- Response size cap: 2MB (`MAX_RESPONSE_BYTES`)
- Circuit breaker: 5 failures per domain before blocking (`FAILURE_THRESHOLD`)
- Circuit reset: 60-second cooldown before retry
