'use client';

import type { SavedIdeaStatus } from '@/lib/schemas/saved-idea';

interface StatusBadgeProps {
    status: SavedIdeaStatus;
    interactive?: boolean;
    dim?: boolean;
}

const STYLES: Record<SavedIdeaStatus, { label: string; light: string; dark: string }> = {
    idea: {
        label: 'Idea',
        light: 'bg-gray-100 text-gray-700',
        dark: 'bg-gray-200 text-gray-800',
    },
    building: {
        label: 'Building',
        light: 'bg-blue-50 text-blue-700',
        dark: 'bg-blue-100 text-blue-800',
    },
    shipped: {
        label: 'Shipped',
        light: 'bg-green-50 text-green-700',
        dark: 'bg-green-100 text-green-800',
    },
    skipped: {
        label: 'Skipped',
        light: 'bg-amber-50 text-amber-700',
        dark: 'bg-amber-100 text-amber-800',
    },
};

export function StatusBadge({ status, interactive = false, dim = false }: StatusBadgeProps) {
    const style = STYLES[status];
    if (interactive) {
        const cls = dim ? style.light : style.dark;
        return <span className={`px-2 py-0.5 rounded text-xs font-medium ${cls}`}>{style.label}</span>;
    }
    return (
        <span className={`px-2 py-0.5 rounded text-xs font-medium ${style.light}`}>
            {style.label}
        </span>
    );
}