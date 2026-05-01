# Privacy Policy

**Last updated:** May 1, 2026

## What We Collect

ReviewRaven collects the following anonymous data:

- **Usage events:** analyze_started, analyze_completed, analyze_failed, unknown_result, degraded_result, high_risk_result, cache_hit, cache_miss, domain_blocked, unsupported_domain, share_clicked
- **Rate limiting data:** IP addresses are stored temporarily in memory for rate limiting purposes and are cleared on server restart

## What We DO NOT Collect

- **Personal information:** No names, emails, or accounts
- **Raw product URLs in analytics:** URLs are hashed using SHA-256 before any diagnostic event. The original URL is never stored in analytics or logs.
- **Cookies or tracking:** No tracking cookies or third-party trackers
- **Persistent storage:** No database of user activity

## How Data Is Used

Usage events are aggregated to understand feature adoption, monitor system health, and improve the product. No individual user can be identified from this data. All diagnostic events use hashed URLs and sanitize metadata (PII fields are redacted).

## Data Retention

- Rate limit data is held in memory only and lost on server restart
- Usage events are aggregated and not tied to individual sessions
- Cache entries expire after 5 minutes
- Diagnostic events are in-memory only

## Third-Party Services

ReviewRaven fetches product pages from e-commerce sites (Amazon, Walmart, Best Buy) solely to analyze publicly available review data. No personal data is sent to these services. All scraping is subject to rate limiting, timeouts, and circuit breaker protections.

## Contact

For privacy questions, please reach out through the project repository.
