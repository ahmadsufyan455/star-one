/**
 * Configuration for the persistent analysis store.
 */

/**
 * How long a Gemini result stays valid for the cache layer.
 *
 * 24 hours matches the rate-limit window — within a single day, repeat
 * lookups for the same (appId, country, source) reuse the AI payload so
 * users don't burn quota on identical re-runs and we don't burn Gemini cost.
 */
export const CACHE_WINDOW_MS = 24 * 60 * 60 * 1000;
