import { describe, it, expect } from 'vitest';
import { hashNormalizedUrl, hashUrlForDiagnostics, normalizeUrl } from './url-hashing';

describe('url-hashing', () => {
  describe('normalizeUrl', () => {
    it('lowercases the URL', () => {
      expect(normalizeUrl('https://WWW.AMAZON.COM/dp/B08N5WRWNW')).toBe('https://www.amazon.com/dp/b08n5wrwnw');
    });

    it('removes query parameters', () => {
      expect(normalizeUrl('https://www.amazon.com/dp/B08N5WRWNW?ref=abc')).toBe('https://www.amazon.com/dp/b08n5wrwnw');
    });

    it('removes fragments', () => {
      expect(normalizeUrl('https://www.amazon.com/dp/B08N5WRWNW#reviews')).toBe('https://www.amazon.com/dp/b08n5wrwnw');
    });

    it('handles invalid URLs gracefully', () => {
      expect(normalizeUrl('not-a-url')).toBe('not-a-url');
    });
  });

  describe('hashNormalizedUrl', () => {
    it('produces a deterministic hash', () => {
      const hash1 = hashNormalizedUrl('https://www.amazon.com/dp/B08N5WRWNW');
      const hash2 = hashNormalizedUrl('https://www.amazon.com/dp/B08N5WRWNW');
      expect(hash1).toBe(hash2);
    });

    it('produces different hashes for different URLs', () => {
      const hash1 = hashNormalizedUrl('https://www.amazon.com/dp/B08N5WRWNW');
      const hash2 = hashNormalizedUrl('https://www.amazon.com/dp/B07XJ8C8F5');
      expect(hash1).not.toBe(hash2);
    });

    it('handles errors gracefully', () => {
      const hash = hashNormalizedUrl('not-a-url');
      expect(hash).toBe('error_hash');
    });
  });

  describe('hashUrlForDiagnostics', () => {
    it('produces a hash for diagnostics', () => {
      const hash = hashUrlForDiagnostics('https://www.amazon.com/dp/B08N5WRWNW');
      expect(hash.length).toBeGreaterThan(0);
    });

    it('is deterministic', () => {
      const hash1 = hashUrlForDiagnostics('https://www.walmart.com/ip/123');
      const hash2 = hashUrlForDiagnostics('https://www.walmart.com/ip/123');
      expect(hash1).toBe(hash2);
    });
  });
});
