import 'server-only';

import { auth } from '@/auth';
import { deleteAllAnalyses, listAnalyses } from '@/lib/analyses';
import { NextResponse } from 'next/server';

/**
 * GET /api/analyses
 *
 * Returns the authenticated user's most recent analyses (summary view —
 * just enough to render the history list). The full payload is fetched on
 * demand from /api/analyses/[id] when the user opens a row.
 */
export async function GET() {
    const session = await auth();
    if (!session?.user?.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const analyses = await listAnalyses(session.user.email);
        return NextResponse.json({ analyses });
    } catch (err) {
        console.error('Failed to list analyses:', err);
        return NextResponse.json(
            { error: 'Failed to list analyses' },
            { status: 500 },
        );
    }
}

/**
 * DELETE /api/analyses
 *
 * Clears the authenticated user's entire history. Returns the number of
 * rows removed so the UI can confirm the wipe.
 */
export async function DELETE() {
    const session = await auth();
    if (!session?.user?.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const deleted = await deleteAllAnalyses(session.user.email);
        return NextResponse.json({ deleted });
    } catch (err) {
        console.error('Failed to delete analyses:', err);
        return NextResponse.json(
            { error: 'Failed to delete analyses' },
            { status: 500 },
        );
    }
}
