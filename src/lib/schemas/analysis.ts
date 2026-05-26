import { z } from 'zod';

import {
    DEFAULT_LANGUAGE,
    DEFAULT_REGION,
    REGION_CODES,
} from '@/config/regions';
import { SOURCE_IDS } from '@/lib/sources/types';

// Google Play package ID: lowercase letters/digits/underscores, dot-separated,
// must contain at least one dot. Examples: com.instagram.android, notion.id
export const APP_ID_REGEX = /^[a-z][a-z0-9_]*(\.[a-z0-9_]+)+$/;

// App Store accepts either an iTunes track id (purely numeric, e.g. 389801252)
// or a bundle id (com.burbn.instagram). The numeric form is the canonical id
// the Apple lookup API uses, but bundle ids work too — both are valid here.
export const APP_STORE_NUMERIC_ID_REGEX = /^\d+$/;

export const AnalysisRequestSchema = z
    .object({
        appId: z
            .string()
            .min(1, 'appId is required')
            .max(255, 'appId is too long'),
        country: z.enum(REGION_CODES).default(DEFAULT_REGION),
        lang: z.string().min(2).max(5).default(DEFAULT_LANGUAGE),
        source: z.enum(SOURCE_IDS).default('google-play'),
    })
    .superRefine((data, ctx) => {
        const isNumeric = APP_STORE_NUMERIC_ID_REGEX.test(data.appId);
        const isBundle = APP_ID_REGEX.test(data.appId);

        if (data.source === 'app-store') {
            if (!isNumeric && !isBundle) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ['appId'],
                    message: 'Invalid App Store id. Use numeric track id (e.g. 389801252) or bundle id (e.g. com.burbn.instagram)',
                });
            }
            return;
        }

        if (!isBundle) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['appId'],
                message: 'Invalid app ID format. Expected format: com.example.app',
            });
        }
    });

export const AppIdeaSchema = z.object({
    name: z.string(),
    pain_point: z.string(),
    differentiation: z.string(),
    value_proposition: z.string(),
});

export const ReviewSchema = z.object({
    userName: z.string(),
    userImage: z.string().optional(),
    score: z.number(),
    date: z.string(),
    text: z.string(),
});

export const AIAnalysisResultSchema = z.object({
    top_complaints: z.array(z.string()),
    feature_requests: z.array(z.string()),
    sentiment_summary: z.string(),
    app_ideas: z.array(z.union([z.string(), AppIdeaSchema])),
    badReviews: z.array(ReviewSchema),
});

export const AppInfoSchema = z.object({
    appName: z.string(),
    appIcon: z.string(),
    lastUpdated: z.string(),
    installs: z.string(),
    score: z.number(),
    ratings: z.number(),
    price: z.string(),
    free: z.boolean(),
    offersIAP: z.boolean(),
});

export const RateLimitInfoSchema = z.object({
    remaining: z.number(),
    total: z.number(),
    limitReached: z.boolean(),
});

export const AnalysisResponseSchema = z.object({
    ...AppInfoSchema.shape,
    ...AIAnalysisResultSchema.shape,
    id: z.string().uuid().optional(),
    cached: z.boolean().optional(),
    createdAt: z.string().optional(),
    rateLimit: RateLimitInfoSchema.optional(),
});

export const AnalysisSummarySchema = z.object({
    id: z.string().uuid(),
    appId: z.string(),
    appName: z.string(),
    appIcon: z.string(),
    country: z.string(),
    source: z.string(),
    score: z.number(),
    createdAt: z.string(),
});

export const ErrorResponseSchema = z.object({
    error: z.string(),
    details: z.string().optional(),
    rateLimitExceeded: z.boolean().optional(),
    remaining: z.number().optional(),
    total: z.number().optional(),
});

export type AnalysisRequest = z.infer<typeof AnalysisRequestSchema>;
export type AppIdea = z.infer<typeof AppIdeaSchema>;
export type Review = z.infer<typeof ReviewSchema>;
export type AIAnalysisResult = z.infer<typeof AIAnalysisResultSchema>;
export type AppInfo = z.infer<typeof AppInfoSchema>;
export type RateLimitInfo = z.infer<typeof RateLimitInfoSchema>;
export type AnalysisResponse = z.infer<typeof AnalysisResponseSchema>;
export type AnalysisSummary = z.infer<typeof AnalysisSummarySchema>;
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;
