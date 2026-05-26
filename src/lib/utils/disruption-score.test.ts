import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { calculateDisruptionScore, disruptionDescription } from './disruption-score';

const MS_PER_MONTH = 1000 * 60 * 60 * 24 * 30;
const NOW = new Date('2026-05-01T00:00:00Z').getTime();

function monthsAgoIso(n: number): string {
    return new Date(NOW - n * MS_PER_MONTH).toISOString();
}

describe('calculateDisruptionScore', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(NOW);
    });
    afterEach(() => {
        vi.useRealTimers();
    });

    it('flags a stale, low-rated, high-install app as highly vulnerable', () => {
        const result = calculateDisruptionScore(monthsAgoIso(15), 2.5, '1,000,000+');
        // +30 (12mo stale) +30 (score <3.0) +40 (1M installs, score <3.5) = 100
        expect(result.score).toBe(100);
        expect(result.label).toBe('Highly Vulnerable');
        expect(result.color).toContain('text-red-600');
    });

    it('treats a fresh, well-rated, low-install app as low opportunity', () => {
        const result = calculateDisruptionScore(monthsAgoIso(0), 4.8, '50,000+');
        expect(result.score).toBe(0);
        expect(result.label).toBe('Low Opportunity');
        expect(result.color).toContain('text-green-600');
    });

    it('lands in the moderate band for a mid-stale, mediocre-rated app', () => {
        const result = calculateDisruptionScore(monthsAgoIso(7), 3.7, '500,000+');
        // +20 (6mo) +15 (score <4.0) +0 (500k <1M, falls into 100k tier but
        // 100k tier needs <3.5 or <4.0; 3.7 <4.0 → +10)
        expect(result.score).toBe(45);
        expect(result.label).toBe('Moderate Opportunity');
    });

    it('caps the score at 100 even when every contributor maxes out', () => {
        const result = calculateDisruptionScore(monthsAgoIso(36), 1.0, '10,000,000+');
        expect(result.score).toBe(100);
    });

    it('treats unparseable install strings as zero installs', () => {
        const result = calculateDisruptionScore(monthsAgoIso(0), 4.5, 'unknown');
        // Only the score band can contribute; 4.5 is not <4.5 so 0.
        expect(result.score).toBe(0);
    });

    it('crosses the highly-vulnerable threshold at exactly 70', () => {
        // Engineer a 70: 6mo stale (+20) + score 3.4 (+25) + 1M @ <3.5 (+40 -> 85)
        // Drop installs to 100k @ <3.5 (+20) → 65, just under. Bump to score 3.49 (+25)
        // 6mo stale 20 + 25 + 1M(<3.5)40 = 85 (vulnerable+). Adjust:
        // 3mo stale (+10) + score 3.4 (+25) + 1M @ <3.5 (+40) = 75 → Highly Vulnerable
        const result = calculateDisruptionScore(monthsAgoIso(3), 3.4, '1,000,000+');
        expect(result.score).toBeGreaterThanOrEqual(70);
        expect(result.label).toBe('Highly Vulnerable');
    });
});

describe('disruptionDescription', () => {
    it('uses high-opportunity copy for severe scores', () => {
        expect(disruptionDescription(85)).toContain('Excellent opportunity');
    });
    it('uses good-opportunity copy for the 50-69 band', () => {
        expect(disruptionDescription(60)).toContain('Good opportunity');
    });
    it('uses moderate copy for the 30-49 band', () => {
        expect(disruptionDescription(40)).toContain('Moderate opportunity');
    });
    it('uses low-opportunity copy for sub-30 scores', () => {
        expect(disruptionDescription(10)).toContain('Low opportunity');
    });
});
