/**
 * Pre-loaded examples shown on the analyze page so first-time users
 * can run an analysis without typing a package ID.
 */

import type { SourceId } from '@/lib/sources/types';

export interface QuickStartApp {
    name: string;
    id: string;
}

export const QUICK_START_APPS: Record<SourceId, readonly QuickStartApp[]> = {
    'google-play': [
        { name: 'Instagram', id: 'com.instagram.android' },
        { name: 'Notion', id: 'notion.id' },
        { name: 'Duolingo', id: 'com.duolingo' },
    ],
    'app-store': [
        { name: 'Instagram', id: '389801252' },
        { name: 'Notion', id: '1232780281' },
        { name: 'Duolingo', id: '570060128' },
    ],
} as const;
