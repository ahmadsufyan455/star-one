import 'server-only';

import { auth } from '@/auth';
import { RATE_LIMIT_MAX } from '@/config/rate-limit';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

interface PeekRow {
    allowed: boolean;
    used: number;
    remaining: number;
    total: number;
}

/**
 * GET /api/quota
 *
 * Read-only quota lookup. Mirrors the shape of the `consume_analysis_quota`
 * RPC's return so the client can render the badge ("N/2 daily analyses left")
 * before submitting the form for the first time.
 *
 * Authenticated only. Returns 401 for anonymous callers — this is consistent
 * with /api/analyze itself; the analyze page is gated by middleware so an
 * unauthenticated request shouldn't reach here in practice.
 */
export async function GET() {
    const session = await auth();
    if (!session?.user?.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase.rpc('peek_analysis_quota', {
        p_user_email: session.user.email,
        p_max_count: RATE_LIMIT_MAX,
    });

    if (error) {
        return NextResponse.json(
            { error: 'Failed to read quota', details: error.message },
            { status: 503 },
        );
    }

    const row = (Array.isArray(data) ? data[0] : data) as PeekRow | undefined;
    if (!row) {
        return NextResponse.json(
            { error: 'Quota lookup returned no data' },
            { status: 503 },
        );
    }

    return NextResponse.json({
        allowed: row.allowed,
        used: row.used,
        remaining: row.remaining,
        total: row.total,
    });
}
