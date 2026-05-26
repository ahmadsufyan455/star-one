/**
 * Review-source configuration shared by UI and validation.
 *
 * Single source of truth so adding a future source (Product Hunt, G2, ...)
 * is a one-file change. The server-side `getReviewSource()` registry in
 * `src/lib/sources/index.ts` and this UI catalogue are intentionally kept
 * separate — server-only code is gated by `server-only` and can't be
 * imported from client components.
 */

import type { SourceId } from '@/lib/sources/types';

export interface SourceUiMeta {
    id: SourceId;
    name: string;
    placeholder: string;
}

export const SOURCE_UI: readonly SourceUiMeta[] = [
    {
        id: 'google-play',
        name: 'Google Play',
        placeholder: 'com.instagram.android',
    },
    {
        id: 'app-store',
        name: 'App Store',
        placeholder: '389801252 or com.burbn.instagram',
    },
] as const;

export const DEFAULT_SOURCE: SourceId = 'google-play';

export function uiMetaForSource(id: SourceId): SourceUiMeta {
    return SOURCE_UI.find((s) => s.id === id) ?? SOURCE_UI[0];
}
