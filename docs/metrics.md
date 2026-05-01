# Metrics & Analytics

## Key Metrics

| Metric | Description | Measurement |
|---|---|---|
| Success Rate | % of URLs returning non-UNKNOWN verdict | `count(verdict != UNKNOWN) / count(total)` |
| Average Analysis Time | p50/p95 latency from POST to response | Target: p50 < 2s, p95 < 3s |
| Viral Coefficient | % of analyses with share_clicked event | `count(share_clicked) / count(analyze_completed)` |
| UNKNOWN Rate | % of analyses returning UNKNOWN | Alert if > 20% over 24h |

## Success Thresholds

| Metric | Threshold | Alert Level |
|---|---|---|
| UNKNOWN verdict rate | < 15% | Warning at 15%, Critical at 25% |
| p95 latency | < 3000ms | Warning at 3s, Critical at 5s |
| Error rate (5xx) | < 1% | Warning at 1%, Critical at 3% |
| Cache hit rate | > 20% | No alert, track trend |
| Circuit breaker activations | < 10 per domain per hour | Warning at 10, Critical at 25 |
| Rate limit hits | < 5% of requests | Warning at 5%, Critical at 10% |

## Failure Signals

- **UNKNOWN rate spike**: > 15% over 24h indicates scraper blocks or platform HTML structure changes
- **High latency**: p95 > 3s indicates upstream retailer slowdown or infrastructure bottleneck
- **Circuit breaker activation**: Domain failure threshold reached; signals scraping block
- **Cost bucket spike**: Sudden increase in fetch attempts per domain

## Iteration Loop

- Monthly review of verdict accuracy against manual audits
- Quarterly update of signal weighting
- Weekly review of UNKNOWN rate and circuit breaker activations
