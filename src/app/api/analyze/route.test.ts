import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { POST as analyzePost } from './route';
import { validateUrl } from '@reviewraven/shared-core';

vi.mock('@reviewraven/shared-core', async () => {
  const actual = await vi.importActual('@reviewraven/shared-core');
  return {
    ...(actual as object),
    safeLog: vi.fn(),
    createSafeLogEntry: vi.fn(() => ({ timestamp: '2024-01-01', level: 'info', event: 'test' })),
  };
});

vi.mock('@/lib/scraper', () => ({
  scrapeProduct: vi.fn(async () => ({
    title: 'Test Product',
    rating: 4.5,
    ratingCount: 100,
    reviewCount: 80,
    reviewSnippets: ['Good product', 'Works well'],
    timestamps: ['2024-01-01', '2024-01-02'],
    reviewerNames: ['John', 'Jane'],
    isVerified: [true, true],
    blocked: false,
    degraded: false,
  })),
}));

describe('/api/analyze POST', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns 400 when URL is missing', async () => {
    const req = new Request('http://localhost/api/analyze', {
      method: 'POST',
      body: JSON.stringify({}),
      headers: { 'Content-Type': 'application/json' },
    });

    const res = await analyzePost(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.ok).toBe(false);
    expect(data.code).toBe('MISSING_URL');
  });

  it('returns 400 for invalid URL format', async () => {
    const req = new Request('http://localhost/api/analyze', {
      method: 'POST',
      body: JSON.stringify({ url: 'not-a-url' }),
      headers: { 'Content-Type': 'application/json' },
    });

    const res = await analyzePost(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.ok).toBe(false);
    expect(data.code).toBe('INVALID_URL');
  });

  it('returns 400 for unsupported domain', async () => {
    const req = new Request('http://localhost/api/analyze', {
      method: 'POST',
      body: JSON.stringify({ url: 'https://www.ebay.com/itm/123' }),
      headers: { 'Content-Type': 'application/json' },
    });

    const res = await analyzePost(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.ok).toBe(false);
    expect(data.code).toBe('UNSUPPORTED_STORE');
  });

  it('returns 200 with valid amazon URL', async () => {
    const req = new Request('http://localhost/api/analyze', {
      method: 'POST',
      body: JSON.stringify({ url: 'https://www.amazon.com/dp/B08N5WRWNW' }),
      headers: { 'Content-Type': 'application/json' },
    });

    const res = await analyzePost(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.ok).toBe(true);
    expect(data.schemaVersion).toBe('1.0.0');
    expect(data.verdict).toBeDefined();
    expect(data.confidence).toBeDefined();
    expect(data.reasons).toBeDefined();
    expect(data.signals).toBeDefined();
    expect(data.evidence).toBeDefined();
    expect(data.limitations).toBeDefined();
    expect(data.degraded).toBeDefined();
    expect(data.diagnosticsId).toBeDefined();
  });

  it('returns 400 for invalid JSON body', async () => {
    const req = new Request('http://localhost/api/analyze', {
      method: 'POST',
      body: 'not json',
      headers: { 'Content-Type': 'application/json' },
    });

    const res = await analyzePost(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.ok).toBe(false);
    expect(data.code).toBe('INVALID_BODY');
  });

  it('returns 429 when rate limited', async () => {
    const { checkRateLimit } = await import('@reviewraven/shared-infra');
    vi.mocked(checkRateLimit).mockReturnValue(false);

    const req = new Request('http://localhost/api/analyze', {
      method: 'POST',
      body: JSON.stringify({ url: 'https://www.amazon.com/dp/B08N5WRWNW' }),
      headers: { 'Content-Type': 'application/json' },
    });

    const res = await analyzePost(req);
    expect(res.status).toBe(429);
    const data = await res.json();
    expect(data.ok).toBe(false);
    expect(data.code).toBe('RATE_LIMITED');
  });
});
