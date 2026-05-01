# Shared-Core Integration

ReviewRaven integrates five shared packages that provide cross-cutting functionality. This document describes each package, what it provides, and how ReviewRaven uses it.

## Packages

### @reviewraven/shared-core

**Purpose:** Core utilities, shared types, and base abstractions.

**Provides:**
- Common TypeScript types (`Verdict`, `SignalDetail`, `EvidenceDetail`, `AnalysisResult`, `ErrorEnvelope`, `DegradedState`, `ValidationResult`, `IdempotencyKey`, `SafeLogEntry`)
- URL validation with SSRF protection (`validateUrl`, `ALLOWED_HOSTS`, `BLOCKED_IP_PATTERNS`, `extractDomain`)
- Normalized URL hashing (`normalizeUrl`, `hashNormalizedUrl`, `hashUrlForDiagnostics`)
- Idempotency key generation (`generateIdempotencyKey`, `isIdempotencyKeyValid`)
- Degraded state model (`createDegradedState`, `isDegraded`, `hasFallback`)
- Error envelope factory (`createErrorEnvelope`, `errorResponse`)
- Safe logging with PII redaction (`createSafeLogEntry`, `safeLog`)

**Used by ReviewRaven for:**
- Type definitions across the analysis pipeline
- URL validation and SSRF protection before any fetch
- URL hashing before any diagnostic event emission
- Standardized error handling in all API routes
- Safe logging in analyze flow

### @reviewraven/shared-intelligence

**Purpose:** Signal detection engine and scoring logic.

**Provides:**
- `SignalRegistry` class with shared signals (SIG-S001 through SIG-S100, SIG-G001 through G027)
- `FailureScenario` definitions (FS-01 through FS-50)
- `calculateScore()` with category adjustments
- `determineVerdict()` (BUY / CAUTION / AVOID / UNKNOWN)
- `calculateConfidence()` with penalties, caps, and explanations
- `buildEvidence()` and `buildEvidenceList()`
- `ScrapedData` and `DomainAdapter` interfaces

**Used by ReviewRaven for:**
- Core signal evaluation pipeline
- Score-to-verdict mapping (BUY / CAUTION / AVOID / UNKNOWN)
- Signal weighting and confidence calculation
- Evidence model construction

**Extensions:** ReviewRaven adds domain-specific signals (SIG-R001 through SIG-R008) via `src/lib/review-signals/index.ts`. These signals are wired into `detectSignals()` in `src/lib/analysis.ts`.

### @reviewraven/shared-diagnostics

**Purpose:** Event tracking, CRM integration, and observability.

**Provides:**
- 11 diagnostic event types: `analyze_started`, `analyze_completed`, `analyze_failed`, `unknown_result`, `degraded_result`, `high_risk_result`, `cache_hit`, `cache_miss`, `domain_blocked`, `unsupported_domain`, `share_clicked`
- Session tracking (`createSession`, `recordEvent`, `completeSession`, `getTimeline`)
- Event log with PII sanitization (`logEvent`, `getEvents`, `getEventsByDomain`, `getUnknownRate`)
- Product usage stats (`recordProductUsage`, `getProductUsageStats`)

**Used by ReviewRaven for:**
- Emitting analyze lifecycle events (started, completed, failed)
- Tracking verdict outcomes and risk levels
- Recording cache hits/misses in `analyzeWithCache()`
- Domain blocked and unsupported domain events
- High-risk result detection (AVOID verdict or 3+ suspicious signals)
- Share-click attribution via `/api/track`

See [diagnostics.md](diagnostics.md) for the full event catalog.

### @reviewraven/shared-cost-control

**Purpose:** Request cost tracking and per-domain cost buckets.

**Provides:**
- Cost entry types: `fetch`, `retry`, `cache_miss`, `cache_hit`, `blocked_domain`, `analyzer_runtime`
- `DomainCostBucket` with per-domain tracking: fetchAttempts, retries, cacheMisses, cacheHits, blockedDomainEvents, totalCostMs, unknownCount, totalAnalyses
- `recordCost()`, `getDomainBucket()`, `getAllBuckets()`
- `incrementUnknown()`, `incrementAnalysis()`, `getUnknownRate()`

**Used by ReviewRaven for:**
- Tracking cost of each URL fetch and analysis
- Recording cache behavior for performance monitoring
- Tracking UNKNOWN verdict rates per domain
- Cost visibility in `/api/analyze` response flow

See [cost-controls.md](cost-controls.md) for details.

### @reviewraven/shared-infra

**Purpose:** Infrastructure: cache, circuit breaker, rate limiting, structured logging, health checks.

**Provides:**
- Memory cache with TTL (`memoryCache`, `DEFAULT_CACHE_TTL_MS` = 5 minutes)
- In-flight deduplication (`getInFlight`, `setInFlight`)
- Per-domain circuit breaker (`isCircuitOpen`, `recordSuccess`, `recordFailure`, `FAILURE_THRESHOLD` = 5)
- Sliding-window rate limiting (`checkRateLimit`, `resetRateLimit`)
- Structured JSON logging with hashed URLs (`structuredLog`)
- Health check registration and execution (`registerHealthCheck`, `runHealthChecks`)

**Used by ReviewRaven for:**
- Circuit breaker in scraper to stop hammering failing domains
- Cache + in-flight dedup in `analyzeWithCache()`
- Rate limiting in `/api/analyze` (5 requests per 60 seconds per IP)
- Structured logging for all analyze lifecycle events
- Health check endpoint at `/api/health`

## Integration Points

```
ReviewRaven App
  |
  +-- shared-core (types, URL validation, hashing, errors, degraded state, safe logging, idempotency)
  |
  +-- shared-intelligence (signal registry, scoring, confidence, verdict, evidence, domain adapter)
  |     |
  |     +-- ReviewRaven extensions (SIG-R001 to SIG-R008 in review-signals/index.ts)
  |
  +-- shared-diagnostics (events, sessions, CRM, PII-safe event log)
  |
  +-- shared-cost-control (cost tracking, per-domain buckets, unknown rate)
  |
  +-- shared-infra (cache, in-flight dedupe, circuit breaker, rate limiting, structured logs, health)
```

## Removed Duplicated Logic

The following previously duplicated logic has been removed from ReviewRaven and replaced with shared package equivalents:

- URL parsing and domain extraction -> `@reviewraven/shared-core`
- Score aggregation and verdict calculation -> `@reviewraven/shared-intelligence`
- Event emission and session tracking -> `@reviewraven/shared-diagnostics`
- Cost accounting and cache tracking -> `@reviewraven/shared-cost-control`
- Environment validation and health checks -> `@reviewraven/shared-infra`
- Memory cache and in-flight dedup -> `@reviewraven/shared-infra`
- Circuit breaker pattern -> `@reviewraven/shared-infra`
- Rate limiting -> `@reviewraven/shared-infra`
- Error envelope construction -> `@reviewraven/shared-core`
- Degraded state handling -> `@reviewraven/shared-core`
- Safe logging with PII redaction -> `@reviewraven/shared-core`
- URL hashing for diagnostics -> `@reviewraven/shared-core`
