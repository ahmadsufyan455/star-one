import { describe, expect, it, vi, beforeEach } from 'vitest';

vi.mock('server-only', () => ({}));

const { mockApp, mockReviews } = vi.hoisted(() => ({
    mockApp: vi.fn(),
    mockReviews: vi.fn(),
}));

vi.mock('google-play-scraper', () => ({
    default: { app: mockApp, reviews: mockReviews },
}));

const { googlePlaySource } = await import('./google-play');
const { AppNotFoundError, ReviewsFetchError } = await import('./types');

describe('googlePlaySource.fetchAppInfo', () => {
    beforeEach(() => {
        mockApp.mockReset();
    });

    it('normalizes the gplay app payload to NormalizedAppInfo', async () => {
        mockApp.mockResolvedValue({
            title: 'Foo',
            icon: 'https://example.com/icon.png',
            genre: 'Productivity',
            summary: 'short blurb',
            description: 'long description',
            updated: 1714521600000,
            installs: '1,000,000+',
            score: 4.2,
            ratings: 50_000,
            price: 0,
            free: true,
            offersIAP: false,
        });

        const info = await googlePlaySource.fetchAppInfo({
            appId: 'com.foo.bar',
            country: 'us',
            lang: 'en',
        });

        expect(info.title).toBe('Foo');
        expect(info.score).toBe(4.2);
        expect(info.installs).toBe('1,000,000+');
        // gplay returns numbers/timestamps; the source must stringify them so the
        // downstream `formatRelativeDate` and DB columns receive consistent input
        expect(typeof info.updated).toBe('string');
        expect(info.updated).toBe('1714521600000');
        expect(typeof info.price).toBe('string');
    });

    it('falls back to safe defaults when optional fields are missing', async () => {
        mockApp.mockResolvedValue({ title: 'Foo', icon: 'i' });

        const info = await googlePlaySource.fetchAppInfo({
            appId: 'com.foo.bar',
            country: 'us',
            lang: 'en',
        });

        expect(info.genre).toBeNull();
        expect(info.summary).toBeNull();
        expect(info.description).toBeNull();
        expect(info.updated).toBe('Unknown');
        expect(info.installs).toBe('Unknown');
        expect(info.score).toBe(0);
        expect(info.ratings).toBe(0);
        expect(info.price).toBe('Free');
        expect(info.free).toBe(true);
        expect(info.offersIAP).toBe(false);
    });

    it('translates any gplay error into AppNotFoundError', async () => {
        mockApp.mockRejectedValue(new Error('App not found (404)'));

        await expect(
            googlePlaySource.fetchAppInfo({
                appId: 'com.does.not.exist',
                country: 'us',
                lang: 'en',
            }),
        ).rejects.toBeInstanceOf(AppNotFoundError);
    });
});

describe('googlePlaySource.fetchReviews', () => {
    beforeEach(() => {
        mockReviews.mockReset();
    });

    it('passes through the limit + sort=1 (newest) and normalizes the response', async () => {
        mockReviews.mockResolvedValue({
            data: [
                {
                    userName: 'Alice',
                    userImage: 'https://example.com/a.png',
                    score: 1,
                    date: 1714521600000,
                    text: 'broken',
                },
                {
                    userName: '',
                    userImage: undefined,
                    score: 2,
                    date: '2026-04-01',
                    text: '',
                },
            ],
        });

        const reviews = await googlePlaySource.fetchReviews({
            appId: 'com.foo.bar',
            country: 'us',
            lang: 'en',
            limit: 50,
        });

        expect(reviews).toHaveLength(2);
        expect(mockReviews).toHaveBeenCalledWith(
            expect.objectContaining({ appId: 'com.foo.bar', num: 50, sort: 1, country: 'us', lang: 'en' }),
        );

        // Empty userName falls back to "Anonymous" (avoids blank cards in UI)
        expect(reviews[1].userName).toBe('Anonymous');
        // Numeric date is stringified for downstream relative formatting
        expect(typeof reviews[0].date).toBe('string');
        // Empty text stays empty rather than becoming undefined
        expect(reviews[1].text).toBe('');
    });

    it('wraps any gplay error in ReviewsFetchError so the route can return 503', async () => {
        const cause = new Error('upstream HTML changed');
        mockReviews.mockRejectedValue(cause);

        await expect(
            googlePlaySource.fetchReviews({
                appId: 'com.foo.bar',
                country: 'us',
                lang: 'en',
                limit: 50,
            }),
        ).rejects.toBeInstanceOf(ReviewsFetchError);
    });
});
