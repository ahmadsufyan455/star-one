import 'server-only';
import { googlePlaySource } from './google-play';
import type { ReviewSource, SourceId } from './types';

const sources: Record<SourceId, ReviewSource> = {
    'google-play': googlePlaySource,
};

export function getReviewSource(id: SourceId): ReviewSource {
    return sources[id];
}

export {
    AppNotFoundError,
    ReviewsFetchError,
    SOURCE_IDS,
    type FetchAppOptions,
    type FetchReviewsOptions,
    type NormalizedAppInfo,
    type NormalizedReview,
    type ReviewSource,
    type SourceId,
} from './types';
