import 'server-only';

import { auth } from '@/auth';
import { savedIndexesForAnalysis } from '@/lib/saved-ideas';
import { NextRequest, NextResponse } from 'next/server';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * GET /api/ideas/by-analysis/[id]
 *
 * Returns the set of idea indexes the user has already saved from a given
 * analysis. Used by the bookmark button in the result view to render the
 * "already saved" state on first render without a per-card lookup.
 */
export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    const session = await auth();
    if (!session?.user?.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    if (!UUID_RE.test(id)) {
        return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
    }

    try {
        const indexes = await savedIndexesForAnalysis(session.user.email, id);
        return NextResponse.json({ indexes });
    } catch (err) {
        console.error('Failed to load saved indexes:', err);
        return NextResponse.json({ error: 'Failed to load saved indexes' }, { status: 500 });
    }
}
