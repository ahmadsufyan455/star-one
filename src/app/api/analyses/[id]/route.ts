import 'server-only';

import { auth } from '@/auth';
import { getAnalysisById } from '@/lib/analyses';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/analyses/[id]
 *
 * Returns a single full analysis. Two access modes:
 *
 *   - `?share=1` → public read-only view (powers /r/[id]). Only safe fields
 *     are included; we never leak the owner email or any private metadata.
 *   - default → owner-only. Authenticated users can fetch their own row;
 *     other users get 404 (not 403, to avoid leaking that the row exists).
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    const { id } = await params;
    const isShare = request.nextUrl.searchParams.get('share') === '1';

    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
        return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
    }

    let analysis;
    try {
        analysis = await getAnalysisById(id);
    } catch (err) {
        console.error('Failed to load analysis:', err);
        return NextResponse.json({ error: 'Internal error' }, { status: 500 });
    }
    if (!analysis) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    if (isShare) {
        return NextResponse.json({
            id: analysis.id,
            createdAt: analysis.createdAt,
            ...analysis.payload,
        });
    }

    const session = await auth();
    if (!session?.user?.email || session.user.email !== analysis.userEmail) {
        // Owner-mismatch leaks as 404 on purpose so callers can't probe ids.
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({
        id: analysis.id,
        createdAt: analysis.createdAt,
        ...analysis.payload,
    });
}
