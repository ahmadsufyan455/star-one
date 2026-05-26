import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

const { mockCreateClient } = vi.hoisted(() => ({ mockCreateClient: vi.fn() }));

vi.mock('@/lib/supabase/server', () => ({
    createServerSupabaseClient: mockCreateClient,
}));

const { findCachedAnalysis, saveAnalysis, listAnalyses, getAnalysisById, deleteAllAnalyses, buildResponse } =
    await import('./analyses');

interface QueryResult { data: unknown; error: unknown; count?: number | null }

interface ChainMock {
    select: ReturnType<typeof vi.fn>;
    insert: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
    eq: ReturnType<typeof vi.fn>;
    is: ReturnType<typeof vi.fn>;
    gte: ReturnType<typeof vi.fn>;
    order: ReturnType<typeof vi.fn>;
    limit: ReturnType<typeof vi.fn>;
    single: ReturnType<typeof vi.fn>;
    maybeSingle: ReturnType<typeof vi.fn>;
    then: (resolve: (value: QueryResult) => unknown, reject: (reason: unknown) => unknown) => Promise<unknown>;
}

function makeChain(result: QueryResult): ChainMock {
    const chain = {} as ChainMock;
    const ret = () => chain;
    chain.select = vi.fn(ret);
    chain.insert = vi.fn(ret);
    chain.delete = vi.fn(ret);
    chain.eq = vi.fn(ret);
    chain.is = vi.fn(ret);
    chain.gte = vi.fn(ret);
    chain.order = vi.fn(ret);
    chain.limit = vi.fn(ret);
    chain.single = vi.fn(() => Promise.resolve(result));
    chain.maybeSingle = vi.fn(() => Promise.resolve(result));
    chain.then = (resolve, reject) => Promise.resolve(result).then(resolve, reject);
    return chain;
}

function makeSupabase(chain: ChainMock) {
    const from = vi.fn(() => chain);
    return { from };
}

const fullRow = {
    id: '11111111-1111-1111-1111-111111111111',
    user_email: 'a@b.c',
    app_id: 'com.foo.bar',
    country: 'us',
    source: 'google-play',
    app_name: 'Foo',
    app_icon: 'https://example.com/icon.png',
    last_updated: 'Today',
    installs: '1M+',
    score: 4.2,
    ratings: 5000,
    price: 'Free',
    free: true,
    offers_iap: false,
    top_complaints: ['c1'],
    feature_requests: ['f1'],
    sentiment_summary: 'mixed',
    app_ideas: [{ name: 'x', pain_point: 'p', differentiation: 'd', value_proposition: 'v' }],
    bad_reviews: [{ userName: 'A', score: 1, date: 'today', text: 't' }],
    cached_from: null,
    created_at: '2026-05-01T00:00:00Z',
};

describe('findCachedAnalysis', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2026-05-01T12:00:00Z'));
    });
    afterEach(() => {
        vi.useRealTimers();
        mockCreateClient.mockReset();
    });

    it('returns the most recent uncached row inside the cache window', async () => {
        const chain = makeChain({ data: fullRow, error: null });
        mockCreateClient.mockReturnValue(makeSupabase(chain));

        const hit = await findCachedAnalysis('com.foo.bar', 'us', 'google-play');

        expect(hit).not.toBeNull();
        expect(hit?.id).toBe(fullRow.id);
        expect(hit?.payload.appName).toBe('Foo');
        expect(hit?.payload.top_complaints).toEqual(['c1']);
        // Confirms we filter to source rows only — never replay another cache replay
        expect(chain.is).toHaveBeenCalledWith('cached_from', null);
        // Confirms a 24h cutoff is applied
        const gteArg = chain.gte.mock.calls[0]?.[1] as string;
        const cutoff = new Date(gteArg).getTime();
        expect(Date.now() - cutoff).toBeCloseTo(24 * 60 * 60 * 1000, -3);
    });

    it('returns null when nothing is cached', async () => {
        const chain = makeChain({ data: null, error: null });
        mockCreateClient.mockReturnValue(makeSupabase(chain));

        const hit = await findCachedAnalysis('com.foo.bar', 'us', 'google-play');
        expect(hit).toBeNull();
    });

    it('throws when Supabase reports an error so the route can fall back', async () => {
        const chain = makeChain({ data: null, error: { message: 'boom' } });
        mockCreateClient.mockReturnValue(makeSupabase(chain));

        await expect(findCachedAnalysis('com.foo.bar', 'us', 'google-play')).rejects.toThrow(
            /Cache lookup failed: boom/,
        );
    });
});

describe('saveAnalysis', () => {
    afterEach(() => mockCreateClient.mockReset());

    const payload = {
        appName: 'Foo',
        appIcon: 'https://example.com/icon.png',
        lastUpdated: 'Today',
        installs: '1M+',
        score: 4.2,
        ratings: 5000,
        price: 'Free',
        free: true,
        offersIAP: false,
        top_complaints: ['c'],
        feature_requests: ['f'],
        sentiment_summary: 's',
        app_ideas: [],
        badReviews: [],
    };

    it('inserts a row and returns the generated id + createdAt', async () => {
        const chain = makeChain({
            data: { id: '22222222-2222-2222-2222-222222222222', created_at: '2026-05-01T00:00:00Z' },
            error: null,
        });
        mockCreateClient.mockReturnValue(makeSupabase(chain));

        const saved = await saveAnalysis({
            userEmail: 'a@b.c',
            appId: 'com.foo.bar',
            country: 'us',
            source: 'google-play',
            payload,
        });

        expect(saved.id).toBe('22222222-2222-2222-2222-222222222222');
        expect(saved.createdAt).toBe('2026-05-01T00:00:00Z');
        const insertArg = chain.insert.mock.calls[0]?.[0];
        expect(insertArg).toMatchObject({
            user_email: 'a@b.c',
            app_id: 'com.foo.bar',
            cached_from: null,
        });
    });

    it('records cached_from when replaying a cache hit', async () => {
        const chain = makeChain({
            data: { id: '33333333-3333-3333-3333-333333333333', created_at: '2026-05-01T00:00:00Z' },
            error: null,
        });
        mockCreateClient.mockReturnValue(makeSupabase(chain));

        await saveAnalysis({
            userEmail: 'a@b.c',
            appId: 'com.foo.bar',
            country: 'us',
            source: 'google-play',
            payload,
            cachedFrom: '11111111-1111-1111-1111-111111111111',
        });

        expect(chain.insert.mock.calls[0]?.[0].cached_from).toBe(
            '11111111-1111-1111-1111-111111111111',
        );
    });

    it('throws on insert error so the route can choose how to degrade', async () => {
        const chain = makeChain({ data: null, error: { message: 'duplicate key' } });
        mockCreateClient.mockReturnValue(makeSupabase(chain));

        await expect(
            saveAnalysis({
                userEmail: 'a@b.c',
                appId: 'com.foo.bar',
                country: 'us',
                source: 'google-play',
                payload,
            }),
        ).rejects.toThrow(/duplicate key/);
    });
});

describe('listAnalyses', () => {
    afterEach(() => mockCreateClient.mockReset());

    it('maps snake_case rows to camelCase summaries', async () => {
        const rows = [
            {
                id: '11111111-1111-1111-1111-111111111111',
                app_id: 'com.foo.bar',
                app_name: 'Foo',
                app_icon: 'icon',
                country: 'us',
                source: 'google-play',
                score: 4.2,
                created_at: '2026-05-01T00:00:00Z',
            },
        ];
        const chain = makeChain({ data: rows, error: null });
        mockCreateClient.mockReturnValue(makeSupabase(chain));

        const result = await listAnalyses('a@b.c');

        expect(result).toHaveLength(1);
        expect(result[0]).toEqual({
            id: rows[0].id,
            appId: 'com.foo.bar',
            appName: 'Foo',
            appIcon: 'icon',
            country: 'us',
            source: 'google-play',
            score: 4.2,
            createdAt: '2026-05-01T00:00:00Z',
        });
    });

    it('returns an empty array when Supabase returns null data', async () => {
        const chain = makeChain({ data: null, error: null });
        mockCreateClient.mockReturnValue(makeSupabase(chain));

        const result = await listAnalyses('a@b.c');
        expect(result).toEqual([]);
    });
});

describe('getAnalysisById', () => {
    afterEach(() => mockCreateClient.mockReset());

    it('returns the full detail when the row exists', async () => {
        const chain = makeChain({ data: fullRow, error: null });
        mockCreateClient.mockReturnValue(makeSupabase(chain));

        const detail = await getAnalysisById(fullRow.id);

        expect(detail).not.toBeNull();
        expect(detail?.userEmail).toBe('a@b.c');
        expect(detail?.payload.appName).toBe('Foo');
    });

    it('returns null when the row does not exist', async () => {
        const chain = makeChain({ data: null, error: null });
        mockCreateClient.mockReturnValue(makeSupabase(chain));

        const detail = await getAnalysisById(fullRow.id);
        expect(detail).toBeNull();
    });
});

describe('deleteAllAnalyses', () => {
    afterEach(() => mockCreateClient.mockReset());

    it('deletes only the caller\'s rows and returns the deleted count', async () => {
        const chain = makeChain({ data: null, error: null, count: 7 });
        mockCreateClient.mockReturnValue(makeSupabase(chain));

        const deleted = await deleteAllAnalyses('a@b.c');

        expect(deleted).toBe(7);
        expect(chain.delete).toHaveBeenCalledWith({ count: 'exact' });
        expect(chain.eq).toHaveBeenCalledWith('user_email', 'a@b.c');
    });

    it('returns 0 when the user has no rows', async () => {
        const chain = makeChain({ data: null, error: null, count: 0 });
        mockCreateClient.mockReturnValue(makeSupabase(chain));

        expect(await deleteAllAnalyses('a@b.c')).toBe(0);
    });

    it('throws so the route can surface the failure', async () => {
        const chain = makeChain({ data: null, error: { message: 'rls' }, count: null });
        mockCreateClient.mockReturnValue(makeSupabase(chain));

        await expect(deleteAllAnalyses('a@b.c')).rejects.toThrow(/rls/);
    });
});

describe('buildResponse', () => {
    it('merges the saved row, payload, rate-limit and cached flag', () => {
        const response = buildResponse(
            { id: 'abc', createdAt: '2026-05-01T00:00:00Z' },
            {
                appName: 'Foo',
                appIcon: 'i',
                lastUpdated: 'Today',
                installs: '1M+',
                score: 4.2,
                ratings: 1,
                price: 'Free',
                free: true,
                offersIAP: false,
                top_complaints: [],
                feature_requests: [],
                sentiment_summary: '',
                app_ideas: [],
                badReviews: [],
            },
            { remaining: 1, total: 2, limitReached: false },
            false,
        );

        expect(response.id).toBe('abc');
        expect(response.cached).toBe(false);
        expect(response.createdAt).toBe('2026-05-01T00:00:00Z');
        expect(response.rateLimit?.remaining).toBe(1);
    });

    it('omits rateLimit when the route does not provide one (cache hits)', () => {
        const response = buildResponse(
            { id: 'abc', createdAt: '2026-05-01T00:00:00Z' },
            {
                appName: 'Foo',
                appIcon: 'i',
                lastUpdated: 'Today',
                installs: '1M+',
                score: 4.2,
                ratings: 1,
                price: 'Free',
                free: true,
                offersIAP: false,
                top_complaints: [],
                feature_requests: [],
                sentiment_summary: '',
                app_ideas: [],
                badReviews: [],
            },
            undefined,
            true,
        );
        expect(response.cached).toBe(true);
        expect(response.rateLimit).toBeUndefined();
    });
});
