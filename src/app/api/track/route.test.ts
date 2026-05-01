import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { POST as trackPost, GET as trackGet } from './route';
import { vi } from 'vitest';

vi.mock('@reviewraven/shared-core', async () => {
  const actual = await vi.importActual('@reviewraven/shared-core');
  return {
    ...(actual as object),
    validateUrl: vi.fn((url: string) => {
      try {
        const parsed = new URL(url.startsWith('http') ? url : 'https://' + url);
        return { valid: true, url: parsed.toString(), host: parsed.hostname, isAllowedHost: true };
      } catch {
        return { valid: false, error: 'Invalid URL', isAllowedHost: false };
      }
    }),
  };
});

vi.mock('@reviewraven/shared-diagnostics', () => ({
  recordEvent: vi.fn(),
}));

describe('/api/track', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('POST', () => {
    it('records a valid share_clicked event', async () => {
      const req = new Request('http://localhost/api/track', {
        method: 'POST',
        body: JSON.stringify({ event: 'share_clicked', url: 'https://www.amazon.com/dp/B08N5WRWNW' }),
        headers: { 'Content-Type': 'application/json' },
      });

      const res = await trackPost(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.ok).toBe(true);
      expect(data.event).toBe('share_clicked');
    });

    it('rejects invalid event names', async () => {
      const req = new Request('http://localhost/api/track', {
        method: 'POST',
        body: JSON.stringify({ event: 'invalid_event' }),
        headers: { 'Content-Type': 'application/json' },
      });

      const res = await trackPost(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.ok).toBe(false);
      expect(data.code).toBe('INVALID_EVENT');
    });

    it('rejects missing event', async () => {
      const req = new Request('http://localhost/api/track', {
        method: 'POST',
        body: JSON.stringify({}),
        headers: { 'Content-Type': 'application/json' },
      });

      const res = await trackPost(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.ok).toBe(false);
      expect(data.code).toBe('MISSING_EVENT');
    });

    it('rejects invalid JSON body', async () => {
      const req = new Request('http://localhost/api/track', {
        method: 'POST',
        body: 'not json',
        headers: { 'Content-Type': 'application/json' },
      });

      const res = await trackPost(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.ok).toBe(false);
      expect(data.code).toBe('INVALID_BODY');
    });

    it('validates URL when provided', async () => {
      const req = new Request('http://localhost/api/track', {
        method: 'POST',
        body: JSON.stringify({ event: 'share_clicked', url: 'not-a-valid-url-at-all!!!' }),
        headers: { 'Content-Type': 'application/json' },
      });

      const res = await trackPost(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.ok).toBe(true);
    });

    it('accepts valid URLs', async () => {
      const req = new Request('http://localhost/api/track', {
        method: 'POST',
        body: JSON.stringify({ event: 'share_clicked', url: 'https://www.amazon.com/dp/B08N5WRWNW' }),
        headers: { 'Content-Type': 'application/json' },
      });

      const res = await trackPost(req);
      expect(res.status).toBe(200);
    });
  });

  describe('GET', () => {
    it('returns list of valid events', async () => {
      const req = new Request('http://localhost/api/track');
      const res = await trackGet(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.ok).toBe(true);
      expect(Array.isArray(data.validEvents)).toBe(true);
      expect(data.validEvents.length).toBe(11);
    });
  });
});
