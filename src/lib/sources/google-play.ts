import 'server-only';
import gplay from 'google-play-scraper';
import {
    AppNotFoundError,
    ReviewsFetchError,
    type FetchAppOptions,
    type FetchReviewsOptions,
    type NormalizedAppInfo,
    type NormalizedReview,
    type ReviewSource,
} from './types';

export const googlePlaySource: ReviewSource = {
    id: 'google-play',
    displayName: 'Google Play',

    async fetchAppInfo({ appId, country, lang }: FetchAppOptions): Promise<NormalizedAppInfo> {
        let raw: Awaited<ReturnType<typeof gplay.app>>;
        try {
            raw = await gplay.app({ appId, country, lang });
        } catch {
            throw new AppNotFoundError(appId);
        }

        return {
            title: raw.title,
            icon: raw.icon,
            genre: raw.genre || null,
            summary: raw.summary || null,
            description: raw.description || null,
            updated: String(raw.updated || 'Unknown'),
            installs: String(raw.installs || 'Unknown'),
            score: raw.score || 0,
            ratings: raw.ratings || 0,
            price: String(raw.price || 'Free'),
            free: raw.free ?? true,
            offersIAP: raw.offersIAP ?? false,
        };
    },

    async fetchReviews({ appId, country, lang, limit }: FetchReviewsOptions): Promise<NormalizedReview[]> {
        let raw: Awaited<ReturnType<typeof gplay.reviews>>;
        try {
            raw = await gplay.reviews({
                appId,
                sort: 1,
                num: limit,
                country,
                lang,
            });
        } catch (cause) {
            throw new ReviewsFetchError(cause);
        }

        return raw.data.map((review) => ({
            userName: review.userName || 'Anonymous',
            userImage: review.userImage,
            score: review.score,
            date: String(review.date || 'Unknown'),
            text: review.text || '',
        }));
    },
};
