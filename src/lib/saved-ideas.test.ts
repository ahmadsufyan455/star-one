import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

const { mockCreateClient, mockGetAnalysisById } = vi.hoisted(() => ({
    mockCreateClient: vi.fn(),
    mockGetAnalysisById: vi.fn(),
}));

vi.mock('@/lib/supabase/server', () => ({
    createServerSupabaseClient: mockCreateClient,
}));

vi.mock('@/lib/analyses', () => ({
    getAnalysisById: mockGetAnalysisById,
}));

const {
    saveIdea,
    findSavedIdea,
    listSavedIdeas,
    getSavedIdea,
    updateSavedIdea,
    deleteSavedIdea,
    savedIndexesForAnalysis,
    AnalysisOwnershipError,
    IdeaNotInAnalysisError,
} = await import('./saved-ideas');

interface QueryResult { data: unknown; error: unknown }

interface ChainMock {
    select: ReturnType<typeof vi.fn>;
    insert: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
    eq: ReturnType<typeof vi.fn>;
    order: ReturnType<typeof vi.fn>;
    single: ReturnType<typeof vi.fn>;
    maybeSingle: ReturnType<typeof vi.fn>;
    then: (resolve: (value: QueryResult) => unknown, reject: (reason: unknown) => unknown) => Promise<unknown>;
}

function makeChain(result: QueryResult): ChainMock {
    const chain = {} as ChainMock;
    const ret = () => chain;
    chain.select = vi.fn(ret);
    chain.insert = vi.fn(ret);
    chain.update = vi.fn(ret);
    chain.delete = vi.fn(ret);
    chain.eq = vi.fn(ret);
    chain.order = vi.fn(ret);
    chain.single = vi.fn(() => Promise.resolve(result));
    chain.maybeSingle = vi.fn(() => Promise.resolve(result));
    chain.then = (resolve, reject) => Promise.resolve(result).then(resolve, reject);
    return chain;
}

function makeSupabase(chain: ChainMock) {
    const from = vi.fn(() => chain);
    return { from };
}

const validAppIdea = {
    name: 'CleanFeed',
    pain_point: 'Too noisy',
    differentiation: 'Algorithm-free',
    value_proposition: 'Pure chronological feed',
};

const sampleAnalysis = {
    id: '11111111-1111-1111-1111-111111111111',
    userEmail: 'user@example.com',
    appId: 'com.example.app',
    country: 'us',
    source: 'google-play',
    payload: {
        appName: 'Example',
        appIcon: 'https://example.com/icon.png',
        lastUpdated: 'Today',
        installs: '1M+',
        score: 4.0,
        ratings: 1000,
        price: 'Free',
        free: true,
        offersIAP: false,
        top_complaints: [],
        feature_requests: [],
        sentiment_summary: '',
        app_ideas: [validAppIdea],
        badReviews: [],
    },
    createdAt: '2026-05-01T00:00:00Z',
};

const sampleSavedRow = {
    id: '22222222-2222-2222-2222-222222222222',
    user_email: 'user@example.com',
    analysis_id: sampleAnalysis.id,
    idea_index: 0,
    idea_payload: validAppIdea,
    app_name: 'Example',
    app_icon: 'https://example.com/icon.png',
    notes: '',
    status: 'idea',
    created_at: '2026-05-01T00:00:00Z',
    updated_at: '2026-05-01T00:00:00Z',
};

describe('saveIdea', () => {
    beforeEach(() => {
        mockCreateClient.mockReset();
        mockGetAnalysisById.mockReset();
    });
    afterEach(() => {
        mockCreateClient.mockReset();
    });

    it('inserts a new row and snapshots the idea payload from the source analysis', async () => {
        mockGetAnalysisById.mockResolvedValue(sampleAnalysis);
        const chain = makeChain({ data: sampleSavedRow, error: null });
        mockCreateClient.mockReturnValue(makeSupabase(chain));

        const result = await saveIdea({
            userEmail: 'user@example.com',
            analysisId: sampleAnalysis.id,
            ideaIndex: 0,
        });

        expect(result.idea.name).toBe('CleanFeed');
        expect(result.appName).toBe('Example');
        expect(result.status).toBe('idea');
        const insertArg = chain.insert.mock.calls[0]?.[0];
        expect(insertArg.idea_payload).toEqual(validAppIdea);
        expect(insertArg.user_email).toBe('user@example.com');
    });

    it('throws AnalysisOwnershipError when the analysis belongs to a different user', async () => {
        mockGetAnalysisById.mockResolvedValue({
            ...sampleAnalysis,
            userEmail: 'someone-else@example.com',
        });
        mockCreateClient.mockReturnValue(makeSupabase(makeChain({ data: null, error: null })));

        await expect(
            saveIdea({
                userEmail: 'user@example.com',
                analysisId: sampleAnalysis.id,
                ideaIndex: 0,
            }),
        ).rejects.toBeInstanceOf(AnalysisOwnershipError);
    });

    it('throws IdeaNotInAnalysisError when the analysis does not exist', async () => {
        mockGetAnalysisById.mockResolvedValue(null);
        mockCreateClient.mockReturnValue(makeSupabase(makeChain({ data: null, error: null })));

        await expect(
            saveIdea({
                userEmail: 'user@example.com',
                analysisId: sampleAnalysis.id,
                ideaIndex: 0,
            }),
        ).rejects.toBeInstanceOf(IdeaNotInAnalysisError);
    });

    it('throws IdeaNotInAnalysisError when ideaIndex is out of bounds', async () => {
        mockGetAnalysisById.mockResolvedValue(sampleAnalysis);
        mockCreateClient.mockReturnValue(makeSupabase(makeChain({ data: null, error: null })));

        await expect(
            saveIdea({
                userEmail: 'user@example.com',
                analysisId: sampleAnalysis.id,
                ideaIndex: 99,
            }),
        ).rejects.toBeInstanceOf(IdeaNotInAnalysisError);
    });

    it('returns the existing row when the dedupe constraint fires (idempotent saves)', async () => {
        mockGetAnalysisById.mockResolvedValue(sampleAnalysis);
        const insertChain = makeChain({ data: null, error: { code: '23505', message: 'dup' } });
        const lookupChain = makeChain({ data: sampleSavedRow, error: null });
        mockCreateClient
            .mockReturnValueOnce(makeSupabase(insertChain))
            .mockReturnValueOnce(makeSupabase(lookupChain));

        const result = await saveIdea({
            userEmail: 'user@example.com',
            analysisId: sampleAnalysis.id,
            ideaIndex: 0,
        });

        expect(result.id).toBe(sampleSavedRow.id);
    });
});

describe('findSavedIdea', () => {
    afterEach(() => mockCreateClient.mockReset());

    it('returns the saved idea when it exists', async () => {
        const chain = makeChain({ data: sampleSavedRow, error: null });
        mockCreateClient.mockReturnValue(makeSupabase(chain));

        const result = await findSavedIdea('user@example.com', sampleAnalysis.id, 0);
        expect(result?.id).toBe(sampleSavedRow.id);
    });

    it('returns null when no row matches', async () => {
        const chain = makeChain({ data: null, error: null });
        mockCreateClient.mockReturnValue(makeSupabase(chain));

        const result = await findSavedIdea('user@example.com', sampleAnalysis.id, 0);
        expect(result).toBeNull();
    });
});

describe('listSavedIdeas', () => {
    afterEach(() => mockCreateClient.mockReset());

    it('returns all of the user\'s saved ideas, newest first', async () => {
        const chain = makeChain({ data: [sampleSavedRow], error: null });
        mockCreateClient.mockReturnValue(makeSupabase(chain));

        const result = await listSavedIdeas('user@example.com');

        expect(result).toHaveLength(1);
        expect(chain.order).toHaveBeenCalledWith('created_at', { ascending: false });
    });

    it('applies the status filter when provided', async () => {
        const chain = makeChain({ data: [], error: null });
        mockCreateClient.mockReturnValue(makeSupabase(chain));

        await listSavedIdeas('user@example.com', { status: 'shipped' });

        const eqCalls = chain.eq.mock.calls.map((call) => call[0]);
        expect(eqCalls).toContain('user_email');
        expect(eqCalls).toContain('status');
    });

    it('returns an empty array when the table is empty', async () => {
        const chain = makeChain({ data: null, error: null });
        mockCreateClient.mockReturnValue(makeSupabase(chain));

        const result = await listSavedIdeas('user@example.com');
        expect(result).toEqual([]);
    });
});

describe('getSavedIdea', () => {
    afterEach(() => mockCreateClient.mockReset());

    it('hydrates a single saved idea by id', async () => {
        const chain = makeChain({ data: sampleSavedRow, error: null });
        mockCreateClient.mockReturnValue(makeSupabase(chain));

        const result = await getSavedIdea('user@example.com', sampleSavedRow.id);
        expect(result?.idea.name).toBe('CleanFeed');
    });

    it('returns null when the row does not belong to the user (RLS-equivalent)', async () => {
        const chain = makeChain({ data: null, error: null });
        mockCreateClient.mockReturnValue(makeSupabase(chain));

        const result = await getSavedIdea('user@example.com', sampleSavedRow.id);
        expect(result).toBeNull();
    });
});

describe('updateSavedIdea', () => {
    afterEach(() => mockCreateClient.mockReset());

    it('only writes the fields included in the patch', async () => {
        const chain = makeChain({
            data: { ...sampleSavedRow, status: 'building' },
            error: null,
        });
        mockCreateClient.mockReturnValue(makeSupabase(chain));

        await updateSavedIdea('user@example.com', sampleSavedRow.id, { status: 'building' });

        const updateArg = chain.update.mock.calls[0]?.[0] as Record<string, unknown>;
        expect(updateArg.status).toBe('building');
        expect(updateArg.notes).toBeUndefined();
        expect(updateArg.updated_at).toBeDefined();
    });

    it('returns null when the row is missing', async () => {
        const chain = makeChain({ data: null, error: null });
        mockCreateClient.mockReturnValue(makeSupabase(chain));

        const result = await updateSavedIdea('user@example.com', sampleSavedRow.id, {
            notes: 'hi',
        });
        expect(result).toBeNull();
    });
});

describe('deleteSavedIdea', () => {
    afterEach(() => mockCreateClient.mockReset());

    it('returns true when a row is removed', async () => {
        const chain = makeChain({ data: [{ id: sampleSavedRow.id }], error: null });
        mockCreateClient.mockReturnValue(makeSupabase(chain));

        const result = await deleteSavedIdea('user@example.com', sampleSavedRow.id);
        expect(result).toBe(true);
    });

    it('returns false when no row matched', async () => {
        const chain = makeChain({ data: [], error: null });
        mockCreateClient.mockReturnValue(makeSupabase(chain));

        const result = await deleteSavedIdea('user@example.com', sampleSavedRow.id);
        expect(result).toBe(false);
    });
});

describe('savedIndexesForAnalysis', () => {
    afterEach(() => mockCreateClient.mockReset());

    it('extracts just the idea_index values for a given analysis', async () => {
        const chain = makeChain({
            data: [{ idea_index: 0 }, { idea_index: 2 }],
            error: null,
        });
        mockCreateClient.mockReturnValue(makeSupabase(chain));

        const indexes = await savedIndexesForAnalysis('user@example.com', sampleAnalysis.id);
        expect(indexes).toEqual([0, 2]);
    });

    it('returns [] when the user has saved nothing from this analysis', async () => {
        const chain = makeChain({ data: null, error: null });
        mockCreateClient.mockReturnValue(makeSupabase(chain));

        const indexes = await savedIndexesForAnalysis('user@example.com', sampleAnalysis.id);
        expect(indexes).toEqual([]);
    });
});