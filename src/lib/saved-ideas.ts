import 'server-only';

import { getAnalysisById } from '@/lib/analyses';
import type { AppIdea } from '@/lib/schemas/analysis';
import type { SavedIdea, SavedIdeaStatus } from '@/lib/schemas/saved-idea';
import { createServerSupabaseClient } from '@/lib/supabase/server';

const TABLE = 'saved_ideas';

interface SavedIdeaRow {
    id: string;
    user_email: string;
    analysis_id: string | null;
    idea_index: number;
    idea_payload: unknown;
    app_name: string;
    app_icon: string;
    notes: string;
    status: SavedIdeaStatus;
    created_at: string;
    updated_at: string;
}

function rowToSavedIdea(row: SavedIdeaRow): SavedIdea {
    return {
        id: row.id,
        analysisId: row.analysis_id,
        ideaIndex: row.idea_index,
        idea: row.idea_payload as AppIdea,
        appName: row.app_name,
        appIcon: row.app_icon,
        notes: row.notes,
        status: row.status,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };
}

export class IdeaNotInAnalysisError extends Error {
    constructor(public readonly analysisId: string, public readonly ideaIndex: number) {
        super(`Idea index ${ideaIndex} not found in analysis ${analysisId}`);
        this.name = 'IdeaNotInAnalysisError';
    }
}

export class AnalysisOwnershipError extends Error {
    constructor() {
        super('Analysis does not belong to user');
        this.name = 'AnalysisOwnershipError';
    }
}

export async function saveIdea(input: {
    userEmail: string;
    analysisId: string;
    ideaIndex: number;
}): Promise<SavedIdea> {
    const { userEmail, analysisId, ideaIndex } = input;

    const analysis = await getAnalysisById(analysisId);
    if (!analysis) {
        throw new IdeaNotInAnalysisError(analysisId, ideaIndex);
    }
    // Owner-mismatch is treated as not-found at the route layer; we still
    // distinguish here so the caller can choose the right HTTP status.
    if (analysis.userEmail !== userEmail) {
        throw new AnalysisOwnershipError();
    }

    const ideas = analysis.payload.app_ideas;
    const candidate = ideas[ideaIndex];
    if (!candidate || typeof candidate !== 'object') {
        throw new IdeaNotInAnalysisError(analysisId, ideaIndex);
    }

    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase
        .from(TABLE)
        .insert({
            user_email: userEmail,
            analysis_id: analysisId,
            idea_index: ideaIndex,
            idea_payload: candidate,
            app_name: analysis.payload.appName,
            app_icon: analysis.payload.appIcon,
        })
        .select('*')
        .single<SavedIdeaRow>();

    if (error) {
        // Duplicate save: return the existing row instead of erroring.
        // Makes the bookmark button idempotent under racey double-clicks.
        if (error.code === '23505') {
            const existing = await findSavedIdea(userEmail, analysisId, ideaIndex);
            if (existing) return existing;
        }
        throw new Error(`Failed to save idea: ${error.message}`);
    }
    if (!data) {
        throw new Error('Failed to save idea: no row returned');
    }

    return rowToSavedIdea(data);
}

export async function findSavedIdea(
    userEmail: string,
    analysisId: string,
    ideaIndex: number,
): Promise<SavedIdea | null> {
    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase
        .from(TABLE)
        .select('*')
        .eq('user_email', userEmail)
        .eq('analysis_id', analysisId)
        .eq('idea_index', ideaIndex)
        .maybeSingle<SavedIdeaRow>();
    if (error) {
        throw new Error(`Failed to find saved idea: ${error.message}`);
    }
    return data ? rowToSavedIdea(data) : null;
}

export async function listSavedIdeas(
    userEmail: string,
    filter?: { status?: SavedIdeaStatus },
): Promise<SavedIdea[]> {
    const supabase = createServerSupabaseClient();
    let query = supabase
        .from(TABLE)
        .select('*')
        .eq('user_email', userEmail)
        .order('created_at', { ascending: false });
    if (filter?.status) {
        query = query.eq('status', filter.status);
    }
    const { data, error } = await query;
    if (error) {
        throw new Error(`Failed to list saved ideas: ${error.message}`);
    }
    return (data ?? []).map((row) => rowToSavedIdea(row as SavedIdeaRow));
}

export async function getSavedIdea(
    userEmail: string,
    id: string,
): Promise<SavedIdea | null> {
    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase
        .from(TABLE)
        .select('*')
        .eq('id', id)
        .eq('user_email', userEmail)
        .maybeSingle<SavedIdeaRow>();
    if (error) {
        throw new Error(`Failed to fetch saved idea: ${error.message}`);
    }
    return data ? rowToSavedIdea(data) : null;
}

export async function updateSavedIdea(
    userEmail: string,
    id: string,
    patch: { notes?: string; status?: SavedIdeaStatus },
): Promise<SavedIdea | null> {
    const supabase = createServerSupabaseClient();
    const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (patch.notes !== undefined) update.notes = patch.notes;
    if (patch.status !== undefined) update.status = patch.status;

    const { data, error } = await supabase
        .from(TABLE)
        .update(update)
        .eq('id', id)
        .eq('user_email', userEmail)
        .select('*')
        .maybeSingle<SavedIdeaRow>();
    if (error) {
        throw new Error(`Failed to update saved idea: ${error.message}`);
    }
    return data ? rowToSavedIdea(data) : null;
}

export async function deleteSavedIdea(userEmail: string, id: string): Promise<boolean> {
    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase
        .from(TABLE)
        .delete()
        .eq('id', id)
        .eq('user_email', userEmail)
        .select('id');
    if (error) {
        throw new Error(`Failed to delete saved idea: ${error.message}`);
    }
    return Array.isArray(data) && data.length > 0;
}

export async function savedIndexesForAnalysis(
    userEmail: string,
    analysisId: string,
): Promise<number[]> {
    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase
        .from(TABLE)
        .select('idea_index')
        .eq('user_email', userEmail)
        .eq('analysis_id', analysisId);
    if (error) {
        throw new Error(`Failed to load saved indexes: ${error.message}`);
    }
    return (data ?? []).map((row) => (row as { idea_index: number }).idea_index);
}
