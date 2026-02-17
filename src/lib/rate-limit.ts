/**
 * Simple in-memory rate limiter for MVP
 * Tracks analysis count per user
 */

interface UserAnalysisCount {
    count: number;
    lastReset: number;
}

// In-memory storage (will reset on server restart)
const userAnalysisCounts = new Map<string, UserAnalysisCount>();

const RATE_LIMIT = 2; // Maximum analyses per user
const RESET_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

/**
 * Check if user has exceeded rate limit
 * @param userId - User's email or unique identifier
 * @returns Object with canAnalyze flag and remaining count
 */
export function checkRateLimit(userId: string): {
    canAnalyze: boolean;
    remaining: number;
    total: number;
} {
    const now = Date.now();
    const userRecord = userAnalysisCounts.get(userId);

    // First time user or reset needed
    if (!userRecord || now - userRecord.lastReset > RESET_INTERVAL) {
        userAnalysisCounts.set(userId, {
            count: 0,
            lastReset: now,
        });
        return {
            canAnalyze: true,
            remaining: RATE_LIMIT,
            total: RATE_LIMIT,
        };
    }

    // Check if limit exceeded
    const remaining = RATE_LIMIT - userRecord.count;
    return {
        canAnalyze: remaining > 0,
        remaining: Math.max(0, remaining),
        total: RATE_LIMIT,
    };
}

/**
 * Increment user's analysis count
 * @param userId - User's email or unique identifier
 */
export function incrementAnalysisCount(userId: string): void {
    const now = Date.now();
    const userRecord = userAnalysisCounts.get(userId);

    if (!userRecord || now - userRecord.lastReset > RESET_INTERVAL) {
        userAnalysisCounts.set(userId, {
            count: 1,
            lastReset: now,
        });
    } else {
        userRecord.count += 1;
        userAnalysisCounts.set(userId, userRecord);
    }
}

/**
 * Get user's current analysis count
 * @param userId - User's email or unique identifier
 */
export function getAnalysisCount(userId: string): number {
    const now = Date.now();
    const userRecord = userAnalysisCounts.get(userId);

    if (!userRecord || now - userRecord.lastReset > RESET_INTERVAL) {
        return 0;
    }

    return userRecord.count;
}

/**
 * Reset user's analysis count (admin function)
 * @param userId - User's email or unique identifier
 */
export function resetUserLimit(userId: string): void {
    userAnalysisCounts.delete(userId);
}
