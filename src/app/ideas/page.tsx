'use client';

import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import Footer from '@/components/Footer';
import { SAVED_IDEA_STATUSES, type SavedIdea, type SavedIdeaStatus } from '@/lib/schemas/saved-idea';
import { Bookmark, Search } from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { AnalyzeHeader } from '../analyze/components/AnalyzeHeader';
import { AnalyzeSidebar } from '../analyze/components/AnalyzeSidebar';
import { SavedIdeaCard } from './components/SavedIdeaCard';
import { SavedIdeaDrawer } from './components/SavedIdeaDrawer';
import { StatusBadge } from './components/StatusBadge';

type StatusFilter = 'all' | SavedIdeaStatus;

const FILTERS: { value: StatusFilter; label: string }[] = [
    { value: 'all', label: 'All' },
    ...SAVED_IDEA_STATUSES.map((s) => ({ value: s, label: s.charAt(0).toUpperCase() + s.slice(1) })),
];

export default function IdeasPage() {
    const { data: session, status } = useSession();
    const [ideas, setIdeas] = useState<SavedIdea[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState<StatusFilter>('all');
    const [openIdea, setOpenIdea] = useState<SavedIdea | null>(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        if (status === 'unauthenticated') {
            window.location.href = '/login';
        }
    }, [status]);

    useEffect(() => {
        if (status !== 'authenticated') return;
        let cancelled = false;
        (async () => {
            setLoading(true);
            try {
                const res = await fetch('/api/ideas');
                if (!res.ok) throw new Error('Failed to load saved ideas');
                const data = await res.json();
                if (!cancelled) setIdeas(data.ideas ?? []);
            } catch (err) {
                if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load saved ideas');
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, [status]);

    const visibleIdeas = useMemo(() => {
        if (!ideas) return [];
        if (filter === 'all') return ideas;
        return ideas.filter((i) => i.status === filter);
    }, [ideas, filter]);

    const counts = useMemo(() => {
        const map: Record<StatusFilter, number> = {
            all: ideas?.length ?? 0,
            idea: 0,
            building: 0,
            shipped: 0,
            skipped: 0,
        };
        for (const i of ideas ?? []) map[i.status]++;
        return map;
    }, [ideas]);

    const handleSavePatch = async (patch: { notes?: string; status?: SavedIdeaStatus }) => {
        if (!openIdea) return;
        const res = await fetch(`/api/ideas/${openIdea.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(patch),
        });
        if (!res.ok) return;
        const data = await res.json();
        const updated: SavedIdea = data.idea;
        setIdeas((prev) => prev?.map((i) => (i.id === updated.id ? updated : i)) ?? null);
    };

    const handleDelete = async () => {
        if (!openIdea) return;
        const res = await fetch(`/api/ideas/${openIdea.id}`, { method: 'DELETE' });
        if (!res.ok) return;
        setIdeas((prev) => prev?.filter((i) => i.id !== openIdea.id) ?? null);
    };

    const handleLogout = async () => {
        await signOut({ callbackUrl: '/login' });
    };

    if (status === 'loading') {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#F8F9FB]">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-gray-900" />
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-[#F8F9FB] font-sans text-gray-900 overflow-x-hidden">
            <AnalyzeSidebar
                isOpen={mobileMenuOpen}
                onClose={() => setMobileMenuOpen(false)}
                onLogout={handleLogout}
            />
            <main className="flex-1 lg:ml-64 flex flex-col min-h-screen max-w-full overflow-x-hidden">
                <AnalyzeHeader session={session} onMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)} />

                <div className="p-4 lg:p-8 flex-1">
                    <div className="max-w-5xl mx-auto space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 mb-2">
                                    Saved ideas
                                </h2>
                                <p className="text-gray-500">Bookmark, annotate, and track ideas worth pursuing</p>
                            </div>
                            <Link
                                href="/analyze"
                                className="hidden sm:inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-800"
                            >
                                <Search className="w-4 h-4" />
                                New analysis
                            </Link>
                        </div>

                        {!loading && ideas && ideas.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {FILTERS.map((f) => (
                                    <button
                                        key={f.value}
                                        type="button"
                                        onClick={() => setFilter(f.value)}
                                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                                            filter === f.value
                                                ? 'bg-gray-900 text-white'
                                                : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
                                        }`}
                                    >
                                        {f.label}
                                        <span
                                            className={`text-xs px-1.5 py-0.5 rounded ${
                                                filter === f.value
                                                    ? 'bg-white/20'
                                                    : 'bg-gray-100 text-gray-500'
                                            }`}
                                        >
                                            {counts[f.value]}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        )}

                        {loading && (
                            <div className="grid sm:grid-cols-2 gap-3">
                                {[0, 1, 2, 3].map((i) => (
                                    <Skeleton key={i} className="h-32 w-full rounded-2xl" />
                                ))}
                            </div>
                        )}

                        {error && (
                            <Card>
                                <p className="text-red-600 text-sm">{error}</p>
                            </Card>
                        )}

                        {!loading && ideas && ideas.length === 0 && (
                            <Card padding="lg" className="text-center">
                                <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                                    <Bookmark className="w-6 h-6 text-gray-500" />
                                </div>
                                <h3 className="font-semibold text-gray-900 mb-1">Nothing saved yet</h3>
                                <p className="text-sm text-gray-500 mb-6">
                                    Bookmark an idea from any analysis result and it lands here for safekeeping.
                                </p>
                                <Link
                                    href="/analyze"
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-800"
                                >
                                    <Search className="w-4 h-4" />
                                    Start an analysis
                                </Link>
                            </Card>
                        )}

                        {!loading && ideas && ideas.length > 0 && visibleIdeas.length === 0 && (
                            <Card padding="lg" className="text-center">
                                <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center mx-auto mb-3">
                                    <StatusBadge status={filter as SavedIdeaStatus} />
                                </div>
                                <p className="text-sm text-gray-500">No ideas with this status yet.</p>
                            </Card>
                        )}

                        {!loading && visibleIdeas.length > 0 && (
                            <div className="grid sm:grid-cols-2 gap-3">
                                {visibleIdeas.map((idea) => (
                                    <SavedIdeaCard
                                        key={idea.id}
                                        idea={idea}
                                        onOpen={() => setOpenIdea(idea)}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
                <Footer />
            </main>

            <SavedIdeaDrawer
                idea={openIdea}
                onClose={() => setOpenIdea(null)}
                onSave={handleSavePatch}
                onDelete={handleDelete}
            />
        </div>
    );
}