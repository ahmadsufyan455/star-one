export const SOURCE_IDS = ['google-play'] as const;
export type SourceId = (typeof SOURCE_IDS)[number];

export interface NormalizedAppInfo {
    title: string;
    icon: string;
    genre: string | null;
    summary: string | null;
    description: string | null;
    updated: string;
    installs: string;
    score: number;
    ratings: number;
    price: string;
    free: boolean;
    offersIAP: boolean;
}

export interface NormalizedReview {
    userName: string;
    userImage: string | undefined;
    score: number;
    date: string;
    text: string;
}

export interface FetchAppOptions {
    appId: string;
    country: string;
    lang: string;
}

export interface FetchReviewsOptions extends FetchAppOptions {
    limit: number;
}

export interface ReviewSource {
    readonly id: SourceId;
    readonly displayName: string;
    fetchAppInfo(options: FetchAppOptions): Promise<NormalizedAppInfo>;
    fetchReviews(options: FetchReviewsOptions): Promise<NormalizedReview[]>;
}

export class AppNotFoundError extends Error {
    constructor(public readonly appId: string) {
        super(`App not found: ${appId}`);
        this.name = 'AppNotFoundError';
    }
}

export class ReviewsFetchError extends Error {
    constructor(public readonly cause?: unknown) {
        super('Failed to fetch reviews');
        this.name = 'ReviewsFetchError';
    }
}
