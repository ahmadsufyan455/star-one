import { createServerSupabaseClient } from '@/lib/supabase/server';
import { RATE_LIMIT_MAX } from '@/config/rate-limit';

export interface RateLimitResult {
    allowed: boolean;
    used: number;
    remaining: number;
    total: number;
}

interface QuotaRow {
    allowed: boolean;
    used: number;
    remaining: number;
    total: number;
}

export async function consumeRateLimit(userEmail: string): Promise<RateLimitResult> {
    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase.rpc('consume_analysis_quota', {
        p_user_email: userEmail,
        p_max_count: RATE_LIMIT_MAX,
    });

    if (error) {
        throw new Error(`Rate limit check failed: ${error.message}`);
    }

    const row = (Array.isArray(data) ? data[0] : data) as QuotaRow | undefined;
    if (!row) {
        throw new Error('Rate limit check returned no data');
    }

    return {
        allowed: row.allowed,
        used: row.used,
        remaining: row.remaining,
        total: row.total,
    };
}

/**
 * Read-only quota lookup. Use this to short-circuit a request BEFORE doing
 * expensive work (scraping, AI calls). The atomic `consumeRateLimit` is
 * still required just before the actual Gemini call to prevent races.
 */
export async function peekRateLimit(userEmail: string): Promise<RateLimitResult> {
    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase.rpc('peek_analysis_quota', {
        p_user_email: userEmail,
        p_max_count: RATE_LIMIT_MAX,
    });

    if (error) {
        throw new Error(`Rate limit peek failed: ${error.message}`);
    }

    const row = (Array.isArray(data) ? data[0] : data) as QuotaRow | undefined;
    if (!row) {
        throw new Error('Rate limit peek returned no data');
    }

    return {
        allowed: row.allowed,
        used: row.used,
        remaining: row.remaining,
        total: row.total,
    };
}
