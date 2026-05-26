import 'server-only';

import { CACHE_WINDOW_MS } from '@/config/analyses';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import type {
    AIAnalysisResult,
    AnalysisResponse,
    AnalysisSummary,
    AppInfo,
} from '@/lib/schemas/analysis';

/**
 * Persistent storage of completed analyses.
 *
 * Two read paths:
 *   - findCachedAnalysis(): pre-Gemini cache lookup keyed on (appId, country,
 *     source). Cross-user — anyone analyzing the same app within the cache
 *     window reuses the same AI payload.
 *   - getAnalysisById(): hydrates the share page (`/r/[id]`) and the
 *     authenticated viewer in the history detail view.
 *
 * Two write paths:
 *   - saveAnalysis(): inserts a brand-new row after a successful Gemini call.
 *   - cloneCachedAnalysis(): inserts a row that points back to the source via
 *     `cached_from`, so each user's history reflects what they actually
 *     looked up while still letting us trace lineage and skip the AI call.
 */

const TABLE = 'analyses';

interface AnalysisRow {
    id: string;
    user_email: string;
    app_id: string;
    country: string;
    source: string;
    app_name: string;
    app_icon: string;
    last_updated: string;
    installs: string;
    score: number;
    ratings: number;
    price: string;
    free: boolean;
    offers_iap: boolean;
    top_complaints: unknown;
    feature_requests: unknown;
    sentiment_summary: string;
    app_ideas: unknown;
    bad_reviews: unknown;
    cached_from: string | null;
    created_at: string;
}

export interface CachedAnalysisHit {
    id: string;
    payload: AppInfo & AIAnalysisResult;
    createdAt: string;
}

export interface SaveAnalysisInput {
    userEmail: string;
    appId: string;
    country: string;
    source: string;
    payload: AppInfo & AIAnalysisResult;
    cachedFrom?: string | null;
}

function rowToPayload(row: AnalysisRow): AppInfo & AIAnalysisResult {
    return {
        appName: row.app_name,
        appIcon: row.app_icon,
        lastUpdated: row.last_updated,
        installs: row.installs,
        score: row.score,
        ratings: row.ratings,
        price: row.price,
        free: row.free,
        offersIAP: row.offers_iap,
        top_complaints: (row.top_complaints as string[]) ?? [],
        feature_requests: (row.feature_requests as string[]) ?? [],
        sentiment_summary: row.sentiment_summary,
        app_ideas: (row.app_ideas as AIAnalysisResult['app_ideas']) ?? [],
        badReviews: (row.bad_reviews as AIAnalysisResult['badReviews']) ?? [],
    };
}

export async function findCachedAnalysis(
    appId: string,
    country: string,
    source: string,
): Promise<CachedAnalysisHit | null> {
    const supabase = createServerSupabaseClient();
    const cutoff = new Date(Date.now() - CACHE_WINDOW_MS).toISOString();

    const { data, error } = await supabase
        .from(TABLE)
        .select('*')
        .eq('app_id', appId)
        .eq('country', country)
        .eq('source', source)
        .is('cached_from', null)
        .gte('created_at', cutoff)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle<AnalysisRow>();

    if (error) {
        throw new Error(`Cache lookup failed: ${error.message}`);
    }
    if (!data) return null;

    return {
        id: data.id,
        payload: rowToPayload(data),
        createdAt: data.created_at,
    };
}

export async function saveAnalysis(input: SaveAnalysisInput): Promise<{ id: string; createdAt: string }> {
    const supabase = createServerSupabaseClient();
    const { userEmail, appId, country, source, payload, cachedFrom = null } = input;

    const { data, error } = await supabase
        .from(TABLE)
        .insert({
            user_email: userEmail,
            app_id: appId,
            country,
            source,
            app_name: payload.appName,
            app_icon: payload.appIcon,
            last_updated: payload.lastUpdated,
            installs: payload.installs,
            score: payload.score,
            ratings: payload.ratings,
            price: payload.price,
            free: payload.free,
            offers_iap: payload.offersIAP,
            top_complaints: payload.top_complaints,
            feature_requests: payload.feature_requests,
            sentiment_summary: payload.sentiment_summary,
            app_ideas: payload.app_ideas,
            bad_reviews: payload.badReviews,
            cached_from: cachedFrom,
        })
        .select('id, created_at')
        .single<{ id: string; created_at: string }>();

    if (error || !data) {
        throw new Error(`Failed to save analysis: ${error?.message ?? 'unknown error'}`);
    }

    return { id: data.id, createdAt: data.created_at };
}

export async function listAnalyses(
    userEmail: string,
    limit = 50,
): Promise<AnalysisSummary[]> {
    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase
        .from(TABLE)
        .select('id, app_id, app_name, app_icon, country, source, score, created_at')
        .eq('user_email', userEmail)
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error) {
        throw new Error(`Failed to list analyses: ${error.message}`);
    }

    return (data ?? []).map((row) => ({
        id: row.id,
        appId: row.app_id,
        appName: row.app_name,
        appIcon: row.app_icon,
        country: row.country,
        source: row.source,
        score: row.score,
        createdAt: row.created_at,
    }));
}

export interface AnalysisDetail {
    id: string;
    userEmail: string;
    appId: string;
    country: string;
    source: string;
    payload: AppInfo & AIAnalysisResult;
    createdAt: string;
}

export async function getAnalysisById(id: string): Promise<AnalysisDetail | null> {
    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase
        .from(TABLE)
        .select('*')
        .eq('id', id)
        .maybeSingle<AnalysisRow>();

    if (error) {
        throw new Error(`Failed to fetch analysis: ${error.message}`);
    }
    if (!data) return null;

    return {
        id: data.id,
        userEmail: data.user_email,
        appId: data.app_id,
        country: data.country,
        source: data.source,
        payload: rowToPayload(data),
        createdAt: data.created_at,
    };
}

export function buildResponse(
    saved: { id: string; createdAt: string },
    payload: AppInfo & AIAnalysisResult,
    rateLimit: AnalysisResponse['rateLimit'],
    cached: boolean,
): AnalysisResponse {
    return {
        ...payload,
        id: saved.id,
        cached,
        createdAt: saved.createdAt,
        rateLimit,
    };
}
