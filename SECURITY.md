# Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| 0.1.0   | Yes       |

## Security Features

### SSRF Protection

- Only HTTPS URLs are accepted
- Internal IP ranges are blocked (10.x, 172.16-31.x, 192.168.x, 127.x, localhost)
- Only allowed e-commerce hosts are processed (amazon, walmart, bestbuy)
- Domain extraction and validation before any network request

### Rate Limiting

- In-memory rate limiting at 5 requests per 60 seconds per IP
- Prevents abuse of the scraping engine

### Fetch Hardening

- Fetch timeout: 10 seconds (AbortController)
- Response size cap: 2MB (streaming read with byte counting)
- No arbitrary JavaScript execution (pure HTML regex parsing)
- No headless browser or JS evaluation
- Redirect detection (301/302/303/307/308 blocked)

### Input Validation

- URL format validation before any processing
- HTML sanitization of scraped content
- Only static HTML parsing via regex

### Circuit Breaker

- Per-domain circuit breaker with 5-failure threshold
- 60-second cooldown before retry
- Prevents cascading failures and resource exhaustion

### Data Handling

- No PII collected or stored
- URLs are hashed (SHA-256) before any diagnostic event
- IP addresses used only for rate limiting (in-memory, no persistence)
- All analytics are anonymous event counts
- Metadata sanitized: URLs hashed, PII fields redacted

### Error Handling

- No hard 500 responses to clients
- All errors gracefully degraded to UNKNOWN verdict
- Error envelopes with typed codes for programmatic handling

## Reporting a Vulnerability

If you discover a security vulnerability, please report it responsibly.

1. Do not open a public issue
2. Contact the maintainer directly
3. Include steps to reproduce and potential impact

We will respond within 48 hours.
