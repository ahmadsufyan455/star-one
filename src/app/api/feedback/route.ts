import { FeedbackRequestSchema } from '@/lib/schemas/feedback';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    let rawBody: unknown;
    try {
        rawBody = await request.json();
    } catch {
        return NextResponse.json(
            { error: 'Invalid request', details: 'Request body must be valid JSON' },
            { status: 400 }
        );
    }

    const parsed = FeedbackRequestSchema.safeParse(rawBody);
    if (!parsed.success) {
        const firstIssue = parsed.error.issues[0];
        return NextResponse.json(
            { error: 'Invalid request', details: firstIssue?.message ?? 'Request validation failed' },
            { status: 400 }
        );
    }

    const { email, rating, feedback, timestamp } = parsed.data;

    try {
        const supabase = createServerSupabaseClient();

        const { error } = await supabase.from('feedback').insert({
            user_email: email || 'anonymous',
            rating,
            feedback: feedback.trim(),
            created_at: timestamp || new Date().toISOString(),
        });

        if (error) {
            console.error('Failed to save feedback:', error);
            return NextResponse.json(
                { error: 'Failed to save feedback' },
                { status: 500 }
            );
        }

        return NextResponse.json(
            { success: true, message: 'Feedback saved successfully' },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error processing feedback:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
