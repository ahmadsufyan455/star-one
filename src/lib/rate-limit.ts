import { createServerSupabaseClient } from '@/lib/supabase/server';
import { RATE_LIMIT_MAX } from '@/config/rate-limit';

export interface RateLimitResult {
    allowed: boolean;
    used: number;
    remaining: number;
    total: number;
}

interface ConsumeQuotaRow {
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

    const row = (Array.isArray(data) ? data[0] : data) as ConsumeQuotaRow | undefined;
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
