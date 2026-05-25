/**
 * Supported analysis regions.
 *
 * Single source of truth — used by:
 *   - The region selector UI (analyze page)
 *   - Server-side request validation (analysis schema)
 *   - Future review-source implementations (Phase 4)
 */

export const REGION_CODES = ['us', 'id', 'in', 'gb', 'sg'] as const;
export type RegionCode = (typeof REGION_CODES)[number];

export interface Region {
    code: RegionCode;
    flag: string;
    name: string;
    language: string;
}

export const REGIONS: readonly Region[] = [
    { code: 'us', flag: '🇺🇸', name: 'US', language: 'en' },
    { code: 'id', flag: '🇮🇩', name: 'ID', language: 'id' },
    { code: 'in', flag: '🇮🇳', name: 'IN', language: 'en' },
    { code: 'gb', flag: '🇬🇧', name: 'GB', language: 'en' },
    { code: 'sg', flag: '🇸🇬', name: 'SG', language: 'en' },
] as const;

export const DEFAULT_REGION: RegionCode = 'us';
export const DEFAULT_LANGUAGE = 'en';

export function getLanguageForRegion(code: string): string {
    return REGIONS.find((r) => r.code === code)?.language ?? DEFAULT_LANGUAGE;
}
