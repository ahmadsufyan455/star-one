/**
 * Rate limit configuration.
 *
 * Used by both the server-side limiter and the client UI badge so
 * the displayed quota always matches the enforced quota.
 */

/** Maximum analyses a single user may run inside the rolling window. */
export const RATE_LIMIT_MAX = 50;

/** Window duration in milliseconds. */
export const RATE_LIMIT_WINDOW_MS = 24 * 60 * 60 * 1000;
