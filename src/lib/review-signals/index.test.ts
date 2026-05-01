import { describe, it, expect } from 'vitest';
import { createReviewRavenRegistry, getReviewSignals, reviewSpecificSignals } from './index';

describe('review-signals', () => {
  describe('reviewSpecificSignals', () => {
    it('defines all 8 SIG-R signals', () => {
      expect(reviewSpecificSignals).toHaveLength(8);
    });

    it('has unique signal IDs', () => {
      const ids = reviewSpecificSignals.map(s => s.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('all signals have valid weight ranges', () => {
      for (const signal of reviewSpecificSignals) {
        expect(signal.weight).toBeLessThan(0);
        expect(signal.type).toBe('SUSPICIOUS');
      }
    });

    it('all signals have names and explanations', () => {
      for (const signal of reviewSpecificSignals) {
        expect(signal.name.length).toBeGreaterThan(0);
        expect(signal.explanation.length).toBeGreaterThan(0);
      }
    });
  });

  describe('createReviewRavenRegistry', () => {
    it('includes both shared and review-specific signals', () => {
      const registry = createReviewRavenRegistry();
      const all = registry.getAll();

      expect(all.length).toBeGreaterThan(27);
    });

    it('can find each SIG-R signal by ID', () => {
      const registry = createReviewRavenRegistry();

      expect(registry.get('SIG-R001')).toBeDefined();
      expect(registry.get('SIG-R002')).toBeDefined();
      expect(registry.get('SIG-R003')).toBeDefined();
      expect(registry.get('SIG-R004')).toBeDefined();
      expect(registry.get('SIG-R005')).toBeDefined();
      expect(registry.get('SIG-R006')).toBeDefined();
      expect(registry.get('SIG-R007')).toBeDefined();
      expect(registry.get('SIG-R008')).toBeDefined();
    });

    it('can find shared signals by ID', () => {
      const registry = createReviewRavenRegistry();

      expect(registry.get('SIG-S022')).toBeDefined();
      expect(registry.get('SIG-S100')).toBeDefined();
      expect(registry.get('SIG-G001')).toBeDefined();
    });
  });

  describe('getReviewSignals', () => {
    it('returns all review-specific signals', () => {
      const signals = getReviewSignals();
      expect(signals).toHaveLength(8);
    });
  });
});
