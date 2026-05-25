import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockAuth, mockConsumeRateLimit, mockGplayApp, mockGplayReviews, mockGenerateContent } = vi.hoisted(() => ({
    mockAuth: vi.fn(),
    mockConsumeRateLimit: vi.fn(),
    mockGplayApp: vi.fn(),
    mockGplayReviews: vi.fn(),
    mockGenerateContent: vi.fn(),
}));

vi.mock('@/auth', () => ({ auth: mockAuth }));
vi.mock('@/lib/rate-limit', () => ({ consumeRateLimit: mockConsumeRateLimit }));
vi.mock('google-play-scraper', () => ({
    default: {
        app: mockGplayApp,
        reviews: mockGplayReviews,
    },
}));
vi.mock('@google/generative-ai', () => ({
    GoogleGenerativeAI: class {
        getGenerativeModel() {
            return { generateContent: mockGenerateContent };
        }
    },
}));

const { POST } = await import('./route');

const makeRequest = (body: unknown): Request =>
    new Request('http://localhost/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });

const validSession = { user: { email: 'test@example.com' } };

const validAiJson = JSON.stringify({
    top_complaints: ['app crashes often'],
    feature_requests: ['dark mode'],
    sentiment_summary: 'mixed',
    app_ideas: [
        {
            name: 'Test Idea',
            pain_point: 'crashes',
            differentiation: 'stable',
            value_proposition: 'reliable',
        },
    ],
});

const validAppDetails = {
    title: 'Test App',
    genre: 'Productivity',
    summary: 'a test app',
    description: 'long description',
    icon: 'https://example.com/icon.png',
    updated: '2025-01-01',
    installs: '1,000,000+',
    score: 4.2,
    ratings: 50000,
    price: '0',
    free: true,
    offersIAP: false,
};

const validReviewsData = {
    data: [
        {
            score: 1,
            userName: 'Alice',
            userImage: 'https://example.com/a.png',
            date: '2025-01-01',
            text: 'It crashed.',
        },
        {
            score: 2,
            userName: 'Bob',
            userImage: undefined,
            date: '2025-01-02',
            text: 'Slow loading times.',
        },
    ],
};

describe('POST /api/analyze', () => {
    beforeEach(() => {
        vi.stubEnv('GEMINI_API_KEY', 'test_gemini_key');
        mockAuth.mockReset();
        mockConsumeRateLimit.mockReset();
        mockGplayApp.mockReset();
        mockGplayReviews.mockReset();
        mockGenerateContent.mockReset();
    });

    it('returns 401 when the user is not authenticated', async () => {
        mockAuth.mockResolvedValue(null);

        const response = await POST(makeRequest({ appId: 'com.example.app' }) as never);
        const body = await response.json();

        expect(response.status).toBe(401);
        expect(body.error).toBe('Unauthorized');
        expect(mockGplayApp).not.toHaveBeenCalled();
        expect(mockConsumeRateLimit).not.toHaveBeenCalled();
    });

    it('returns 400 when appId fails format validation', async () => {
        mockAuth.mockResolvedValue(validSession);

        const response = await POST(makeRequest({ appId: 'instagram' }) as never);
        const body = await response.json();

        expect(response.status).toBe(400);
        expect(body.error).toBe('Invalid request');
        expect(mockConsumeRateLimit).not.toHaveBeenCalled();
        expect(mockGplayApp).not.toHaveBeenCalled();
    });

    it('returns 400 when country is not a known region code', async () => {
        mockAuth.mockResolvedValue(validSession);

        const response = await POST(
            makeRequest({ appId: 'com.example.app', country: 'fr' }) as never,
        );

        expect(response.status).toBe(400);
        expect(mockGplayApp).not.toHaveBeenCalled();
    });

    it('returns 429 when the user has exhausted their rate limit', async () => {
        mockAuth.mockResolvedValue(validSession);
        mockConsumeRateLimit.mockResolvedValue({ allowed: false, used: 2, remaining: 0, total: 2 });

        const response = await POST(makeRequest({ appId: 'com.example.app' }) as never);
        const body = await response.json();

        expect(response.status).toBe(429);
        expect(body.rateLimitExceeded).toBe(true);
        expect(body.total).toBe(2);
        expect(mockGplayApp).not.toHaveBeenCalled();
    });

    it('returns 200 with the analysis payload on the happy path', async () => {
        mockAuth.mockResolvedValue(validSession);
        mockConsumeRateLimit.mockResolvedValue({ allowed: true, used: 1, remaining: 1, total: 2 });
        mockGplayApp.mockResolvedValue(validAppDetails);
        mockGplayReviews.mockResolvedValue(validReviewsData);
        mockGenerateContent.mockResolvedValue({
            response: { text: () => '```json\n' + validAiJson + '\n```' },
        });

        const response = await POST(makeRequest({ appId: 'com.example.app' }) as never);
        const body = await response.json();

        expect(response.status).toBe(200);
        expect(body.appName).toBe('Test App');
        expect(body.top_complaints).toEqual(['app crashes often']);
        expect(body.feature_requests).toEqual(['dark mode']);
        expect(body.app_ideas).toHaveLength(1);
        expect(body.badReviews).toHaveLength(2);
        expect(body.rateLimit).toEqual({ remaining: 1, total: 2, limitReached: false });
    });
});
