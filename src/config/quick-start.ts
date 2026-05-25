/**
 * Pre-loaded examples shown on the analyze page so first-time users
 * can run an analysis without typing a package ID.
 */

export interface QuickStartApp {
    name: string;
    id: string;
}

export const QUICK_START_APPS: readonly QuickStartApp[] = [
    { name: 'Instagram', id: 'com.instagram.android' },
    { name: 'Notion', id: 'notion.id' },
    { name: 'Duolingo', id: 'com.duolingo' },
] as const;
