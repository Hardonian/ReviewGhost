import { describe, it, expect, beforeEach, vi } from 'vitest';
import { validateUrl, isAllowedDomain, extractDomain, ALLOWED_HOSTS, BLOCKED_IP_PATTERNS } from './validation';

describe('validateUrl', () => {
  it('rejects empty URLs', () => {
    expect(validateUrl('')).toEqual({ valid: false, error: 'URL is required', isAllowedHost: false });
    expect(validateUrl('   ')).toEqual({ valid: false, error: 'URL is required', isAllowedHost: false });
  });

  it('accepts valid amazon URLs', () => {
    const result = validateUrl('https://www.amazon.com/dp/B08N5WRWNW');
    expect(result.valid).toBe(true);
    expect(result.isAllowedHost).toBe(true);
    expect(result.host).toBe('www.amazon.com');
  });

  it('accepts walmart URLs', () => {
    const result = validateUrl('https://www.walmart.com/ip/12345');
    expect(result.valid).toBe(true);
    expect(result.isAllowedHost).toBe(true);
  });

  it('accepts bestbuy URLs', () => {
    const result = validateUrl('https://www.bestbuy.com/site/123');
    expect(result.valid).toBe(true);
    expect(result.isAllowedHost).toBe(true);
  });

  it('rejects non-HTTPS URLs', () => {
    const result = validateUrl('http://www.amazon.com/dp/B08N5WRWNW');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('HTTPS');
  });

  it('rejects invalid URL format', () => {
    const result = validateUrl('not-a-url');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Invalid URL');
  });

  it('auto-prepends https://', () => {
    const result = validateUrl('www.amazon.com/dp/B08N5WRWNW');
    expect(result.valid).toBe(true);
  });

  it('rejects blocked IP patterns', () => {
    const blocked = [
      'https://10.0.0.1/test',
      'https://192.168.1.1/test',
      'https://127.0.0.1/test',
      'https://localhost:3000',
      'https://0.0.0.0/test',
    ];

    for (const url of blocked) {
      const result = validateUrl(url);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('internal or local');
    }
  });

  it('rejects IPv6 private addresses', () => {
    const blocked = [
      'https://[::1]/test',
      'https://[fc00::1]/test',
      'https://[fd00::1]/test',
      'https://[fe80::1]/test',
    ];

    for (const url of blocked) {
      const result = validateUrl(url);
      expect(result.valid).toBe(false);
    }
  });

  it('rejects unsupported domains', () => {
    const result = validateUrl('https://www.ebay.com/itm/123');
    expect(result.valid).toBe(true);
    expect(result.isAllowedHost).toBe(false);
  });

  it('accepts amazon subdomains', () => {
    const result = validateUrl('https://smile.amazon.com/dp/B08N5WRWNW');
    expect(result.valid).toBe(true);
    expect(result.isAllowedHost).toBe(true);
  });
});

describe('isAllowedDomain', () => {
  it('returns true for allowed domains', () => {
    expect(isAllowedDomain('www.amazon.com')).toBe(true);
    expect(isAllowedDomain('amazon.com')).toBe(true);
    expect(isAllowedDomain('www.walmart.com')).toBe(true);
    expect(isAllowedDomain('www.bestbuy.com')).toBe(true);
  });

  it('returns false for disallowed domains', () => {
    expect(isAllowedDomain('www.ebay.com')).toBe(false);
    expect(isAllowedDomain('www.target.com')).toBe(false);
  });

  it('is case insensitive', () => {
    expect(isAllowedDomain('WWW.AMAZON.COM')).toBe(true);
    expect(isAllowedDomain('Amazon.com')).toBe(true);
  });
});

describe('extractDomain', () => {
  it('extracts domain from valid URLs', () => {
    expect(extractDomain('https://www.amazon.com/dp/B08N5WRWNW')).toBe('www.amazon.com');
    expect(extractDomain('https://www.walmart.com/ip/123')).toBe('www.walmart.com');
  });

  it('returns unknown for invalid URLs', () => {
    expect(extractDomain('not-a-url')).toBe('unknown');
  });
});

describe('BLOCKED_IP_PATTERNS', () => {
  it('blocks IPv4 private ranges', () => {
    expect(BLOCKED_IP_PATTERNS.some(p => p.test('10.0.0.1'))).toBe(true);
    expect(BLOCKED_IP_PATTERNS.some(p => p.test('192.168.0.1'))).toBe(true);
    expect(BLOCKED_IP_PATTERNS.some(p => p.test('127.0.0.1'))).toBe(true);
    expect(BLOCKED_IP_PATTERNS.some(p => p.test('172.16.0.1'))).toBe(true);
    expect(BLOCKED_IP_PATTERNS.some(p => p.test('172.31.255.255'))).toBe(true);
  });

  it('blocks IPv6 private ranges', () => {
    expect(BLOCKED_IP_PATTERNS.some(p => p.test('::1'))).toBe(true);
    expect(BLOCKED_IP_PATTERNS.some(p => p.test('fc00::1'))).toBe(true);
    expect(BLOCKED_IP_PATTERNS.some(p => p.test('fd00::1'))).toBe(true);
    expect(BLOCKED_IP_PATTERNS.some(p => p.test('fe80::1'))).toBe(true);
    expect(BLOCKED_IP_PATTERNS.some(p => p.test('[::1]'))).toBe(true);
  });

  it('blocks localhost and 0.0.0.0', () => {
    expect(BLOCKED_IP_PATTERNS.some(p => p.test('localhost'))).toBe(true);
    expect(BLOCKED_IP_PATTERNS.some(p => p.test('0.0.0.0'))).toBe(true);
  });

  it('does not block public IPs', () => {
    expect(BLOCKED_IP_PATTERNS.some(p => p.test('8.8.8.8'))).toBe(false);
    expect(BLOCKED_IP_PATTERNS.some(p => p.test('1.1.1.1'))).toBe(false);
    expect(BLOCKED_IP_PATTERNS.some(p => p.test('203.0.113.1'))).toBe(false);
  });
});

describe('ALLOWED_HOSTS', () => {
  it('includes amazon regional domains', () => {
    const amazonHosts = ALLOWED_HOSTS.filter(h => h.startsWith('amazon'));
    expect(amazonHosts.length).toBeGreaterThan(1);
  });

  it('includes walmart and bestbuy', () => {
    expect(ALLOWED_HOSTS).toContain('walmart.com');
    expect(ALLOWED_HOSTS).toContain('bestbuy.com');
  });
});
