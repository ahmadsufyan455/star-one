import type { AnalysisResponse, ErrorResponse } from '@/types';
import { GoogleGenerativeAI } from '@google/generative-ai';
import gplay from 'google-play-scraper';
import { NextRequest, NextResponse } from 'next/server';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: NextRequest) {
    try {
        // Parse request body
        const body = await request.json();
        const { appId, country = 'us', lang = 'en' } = body;

        // Validate appId
        if (!appId || typeof appId !== 'string') {
            return NextResponse.json<ErrorResponse>(
                { error: 'Invalid request', details: 'appId is required and must be a string' },
                { status: 400 }
            );
        }

        // Check for API key
        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json<ErrorResponse>(
                { error: 'Server configuration error', details: 'GEMINI_API_KEY is not configured' },
                { status: 500 }
            );
        }

        // Step 1: Fetch app details
        let appDetails;
        try {
            appDetails = await gplay.app({
                appId,
                country, // Use selected country
                lang     // Use selected language
            });
        } catch {
            return NextResponse.json<ErrorResponse>(
                {
                    error: 'App not found',
                    details: `Could not find app with ID: ${appId}. Please verify the App ID is correct.`
                },
                { status: 404 }
            );
        }

        // Step 2: Fetch reviews (latest 150)
        let reviewsData;
        try {
            reviewsData = await gplay.reviews({
                appId,
                sort: 1, // 1 = NEWEST
                num: 150,
                country,
                lang
            });
        } catch {
            return NextResponse.json<ErrorResponse>(
                { error: 'Failed to fetch reviews', details: 'Could not retrieve reviews from Google Play' },
                { status: 503 }
            );
        }

        // Step 3: Filter for negative reviews (1-3 stars)
        const negativeReviews = reviewsData.data.filter(
            (review) => review.score <= 3
        );

        // Check if we have enough reviews to analyze
        if (negativeReviews.length === 0) {
            return NextResponse.json<ErrorResponse>(
                {
                    error: 'Insufficient data',
                    details: 'No negative reviews found for this app. Try an app with more user feedback.'
                },
                { status: 422 }
            );
        }

        // Step 4: Combine review texts
        const reviewTexts = negativeReviews
            .map((review) => review.text)
            .filter((text) => text && text.trim().length > 0)
            .join('\n\n---\n\n');

        // Step 5: Analyze with Gemini AI
        const model = genAI.getGenerativeModel({
            model: 'gemini-2.5-flash',
            generationConfig: {
                temperature: 0, // Set to 0 for consistent, deterministic responses
                topP: 1,
                topK: 1,
            }
        });

        const prompt = `You are a product researcher analyzing app reviews to identify feature gaps and opportunities for indie hackers and competitors.

Analyze these negative reviews from the Google Play Store and return a JSON object with the following structure:
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

For app_ideas, suggest 3-5 specific app concepts that could solve the identified problems. Each idea should:
- Target a specific pain point from the complaints/requests
- Be feasible for an indie hacker to build
- Have clear differentiation from the analyzed app
- Include a brief value proposition (1-2 sentences)

Keep each item concise (1-2 sentences max). Limit to top 5-7 items per category.

Reviews to analyze:
${reviewTexts}`;

        let aiResponse;
        try {
            const result = await model.generateContent(prompt);
            const responseText = result.response.text();

            // Extract JSON from response (handle markdown code blocks)
            const jsonMatch = responseText.match(/```json\n?([\s\S]*?)\n?```/) ||
                responseText.match(/\{[\s\S]*\}/);

            if (!jsonMatch) {
                throw new Error('Could not extract JSON from AI response');
            }

            const jsonText = jsonMatch[1] || jsonMatch[0];
            aiResponse = JSON.parse(jsonText);
        } catch (error) {
            console.error('AI Analysis Error:', error);
            return NextResponse.json<ErrorResponse>(
                {
                    error: 'AI analysis failed',
                    details: 'Could not analyze reviews. Please try again.'
                },
                { status: 500 }
            );
        }

        // Helper function to format date to human-readable format
        const formatLastUpdated = (dateString: string): string => {
            if (!dateString || dateString === 'Unknown') return 'Unknown';

            try {
                // Try to parse the date - handle both string dates and timestamps
                let date: Date;

                // Check if it's a timestamp (number as string)
                if (!isNaN(Number(dateString))) {
                    date = new Date(Number(dateString));
                } else {
                    date = new Date(dateString);
                }

                // Validate the date is valid
                if (isNaN(date.getTime())) {
                    return dateString; // Return original if invalid
                }

                const now = new Date();
                const diffTime = Math.abs(now.getTime() - date.getTime());
                const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

                if (diffDays === 0) return 'Today';
                if (diffDays === 1) return 'Yesterday';
                if (diffDays < 7) return `${diffDays} days ago`;
                if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
                if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
                return `${Math.floor(diffDays / 365)} years ago`;
            } catch {
                return dateString; // Return original string if any error occurs
            }
        };

        // Step 6: Return structured response
        const response: AnalysisResponse = {
            appName: appDetails.title,
            appIcon: appDetails.icon,
            lastUpdated: formatLastUpdated(String(appDetails.updated || 'Unknown')),
            installs: String(appDetails.installs || 'Unknown'),
            score: appDetails.score || 0,
            ratings: appDetails.ratings || 0,
            price: String(appDetails.price || 'Free'),
            free: appDetails.free ?? true,
            offersIAP: appDetails.offersIAP ?? false,
            top_complaints: aiResponse.top_complaints || [],
            feature_requests: aiResponse.feature_requests || [],
            sentiment_summary: aiResponse.sentiment_summary || 'Analysis completed',
            app_ideas: aiResponse.app_ideas || [],
            badReviews: negativeReviews.slice(0, 10).map(review => ({
                userName: review.userName || 'Anonymous',
                userImage: review.userImage,
                score: review.score,
                date: formatLastUpdated(String(review.date || 'Unknown')),
                text: review.text || ''
            }))
        };

        return NextResponse.json<AnalysisResponse>(response, { status: 200 });

    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json<ErrorResponse>(
            {
                error: 'Internal server error',
                details: 'An unexpected error occurred. Please try again.'
            },
            { status: 500 }
        );
    }
}
