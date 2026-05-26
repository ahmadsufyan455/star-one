import 'server-only';

import { auth } from '@/auth';
import {
    AnalysisOwnershipError,
    IdeaNotInAnalysisError,
    listSavedIdeas,
    saveIdea,
} from '@/lib/saved-ideas';
import { SaveIdeaRequestSchema, SavedIdeaStatusSchema } from '@/lib/schemas/saved-idea';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/ideas
 *
 * Returns the authenticated user's saved ideas, newest first. Optional
 * `?status=idea|building|shipped|skipped` filter mirrors the workspace UI.
 */
export async function GET(request: NextRequest) {
    const session = await auth();
    if (!session?.user?.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const statusParam = request.nextUrl.searchParams.get('status');
    const filter = statusParam
        ? { status: SavedIdeaStatusSchema.safeParse(statusParam) }
        : null;
    if (filter && !filter.status.success) {
        return NextResponse.json({ error: 'Invalid status filter' }, { status: 400 });
    }

    try {
        const ideas = await listSavedIdeas(
            session.user.email,
            filter ? { status: filter.status.data } : undefined,
        );
        return NextResponse.json({ ideas });
    } catch (err) {
        console.error('Failed to list saved ideas:', err);
        return NextResponse.json({ error: 'Failed to list saved ideas' }, { status: 500 });
    }
}

/**
 * POST /api/ideas
 *
 * Saves the idea at `ideaIndex` from a given `analysisId`. The route copies
 * the idea payload from the source analysis so the saved row is
 * self-contained (history can be cleared without losing saved ideas).
 */
export async function POST(request: NextRequest) {
    const session = await auth();
    if (!session?.user?.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let rawBody: unknown;
    try {
        rawBody = await request.json();
    } catch {
        return NextResponse.json(
            { error: 'Invalid request', details: 'Body must be valid JSON' },
            { status: 400 },
        );
    }

    const parsed = SaveIdeaRequestSchema.safeParse(rawBody);
    if (!parsed.success) {
        return NextResponse.json(
            { error: 'Invalid request', details: parsed.error.issues[0]?.message },
            { status: 400 },
        );
    }

    try {
        const idea = await saveIdea({
            userEmail: session.user.email,
            analysisId: parsed.data.analysisId,
            ideaIndex: parsed.data.ideaIndex,
        });
        return NextResponse.json({ idea }, { status: 201 });
    } catch (err) {
        // Owner-mismatch leaks as 404 on purpose so callers can't probe ids.
        if (err instanceof AnalysisOwnershipError) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }
        if (err instanceof IdeaNotInAnalysisError) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }
        console.error('Failed to save idea:', err);
        return NextResponse.json({ error: 'Failed to save idea' }, { status: 500 });
    }
}
