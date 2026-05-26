import 'server-only';
import store from 'app-store-scraper';
import {
    AppNotFoundError,
    ReviewsFetchError,
    type FetchAppOptions,
    type FetchReviewsOptions,
    type NormalizedAppInfo,
    type NormalizedReview,
    type ReviewSource,
} from './types';

interface RawAppStoreApp {
    title: string;
    icon: string;
    primaryGenre?: string;
    description?: string;
    updated?: string;
    score?: number;
    reviews?: number;
    price?: number;
    currency?: string;
    free?: boolean;
}

interface RawAppStoreReview {
    userName?: string;
    score: number;
    updated?: string;
    text?: string;
}

const REVIEWS_PER_PAGE = 50;
const MAX_PAGE = 10;

const APP_STORE_NUMERIC_ID = /^\d+$/;

function resolveLookup(appId: string): { id?: number } | { appId: string } {
    return APP_STORE_NUMERIC_ID.test(appId) ? { id: Number(appId) } : { appId };
}

export const appStoreSource: ReviewSource = {
    id: 'app-store',
    displayName: 'App Store',

    async fetchAppInfo({ appId, country, lang }: FetchAppOptions): Promise<NormalizedAppInfo> {
        let raw: RawAppStoreApp;
        try {
            raw = (await store.app({ ...resolveLookup(appId), country, lang })) as RawAppStoreApp;
        } catch {
            throw new AppNotFoundError(appId);
        }

        const price = raw.price ?? 0;
        const currency = raw.currency ?? 'USD';
        const free = raw.free ?? price === 0;
        const priceLabel = free ? 'Free' : `${price} ${currency}`;

        return {
            title: raw.title,
            icon: raw.icon,
            genre: raw.primaryGenre || null,
            // App Store doesn't expose a short summary distinct from description.
            // We surface the same description in both slots so prompt construction
            // in the analyze route stays identical to Google Play.
            summary: raw.description || null,
            description: raw.description || null,
            updated: String(raw.updated || 'Unknown'),
            // App Store API does not publish install counts. The disruption-score
            // formula treats unparseable installs as zero, which is the correct
            // behavior here — we just can't add an install-tier signal.
            installs: 'Unknown',
            score: raw.score || 0,
            ratings: raw.reviews || 0,
            price: priceLabel,
            free,
            // Apple does not expose IAP availability via the lookup API.
            offersIAP: false,
        };
    },

    async fetchReviews({ appId, country, limit }: FetchReviewsOptions): Promise<NormalizedReview[]> {
        const pagesNeeded = Math.min(Math.ceil(limit / REVIEWS_PER_PAGE), MAX_PAGE);
        const collected: NormalizedReview[] = [];

        try {
            for (let page = 1; page <= pagesNeeded; page++) {
                const raw = (await store.reviews({
                    ...resolveLookup(appId),
                    country,
                    page,
                    sort: store.sort.RECENT,
                })) as RawAppStoreReview[];

                if (!raw || raw.length === 0) break;

                for (const review of raw) {
                    collected.push({
                        userName: review.userName || 'Anonymous',
                        // App Store reviews don't include avatar URLs.
                        userImage: undefined,
                        score: review.score,
                        date: String(review.updated || 'Unknown'),
                        text: review.text || '',
                    });
                    if (collected.length >= limit) break;
                }
                if (collected.length >= limit) break;
            }
        } catch (cause) {
            throw new ReviewsFetchError(cause);
        }

        return collected;
    },
};
