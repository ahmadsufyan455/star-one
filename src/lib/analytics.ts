import { track } from '@vercel/analytics';

/**
 * Custom analytics tracking for StarOne
 * Tracks user actions and important events
 */

// Event types
export const AnalyticsEvents = {
    // Analysis events
    ANALYSIS_STARTED: 'analysis_started',
    ANALYSIS_COMPLETED: 'analysis_completed',
    ANALYSIS_FAILED: 'analysis_failed',
    RATE_LIMIT_HIT: 'rate_limit_hit',

    // Feedback events
    FEEDBACK_MODAL_OPENED: 'feedback_modal_opened',
    FEEDBACK_SUBMITTED: 'feedback_submitted',
    FEEDBACK_MODAL_CLOSED: 'feedback_modal_closed',

    // User events
    USER_SIGNED_IN: 'user_signed_in',
    USER_SIGNED_OUT: 'user_signed_out',

    // Navigation events
    QUICK_START_CLICKED: 'quick_start_clicked',
    CLEAR_RESULTS_CLICKED: 'clear_results_clicked',
} as const;

/**
 * Track an analytics event
 * @param event - Event name
 * @param properties - Optional event properties
 */
export function trackEvent(
    event: string,
    properties?: Record<string, string | number | boolean>
) {
    try {
        track(event, properties);

        // Also log to console in development
        if (process.env.NODE_ENV === 'development') {
            console.log('📊 Analytics:', event, properties);
        }
    } catch (error) {
        console.error('Analytics tracking error:', error);
    }
}

/**
 * Track analysis started
 */
export function trackAnalysisStarted(appId: string, country: string) {
    trackEvent(AnalyticsEvents.ANALYSIS_STARTED, {
        app_id: appId,
        country,
    });
}

/**
 * Track analysis completed
 */
export function trackAnalysisCompleted(
    appId: string,
    appName: string,
    complaintsCount: number,
    featuresCount: number,
    ideasCount: number
) {
    trackEvent(AnalyticsEvents.ANALYSIS_COMPLETED, {
        app_id: appId,
        app_name: appName,
        complaints_count: complaintsCount,
        features_count: featuresCount,
        ideas_count: ideasCount,
    });
}

/**
 * Track analysis failed
 */
export function trackAnalysisFailed(appId: string, errorType: string) {
    trackEvent(AnalyticsEvents.ANALYSIS_FAILED, {
        app_id: appId,
        error_type: errorType,
    });
}

/**
 * Track rate limit hit
 */
export function trackRateLimitHit(userEmail: string) {
    trackEvent(AnalyticsEvents.RATE_LIMIT_HIT, {
        user_email: userEmail,
    });
}

/**
 * Track feedback modal opened
 */
export function trackFeedbackModalOpened(trigger: 'rate_limit' | 'manual') {
    trackEvent(AnalyticsEvents.FEEDBACK_MODAL_OPENED, {
        trigger,
    });
}

/**
 * Track feedback submitted
 */
export function trackFeedbackSubmitted(rating: number, hasText: boolean) {
    trackEvent(AnalyticsEvents.FEEDBACK_SUBMITTED, {
        rating,
        has_text: hasText,
    });
}

/**
 * Track user sign in
 */
export function trackUserSignIn(provider: string) {
    trackEvent(AnalyticsEvents.USER_SIGNED_IN, {
        provider,
    });
}

/**
 * Track user sign out
 */
export function trackUserSignOut() {
    trackEvent(AnalyticsEvents.USER_SIGNED_OUT);
}

/**
 * Track quick start clicked
 */
export function trackQuickStartClicked(appId: string) {
    trackEvent(AnalyticsEvents.QUICK_START_CLICKED, {
        app_id: appId,
    });
}
