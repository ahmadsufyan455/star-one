import { describe, expect, it } from 'vitest';
import {
    APP_ID_REGEX,
    AnalysisRequestSchema,
    AnalysisResponseSchema,
    AnalysisSummarySchema,
    AppIdeaSchema,
    AIAnalysisResultSchema,
    ErrorResponseSchema,
    RateLimitInfoSchema,
    ReviewSchema,
} from './analysis';

describe('APP_ID_REGEX', () => {
    it.each([
        'com.instagram.android',
        'notion.id',
        'com.duolingo',
        'app_one.example_two',
        'com.foo.bar.baz',
    ])('accepts %s', (id) => {
        expect(APP_ID_REGEX.test(id)).toBe(true);
    });

    it.each([
        'instagram',
        'COM.INSTAGRAM.ANDROID',
        'com.instagram.android.',
        '.com.instagram',
        'com..instagram',
        '1com.instagram',
        'com instagram android',
        '',
    ])('rejects %s', (id) => {
        expect(APP_ID_REGEX.test(id)).toBe(false);
    });
});

describe('AnalysisRequestSchema', () => {
    it('applies defaults when only appId is provided', () => {
        const parsed = AnalysisRequestSchema.parse({ appId: 'com.foo.bar' });
        expect(parsed.country).toBe('us');
        expect(parsed.lang).toBe('en');
        expect(parsed.source).toBe('google-play');
    });

    it('rejects malformed appId with a helpful error message', () => {
        const result = AnalysisRequestSchema.safeParse({ appId: 'instagram' });
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.issues[0].message).toMatch(/format/i);
        }
    });

    it('rejects unknown country codes', () => {
        const result = AnalysisRequestSchema.safeParse({
            appId: 'com.foo.bar',
            country: 'fr',
        });
        expect(result.success).toBe(false);
    });

    it('rejects unknown source ids', () => {
        const result = AnalysisRequestSchema.safeParse({
            appId: 'com.foo.bar',
            source: 'product-hunt',
        });
        expect(result.success).toBe(false);
    });

    it('accepts every supported region', () => {
        for (const country of ['us', 'id', 'in', 'gb', 'sg'] as const) {
            const parsed = AnalysisRequestSchema.parse({ appId: 'com.foo.bar', country });
            expect(parsed.country).toBe(country);
        }
    });

    it('caps appId length to keep DB writes bounded', () => {
        const tooLong = 'com.' + 'a'.repeat(260);
        const result = AnalysisRequestSchema.safeParse({ appId: tooLong });
        expect(result.success).toBe(false);
    });

    describe('per-source appId rules', () => {
        it('accepts numeric track ids only when source=app-store', () => {
            const numeric = AnalysisRequestSchema.safeParse({
                appId: '389801252',
                source: 'app-store',
            });
            expect(numeric.success).toBe(true);

            const numericOnPlay = AnalysisRequestSchema.safeParse({
                appId: '389801252',
                source: 'google-play',
            });
            expect(numericOnPlay.success).toBe(false);
        });

        it('accepts bundle ids on both sources', () => {
            expect(
                AnalysisRequestSchema.safeParse({
                    appId: 'com.burbn.instagram',
                    source: 'app-store',
                }).success,
            ).toBe(true);
            expect(
                AnalysisRequestSchema.safeParse({
                    appId: 'com.instagram.android',
                    source: 'google-play',
                }).success,
            ).toBe(true);
        });

        it('still rejects garbage on app-store', () => {
            const result = AnalysisRequestSchema.safeParse({
                appId: 'not a valid id',
                source: 'app-store',
            });
            expect(result.success).toBe(false);
        });
    });
});

describe('AnalysisResponseSchema', () => {
    const validPayload = {
        appName: 'Test App',
        appIcon: 'https://example.com/icon.png',
        lastUpdated: 'Today',
        installs: '1,000,000+',
        score: 4.2,
        ratings: 50_000,
        price: 'Free',
        free: true,
        offersIAP: false,
        top_complaints: ['crashes'],
        feature_requests: ['dark mode'],
        sentiment_summary: 'mixed',
        app_ideas: [
            { name: 'Idea', pain_point: 'p', differentiation: 'd', value_proposition: 'v' },
        ],
        badReviews: [
            { userName: 'Alice', score: 1, date: 'Yesterday', text: 'broken' },
        ],
    };

    it('round-trips the response shape returned by /api/analyze', () => {
        const parsed = AnalysisResponseSchema.parse(validPayload);
        expect(parsed.appName).toBe('Test App');
        expect(parsed.app_ideas).toHaveLength(1);
    });

    it('accepts the optional id, cached, createdAt, and rateLimit fields', () => {
        const parsed = AnalysisResponseSchema.parse({
            ...validPayload,
            id: '11111111-1111-1111-1111-111111111111',
            cached: true,
            createdAt: '2026-01-01T00:00:00Z',
            rateLimit: { remaining: 1, total: 2, limitReached: false },
        });
        expect(parsed.cached).toBe(true);
        expect(parsed.id).toBe('11111111-1111-1111-1111-111111111111');
        expect(parsed.rateLimit?.remaining).toBe(1);
    });

    it('rejects a non-uuid id (defends share-link routing)', () => {
        const result = AnalysisResponseSchema.safeParse({ ...validPayload, id: 'nope' });
        expect(result.success).toBe(false);
    });

    it('tolerates app_ideas as either strings or structured objects', () => {
        const result = AnalysisResponseSchema.safeParse({
            ...validPayload,
            app_ideas: ['just a string idea', validPayload.app_ideas[0]],
        });
        expect(result.success).toBe(true);
    });
});

describe('AnalysisSummarySchema', () => {
    it('accepts a valid history-list row', () => {
        const parsed = AnalysisSummarySchema.parse({
            id: '11111111-1111-1111-1111-111111111111',
            appId: 'com.foo.bar',
            appName: 'Foo',
            appIcon: 'https://example.com/icon.png',
            country: 'us',
            source: 'google-play',
            score: 4.0,
            createdAt: '2026-01-01T00:00:00Z',
        });
        expect(parsed.appName).toBe('Foo');
    });

    it('rejects rows missing the id', () => {
        const result = AnalysisSummarySchema.safeParse({
            appId: 'com.foo.bar',
            appName: 'Foo',
            appIcon: 'x',
            country: 'us',
            source: 'google-play',
            score: 4,
            createdAt: '2026-01-01T00:00:00Z',
        });
        expect(result.success).toBe(false);
    });
});

describe('leaf schemas', () => {
    it('AppIdeaSchema requires all four fields', () => {
        const result = AppIdeaSchema.safeParse({ name: 'x', pain_point: 'y' });
        expect(result.success).toBe(false);
    });

    it('ReviewSchema accepts an optional userImage', () => {
        expect(
            ReviewSchema.safeParse({ userName: 'a', score: 1, date: 'x', text: 'y' }).success,
        ).toBe(true);
        expect(
            ReviewSchema.safeParse({
                userName: 'a',
                userImage: 'https://example.com/u.png',
                score: 1,
                date: 'x',
                text: 'y',
            }).success,
        ).toBe(true);
    });

    it('AIAnalysisResultSchema accepts the structured object form', () => {
        const result = AIAnalysisResultSchema.safeParse({
            top_complaints: [],
            feature_requests: [],
            sentiment_summary: '',
            app_ideas: [],
            badReviews: [],
        });
        expect(result.success).toBe(true);
    });

    it('RateLimitInfoSchema rejects non-numeric remaining', () => {
        const result = RateLimitInfoSchema.safeParse({
            remaining: 'one',
            total: 2,
            limitReached: false,
        });
        expect(result.success).toBe(false);
    });

    it('ErrorResponseSchema treats every field beyond `error` as optional', () => {
        const result = ErrorResponseSchema.safeParse({ error: 'oops' });
        expect(result.success).toBe(true);
    });
});
