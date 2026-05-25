import { auth } from '@/auth';
import { consumeRateLimit } from '@/lib/rate-limit';
import { AnalysisRequestSchema, type ErrorResponse } from '@/lib/schemas/analysis';
import { AppNotFoundError, ReviewsFetchError, getReviewSource } from '@/lib/sources';
import { formatRelativeDate } from '@/lib/utils/format';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const REVIEW_FETCH_LIMIT = 150;

export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json<ErrorResponse>(
                { error: 'Unauthorized', details: 'You must be logged in to analyze apps' },
                { status: 401 }
            );
        }

        const userEmail = session.user.email;

        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json<ErrorResponse>(
                { error: 'Server configuration error', details: 'GEMINI_API_KEY is not configured' },
                { status: 500 }
            );
        }

        let rawBody: unknown;
        try {
            rawBody = await request.json();
        } catch {
            return NextResponse.json<ErrorResponse>(
                { error: 'Invalid request', details: 'Request body must be valid JSON' },
                { status: 400 }
            );
        }

        const parsed = AnalysisRequestSchema.safeParse(rawBody);
        if (!parsed.success) {
            const firstIssue = parsed.error.issues[0];
            return NextResponse.json<ErrorResponse>(
                { error: 'Invalid request', details: firstIssue?.message ?? 'Request validation failed' },
                { status: 400 }
            );
        }

        const { appId, country, lang, source: sourceId } = parsed.data;

        let quota;
        try {
            quota = await consumeRateLimit(userEmail);
        } catch (error) {
            console.error('Rate limit error:', error);
            return NextResponse.json<ErrorResponse>(
                { error: 'Service unavailable', details: 'Could not verify analysis quota. Please try again.' },
                { status: 503 }
            );
        }

        if (!quota.allowed) {
            return NextResponse.json(
                {
                    error: 'Rate limit exceeded',
                    details: `You've reached your limit of ${quota.total} analyses. Please try again later.`,
                    rateLimitExceeded: true,
                    remaining: 0,
                    total: quota.total,
                },
                { status: 429 }
            );
        }

        const source = getReviewSource(sourceId);
        let appInfo;
        let reviews;
        try {
            appInfo = await source.fetchAppInfo({ appId, country, lang });
            reviews = await source.fetchReviews({ appId, country, lang, limit: REVIEW_FETCH_LIMIT });
        } catch (error) {
            if (error instanceof AppNotFoundError) {
                return NextResponse.json<ErrorResponse>(
                    {
                        error: 'App not found',
                        details: `Could not find app with ID: ${appId}. Please verify the App ID is correct.`,
                    },
                    { status: 404 }
                );
            }
            if (error instanceof ReviewsFetchError) {
                return NextResponse.json<ErrorResponse>(
                    { error: 'Failed to fetch reviews', details: `Could not retrieve reviews from ${source.displayName}` },
                    { status: 503 }
                );
            }
            throw error;
        }

        const negativeReviews = reviews.filter((review) => review.score <= 3);

        if (negativeReviews.length === 0) {
            return NextResponse.json<ErrorResponse>(
                {
                    error: 'Insufficient data',
                    details: 'No negative reviews found for this app. Try an app with more user feedback.',
                },
                { status: 422 }
            );
        }

        const reviewTexts = negativeReviews
            .map((review) => review.text)
            .filter((text) => text && text.trim().length > 0)
            .join('\n\n---\n\n');

        const model = genAI.getGenerativeModel({
            model: 'gemini-2.5-flash',
            generationConfig: { temperature: 0, topP: 1, topK: 1 },
        });

        const prompt = `You are a product researcher analyzing app reviews to identify feature gaps and opportunities for indie hackers and competitors.

APP CONTEXT:
- App Name: ${appInfo.title}
- Category: ${appInfo.genre || 'Not specified'}
- Description: ${appInfo.summary || appInfo.description || 'Not available'}

Analyze these negative reviews from ${source.displayName} and return a JSON object with the following structure:
{
  "top_complaints": ["complaint 1", "complaint 2", "complaint 3", ...],
  "feature_requests": ["feature 1", "feature 2", "feature 3", ...],
  "sentiment_summary": "one sentence overview of the overall sentiment",
  "app_ideas": [
    {
      "name": "App Name",
      "pain_point": "Specific user pain point this solves",
      "differentiation": "How it differs from the analyzed app",
      "value_proposition": "Clear value for users"
    },
    ...
  ]
}

Focus on:
- Missing features users explicitly request
- Functional gaps (not just bug reports)
- Patterns across multiple reviews
- Actionable insights that competitors could capitalize on

For app_ideas, suggest 3-5 specific app concepts that could solve the identified problems. IMPORTANT: All ideas must be relevant to "${appInfo.title}" and its category (${appInfo.genre || 'the app\'s niche'}). Each idea should be ONE of the following:
1. **Direct Competitor**: Same category, better execution of core features
2. **Niche Alternative**: Same category, different angle or specialized focus
3. **Complementary Tool**: Adjacent category that enhances or extends the app's use case

Each idea should:
- Target the same or adjacent audience as "${appInfo.title}"
- Address specific pain points from the complaints/requests
- Be feasible for an indie hacker to build (mobile, web, or desktop)
- Have clear differentiation from "${appInfo.title}"
- Include a brief value proposition (1-2 sentences)
- Stay within or adjacent to the ${appInfo.genre || 'app\'s'} category

Keep each item concise (1-2 sentences max). Limit to top 5-7 items per category.

Reviews to analyze:
${reviewTexts}`;

        let aiResponse;
        try {
            const result = await model.generateContent(prompt);
            const responseText = result.response.text();

            const jsonMatch =
                responseText.match(/```json\n?([\s\S]*?)\n?```/) ||
                responseText.match(/\{[\s\S]*\}/);

            if (!jsonMatch) {
                throw new Error('Could not extract JSON from AI response');
            }

            aiResponse = JSON.parse(jsonMatch[1] || jsonMatch[0]);
        } catch (error) {
            console.error('AI Analysis Error:', error);
            return NextResponse.json<ErrorResponse>(
                { error: 'AI analysis failed', details: 'Could not analyze reviews. Please try again.' },
                { status: 500 }
            );
        }

        return NextResponse.json(
            {
                appName: appInfo.title,
                appIcon: appInfo.icon,
                lastUpdated: formatRelativeDate(appInfo.updated),
                installs: appInfo.installs,
                score: appInfo.score,
                ratings: appInfo.ratings,
                price: appInfo.price,
                free: appInfo.free,
                offersIAP: appInfo.offersIAP,
                top_complaints: aiResponse.top_complaints || [],
                feature_requests: aiResponse.feature_requests || [],
                sentiment_summary: aiResponse.sentiment_summary || 'Analysis completed',
                app_ideas: aiResponse.app_ideas || [],
                badReviews: negativeReviews.slice(0, 10).map((review) => ({
                    userName: review.userName,
                    userImage: review.userImage,
                    score: review.score,
                    date: formatRelativeDate(review.date),
                    text: review.text,
                })),
                rateLimit: {
                    remaining: quota.remaining,
                    total: quota.total,
                    limitReached: quota.remaining === 0,
                },
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json<ErrorResponse>(
            { error: 'Internal server error', details: 'An unexpected error occurred. Please try again.' },
            { status: 500 }
        );
    }
}
