# Degraded States

ReviewRaven uses degraded states to communicate partial failure scenarios truthfully to users. Never fake data. Never silent failures.

## When Degraded States Occur

### Blocked Scraping
- Captcha/robot challenge detected
- HTTP 4xx/5xx response from retailer
- Request timeout (10s limit)
- Response too small (<500 bytes)
- Circuit breaker open for domain

### Partial Parse
- Meta tags missing but some data extracted
- JSON-LD structure incomplete
- Review body HTML structure changed
- Missing rating or review count

### Unsupported Page
- URL domain not in ALLOWED_HOSTS
- No adapter found for domain (falls back to generic)
- Page structure not recognized by any adapter

### Insufficient Review Data
- No review snippets available
- No verified purchase indicators
- Review count below meaningful threshold
- Missing timestamps for timing analysis

## Degraded Response Structure

When analysis runs in degraded mode, the response includes:

```json
{
  "degraded": true,
  "limitations": [
    "Data collection was degraded: Captcha challenge detected",
    "No review text was available to analyze"
  ],
  "nextSteps": [
    "Try analyzing a different product URL.",
    "Manually verify the seller and return window."
  ],
  "confidence": 20,
  "confidenceExplanation": "Heavy penalty applied due to degraded data collection. Confidence capped at 30% due to missing data."
}
```

## UNKNOWN Verdict Scenarios

The UNKNOWN verdict is returned when:
1. Blocked scraping with no review data available
2. Partial parse prevents meaningful signal detection
3. Unsupported page with no extractable data
4. Insufficient review data (no snippets, no metadata)

UNKNOWN is NOT an error. It is a valid verdict that communicates "we cannot form a reliable assessment."

## Degraded State Model (shared-core)

```typescript
interface DegradedState {
  degraded: boolean;
  reason: string;
  fallbackAvailable: boolean;
  attemptedPaths: string[];
  blockedAt?: string;
}
```

## Circuit Breaker Integration

The circuit breaker (`shared-infra`) prevents cascading degradation:
- 5 consecutive failures for a domain -> circuit opens
- Open circuit returns degraded state immediately without fetching
- After 60s cooldown, circuit moves to half-open
- One successful request closes the circuit again

## User Communication

Degraded states always include:
1. Clear limitations explaining what went wrong
2. Actionable next steps for the user
3. Reduced confidence score with explanation
4. No fabricated data or false certainty
