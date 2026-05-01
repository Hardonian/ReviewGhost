import { describe, it, expect, vi } from 'vitest';
import { createSafeLogEntry, safeLog } from './safe-logging';

describe('safe-logging', () => {
  describe('createSafeLogEntry', () => {
    it('creates a log entry with timestamp and level', () => {
      const entry = createSafeLogEntry('info', 'test_event');
      expect(entry.level).toBe('info');
      expect(entry.event).toBe('test_event');
      expect(entry.timestamp).toBeDefined();
    });

    it('hashes URLs', () => {
      const entry = createSafeLogEntry('info', 'test', 'https://www.amazon.com/dp/B08N5WRWNW');
      expect(entry.hashedUrl).toBeDefined();
      expect(entry.domain).toBe('www.amazon.com');
    });

    it('redacts email fields in details', () => {
      const entry = createSafeLogEntry('info', 'test', undefined, {
        email: 'user@example.com',
        name: 'John Doe',
        count: 5,
      });
      expect(entry.details?.email).toBe('[REDACTED]');
      expect(entry.details?.name).toBe('[REDACTED]');
      expect(entry.details?.count).toBe(5);
    });

    it('hashes URL fields in details', () => {
      const entry = createSafeLogEntry('info', 'test', undefined, {
        url: 'https://www.amazon.com/dp/B08N5WRWNW',
        link: 'https://www.walmart.com/ip/123',
      });
      expect(entry.details?.url).toBeDefined();
      expect(entry.details?.link).toBeDefined();
      expect(typeof entry.details?.url).toBe('string');
    });

    it('handles invalid URLs gracefully', () => {
      const entry = createSafeLogEntry('info', 'test', 'not-a-valid-url');
      expect(entry.domain).toBe('unknown');
      expect(entry.hashedUrl).toBeDefined();
    });
  });

  describe('safeLog', () => {
    it('logs a JSON string to console', () => {
      const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const entry = createSafeLogEntry('info', 'test_event');
      safeLog(entry);
      expect(spy).toHaveBeenCalledOnce();
      const logged = JSON.parse(spy.mock.calls[0][0]);
      expect(logged.level).toBe('info');
      spy.mockRestore();
    });
  });
});
