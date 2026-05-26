'use client';

import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import Footer from '@/components/Footer';
import type { AnalysisSummary } from '@/lib/schemas/analysis';
import { formatRelativeDate } from '@/lib/utils/format';
import { ArrowRight, History as HistoryIcon, Search } from 'lucide-react';
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
                                    Your analyses
                                </h2>
                                <p className="text-gray-500">Every app you've analyzed, newest first</p>
                            </div>
                            <Link
                                href="/analyze"
                                className="hidden sm:inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-800"
                            >
                                <Search className="w-4 h-4" />
                                New analysis
                            </Link>
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

                        {!loading && analyses && analyses.length > 0 && (
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
        </div>
    );
}
