import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { formatNumber, formatRelativeDate } from './format';

describe('formatNumber', () => {
    it('returns small integers as plain strings', () => {
        expect(formatNumber(0)).toBe('0');
        expect(formatNumber(42)).toBe('42');
        expect(formatNumber(999)).toBe('999');
    });

    it('compacts thousands as "K" without trailing .0', () => {
        expect(formatNumber(1_000)).toBe('1K');
        expect(formatNumber(2_500)).toBe('2.5K');
        expect(formatNumber(999_999)).toBe('1000K');
    });

    it('compacts millions as "M"', () => {
        expect(formatNumber(1_000_000)).toBe('1M');
        expect(formatNumber(12_500_000)).toBe('12.5M');
    });

    it('compacts billions as "B"', () => {
        expect(formatNumber(1_000_000_000)).toBe('1B');
        expect(formatNumber(2_700_000_000)).toBe('2.7B');
    });

    it('strips non-numeric characters from string input (handles "1,000,000+")', () => {
        expect(formatNumber('1,000,000+')).toBe('1M');
        expect(formatNumber('500K downloads')).toBe('500');
    });

    it('falls back to 0 when the input has no digits', () => {
        expect(formatNumber('Unknown')).toBe('0');
        expect(formatNumber('')).toBe('0');
    });
});

describe('formatRelativeDate', () => {
    const NOW = new Date('2026-05-01T12:00:00Z').getTime();

    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(NOW);
    });
    afterEach(() => {
        vi.useRealTimers();
    });

    it('returns "Today" for the same UTC day', () => {
        expect(formatRelativeDate('2026-05-01T08:00:00Z')).toBe('Today');
    });

    it('returns "Yesterday" for a day-old date', () => {
        expect(formatRelativeDate('2026-04-30T12:00:00Z')).toBe('Yesterday');
    });

    it('returns "N days ago" for the current week', () => {
        expect(formatRelativeDate('2026-04-29T12:00:00Z')).toBe('2 days ago');
        expect(formatRelativeDate('2026-04-26T12:00:00Z')).toBe('5 days ago');
    });

    it('returns "N weeks ago" between 7 and 29 days', () => {
        expect(formatRelativeDate('2026-04-20T12:00:00Z')).toBe('1 weeks ago');
        expect(formatRelativeDate('2026-04-08T12:00:00Z')).toBe('3 weeks ago');
    });

    it('returns "N months ago" between 30 and 364 days', () => {
        expect(formatRelativeDate('2026-03-01T12:00:00Z')).toBe('2 months ago');
    });

    it('returns "N years ago" past 365 days', () => {
        expect(formatRelativeDate('2024-01-01T12:00:00Z')).toBe('2 years ago');
    });

    it('parses millisecond epoch strings (gplay returns these)', () => {
        const tenDaysAgoMs = NOW - 10 * 24 * 60 * 60 * 1000;
        expect(formatRelativeDate(String(tenDaysAgoMs))).toBe('1 weeks ago');
    });

    it('returns "Unknown" for empty or sentinel input', () => {
        expect(formatRelativeDate('')).toBe('Unknown');
        expect(formatRelativeDate('Unknown')).toBe('Unknown');
    });

    it('echoes the original string when the date cannot be parsed', () => {
        expect(formatRelativeDate('not-a-real-date')).toBe('not-a-real-date');
    });
});
