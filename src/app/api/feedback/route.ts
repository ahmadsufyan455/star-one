import { createServerSupabaseClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, rating, feedback, timestamp } = body;

        // Validate input
        if (!rating || !feedback) {
            return NextResponse.json(
                { error: 'Rating and feedback are required' },
                { status: 400 }
            );
        }

        if (rating < 1 || rating > 5) {
            return NextResponse.json(
                { error: 'Rating must be between 1 and 5' },
                { status: 400 }
            );
        }

        // Save to Supabase
        const supabase = createServerSupabaseClient();

        const { error } = await supabase
            .from('feedback')
            .insert({
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

        console.log(`✅ Feedback received from ${email || 'anonymous'}: ${rating}⭐`);

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
