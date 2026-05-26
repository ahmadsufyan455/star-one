'use client';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { Skeleton } from '@/components/ui/Skeleton';
import Footer from '@/components/Footer';
import type { AnalysisSummary } from '@/lib/schemas/analysis';
import { formatRelativeDate } from '@/lib/utils/format';
import { AlertTriangle, ArrowRight, History as HistoryIcon, Search, Trash2 } from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { AnalyzeHeader } from '../analyze/components/AnalyzeHeader';
import { AnalyzeSidebar } from '../analyze/components/AnalyzeSidebar';

export default function HistoryPage() {
    const { data: session, status } = useSession();
    const [analyses, setAnalyses] = useState<AnalysisSummary[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [clearing, setClearing] = useState(false);
    const [clearError, setClearError] = useState<string | null>(null);

    useEffect(() => {
        if (status === 'unauthenticated') {
            window.location.href = '/login';
        }
    }, [status]);

    useEffect(() => {
        if (status !== 'authenticated') return;
        let cancelled = false;
        (async () => {
            try {
                const res = await fetch('/api/analyses');
                if (!res.ok) throw new Error('Failed to load history');
                const data = await res.json();
                if (!cancelled) setAnalyses(data.analyses ?? []);
            } catch (err) {
                if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load history');
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, [status]);

    const handleLogout = async () => {
        await signOut({ callbackUrl: '/login' });
    };

    const handleClearHistory = async () => {
        setClearing(true);
        setClearError(null);
        try {
            const res = await fetch('/api/analyses', { method: 'DELETE' });
            if (!res.ok) {
                const body = await res.json().catch(() => null);
                throw new Error(body?.error ?? 'Failed to clear history');
            }
            setAnalyses([]);
            setConfirmOpen(false);
        } catch (err) {
            setClearError(err instanceof Error ? err.message : 'Failed to clear history');
        } finally {
            setClearing(false);
        }
    };

    if (status === 'loading') {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#F8F9FB]">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-gray-900" />
            </div>
        );
    }

    const hasAnalyses = !loading && analyses && analyses.length > 0;

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
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 mb-2">
                                    Your analyses
                                </h2>
                                <p className="text-gray-500">Every app you've analyzed, newest first</p>
                            </div>
                            <div className="flex items-center gap-2">
                                {hasAnalyses && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setClearError(null);
                                            setConfirmOpen(true);
                                        }}
                                        className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        <span className="hidden sm:inline">Clear history</span>
                                    </button>
                                )}
                                <Link
                                    href="/analyze"
                                    className="hidden sm:inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-800"
                                >
                                    <Search className="w-4 h-4" />
                                    New analysis
                                </Link>
                            </div>
                        </div>

                        {loading && (
                            <div className="space-y-3">
                                {[0, 1, 2, 3].map((i) => (
                                    <Skeleton key={i} className="h-20 w-full rounded-2xl" />
                                ))}
                            </div>
                        )}

                        {error && (
                            <Card>
                                <p className="text-red-600 text-sm">{error}</p>
                            </Card>
                        )}

                        {!loading && analyses && analyses.length === 0 && (
                            <Card padding="lg" className="text-center">
                                <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                                    <HistoryIcon className="w-6 h-6 text-gray-500" />
                                </div>
                                <h3 className="font-semibold text-gray-900 mb-1">No analyses yet</h3>
                                <p className="text-sm text-gray-500 mb-6">
                                    Run your first analysis to see it here.
                                </p>
                                <Link
                                    href="/analyze"
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-800"
                                >
                                    <Search className="w-4 h-4" />
                                    Analyze an app
                                </Link>
                            </Card>
                        )}

                        {hasAnalyses && (
                            <div className="space-y-3">
                                {analyses.map((row) => (
                                    <Link
                                        key={row.id}
                                        href={`/r/${row.id}`}
                                        className="block group"
                                    >
                                        <Card className="hover:border-gray-300 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-gray-100 flex-shrink-0">
                                                    <Image
                                                        src={row.appIcon}
                                                        alt={row.appName}
                                                        fill
                                                        sizes="48px"
                                                        className="object-cover"
                                                    />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h3 className="font-semibold text-gray-900 truncate">{row.appName}</h3>
                                                        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs font-medium uppercase">
                                                            {row.country}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-gray-500 truncate">
                                                        {row.appId} · {formatRelativeDate(row.createdAt)}
                                                    </p>
                                                </div>
                                                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-gray-900 group-hover:translate-x-1 transition-all" />
                                            </div>
                                        </Card>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
                <Footer />
            </main>

            <Modal
                isOpen={confirmOpen}
                onClose={() => {
                    if (clearing) return;
                    setConfirmOpen(false);
                }}
                closeOnBackdropClick={!clearing}
            >
                <div className="space-y-5">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
                            <AlertTriangle className="w-6 h-6 text-red-600" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-1">Clear history?</h3>
                            <p className="text-sm text-gray-600">
                                This permanently deletes all {analyses?.length ?? 0} of your saved analyses. This action cannot be undone.
                            </p>
                        </div>
                    </div>

                    {clearError && (
                        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                            {clearError}
                        </p>
                    )}

                    <div className="flex items-center justify-end gap-2">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => setConfirmOpen(false)}
                            disabled={clearing}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            onClick={handleClearHistory}
                            loading={clearing}
                            disabled={clearing}
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            {clearing ? 'Clearing…' : 'Clear history'}
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
