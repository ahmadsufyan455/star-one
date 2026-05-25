import type { z } from 'zod';

export function safeLoad<T extends z.ZodTypeAny>(
    key: string,
    schema: T,
): z.infer<T> | null {
    if (typeof window === 'undefined') return null;

    const raw = window.localStorage.getItem(key);
    if (!raw) return null;

    try {
        const parsed = JSON.parse(raw);
        const result = schema.safeParse(parsed);
        if (!result.success) {
            window.localStorage.removeItem(key);
            return null;
        }
        return result.data;
    } catch {
        window.localStorage.removeItem(key);
        return null;
    }
}

export function safeSave<T>(key: string, value: T): void {
    if (typeof window === 'undefined') return;
    try {
        window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
        // storage full or disabled; failing silently here is fine because
        // persisted results are a convenience, not a correctness requirement
    }
}

export function safeRemove(key: string): void {
    if (typeof window === 'undefined') return;
    window.localStorage.removeItem(key);
}
