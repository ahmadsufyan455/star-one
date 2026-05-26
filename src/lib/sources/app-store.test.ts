import { describe, expect, it, vi, beforeEach } from 'vitest';

vi.mock('server-only', () => ({}));

const { mockApp, mockReviews } = vi.hoisted(() => ({
    mockApp: vi.fn(),
    mockReviews: vi.fn(),
}));

vi.mock('app-store-scraper', () => ({
    default: {
        app: mockApp,
        reviews: mockReviews,
        sort: { RECENT: 'mostRecent', HELPFUL: 'mostHelpful' },
    },
}));

const { appStoreSource } = await import('./app-store');
const { AppNotFoundError, ReviewsFetchError } = await import('./types');

describe('appStoreSource.fetchAppInfo', () => {
    beforeEach(() => {
        mockApp.mockReset();
    });

    it('normalizes a typical iTunes payload to NormalizedAppInfo', async () => {
        mockApp.mockResolvedValue({
            title: 'Foo',
            icon: 'https://example.com/icon.png',
            primaryGenre: 'Productivity',
            description: 'long description',
            updated: '2026-04-01T00:00:00Z',
            score: 4.2,
            reviews: 50_000,
            price: 0,
            currency: 'USD',
            free: true,
        });

        const info = await appStoreSource.fetchAppInfo({
            appId: '389801252',
            country: 'us',
            lang: 'en',
        });

        expect(info.title).toBe('Foo');
        expect(info.score).toBe(4.2);
        expect(info.ratings).toBe(50_000);
        // App Store has no separate summary field; we surface the description in
        // both slots so prompt construction stays identical to Google Play
        expect(info.summary).toBe('long description');
        expect(info.description).toBe('long description');
        expect(info.genre).toBe('Productivity');
        expect(info.installs).toBe('Unknown');
        expect(info.offersIAP).toBe(false);
        expect(info.free).toBe(true);
        expect(info.price).toBe('Free');
    });

    it('routes numeric ids through `id` and bundle ids through `appId`', async () => {
        mockApp.mockResolvedValue({ title: 'F', icon: 'i' });

        await appStoreSource.fetchAppInfo({ appId: '553834731', country: 'us', lang: 'en' });
        expect(mockApp.mock.calls[0]?.[0]).toMatchObject({ id: 553834731, country: 'us' });
        expect(mockApp.mock.calls[0]?.[0].appId).toBeUndefined();

        await appStoreSource.fetchAppInfo({
            appId: 'com.burbn.instagram',
            country: 'us',
            lang: 'en',
        });
        expect(mockApp.mock.calls[1]?.[0]).toMatchObject({
            appId: 'com.burbn.instagram',
            country: 'us',
        });
        expect(mockApp.mock.calls[1]?.[0].id).toBeUndefined();
    });

    it('formats a non-free price as "<amount> <currency>"', async () => {
        mockApp.mockResolvedValue({
            title: 'F',
            icon: 'i',
            price: 4.99,
            currency: 'USD',
            free: false,
        });

        const info = await appStoreSource.fetchAppInfo({
            appId: '1',
            country: 'us',
            lang: 'en',
        });

        expect(info.free).toBe(false);
        expect(info.price).toBe('4.99 USD');
    });

    it('falls back to safe defaults when optional fields are missing', async () => {
        mockApp.mockResolvedValue({ title: 'F', icon: 'i' });

        const info = await appStoreSource.fetchAppInfo({
            appId: '1',
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
    });

    it('translates any iTunes lookup error into AppNotFoundError', async () => {
        mockApp.mockRejectedValue(new Error('App not found (404)'));

        await expect(
            appStoreSource.fetchAppInfo({ appId: '0', country: 'us', lang: 'en' }),
        ).rejects.toBeInstanceOf(AppNotFoundError);
    });
});

describe('appStoreSource.fetchReviews', () => {
    beforeEach(() => {
        mockReviews.mockReset();
    });

    function pageReviews(page: number, count: number) {
        return Array.from({ length: count }, (_, i) => ({
            userName: `user-p${page}-${i}`,
            score: (i % 5) + 1,
            updated: '2026-04-01',
            text: `review ${page}-${i}`,
        }));
    }

    it('paginates until limit is satisfied and never exceeds it', async () => {
        // 50 per page, asking for 75 → expect 2 pages, then truncated to 75
        mockReviews
            .mockResolvedValueOnce(pageReviews(1, 50))
            .mockResolvedValueOnce(pageReviews(2, 50));

        const reviews = await appStoreSource.fetchReviews({
            appId: '1',
            country: 'us',
            lang: 'en',
            limit: 75,
        });

        expect(reviews).toHaveLength(75);
        expect(mockReviews).toHaveBeenCalledTimes(2);
        expect(mockReviews.mock.calls[0]?.[0]).toMatchObject({ page: 1, country: 'us', sort: 'mostRecent' });
        expect(mockReviews.mock.calls[1]?.[0]).toMatchObject({ page: 2 });
    });

    it('caps pagination at the iTunes 10-page maximum', async () => {
        mockReviews.mockResolvedValue(pageReviews(1, 50));

        await appStoreSource.fetchReviews({
            appId: '1',
            country: 'us',
            lang: 'en',
            limit: 10_000,
        });

        // Even with a wildly large limit we must not exceed iTunes' 10-page cap
        expect(mockReviews).toHaveBeenCalledTimes(10);
    });

    it('stops early when iTunes returns an empty page', async () => {
        mockReviews
            .mockResolvedValueOnce(pageReviews(1, 50))
            .mockResolvedValueOnce([]);

        const reviews = await appStoreSource.fetchReviews({
            appId: '1',
            country: 'us',
            lang: 'en',
            limit: 200,
        });

        expect(reviews).toHaveLength(50);
        expect(mockReviews).toHaveBeenCalledTimes(2);
    });

    it('substitutes Anonymous and stringifies the date for missing fields', async () => {
        mockReviews.mockResolvedValueOnce([
            { score: 1, text: '', updated: 1714521600000 },
        ]);

        const reviews = await appStoreSource.fetchReviews({
            appId: '1',
            country: 'us',
            lang: 'en',
            limit: 50,
        });

        expect(reviews[0].userName).toBe('Anonymous');
        expect(reviews[0].userImage).toBeUndefined();
        expect(typeof reviews[0].date).toBe('string');
    });

    it('wraps any iTunes error in ReviewsFetchError so the route can return 503', async () => {
        mockReviews.mockRejectedValue(new Error('iTunes RSS down'));

        await expect(
            appStoreSource.fetchReviews({
                appId: '1',
                country: 'us',
                lang: 'en',
                limit: 50,
            }),
        ).rejects.toBeInstanceOf(ReviewsFetchError);
    });
});
