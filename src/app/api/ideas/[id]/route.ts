import 'server-only';

import { auth } from '@/auth';
import { deleteSavedIdea, updateSavedIdea } from '@/lib/saved-ideas';
import { UpdateSavedIdeaRequestSchema } from '@/lib/schemas/saved-idea';
import { NextRequest, NextResponse } from 'next/server';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function PATCH(
    request: NextRequest,
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

    let rawBody: unknown;
    try {
        rawBody = await request.json();
    } catch {
        return NextResponse.json(
            { error: 'Invalid request', details: 'Body must be valid JSON' },
            { status: 400 },
        );
    }

    const parsed = UpdateSavedIdeaRequestSchema.safeParse(rawBody);
    if (!parsed.success) {
        return NextResponse.json(
            { error: 'Invalid request', details: parsed.error.issues[0]?.message },
            { status: 400 },
        );
    }

    try {
        const updated = await updateSavedIdea(session.user.email, id, parsed.data);
        if (!updated) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }
        return NextResponse.json({ idea: updated });
    } catch (err) {
        console.error('Failed to update saved idea:', err);
        return NextResponse.json({ error: 'Failed to update saved idea' }, { status: 500 });
    }
}

export async function DELETE(
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
        const ok = await deleteSavedIdea(session.user.email, id);
        if (!ok) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }
        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('Failed to delete saved idea:', err);
        return NextResponse.json({ error: 'Failed to delete saved idea' }, { status: 500 });
    }
}
