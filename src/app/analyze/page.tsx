'use client';

import { FeedbackModal } from '@/components/FeedbackModal';
import Footer from '@/components/Footer';
import { DEFAULT_REGION, getLanguageForRegion } from '@/config/regions';
import {
    trackAnalysisCompleted,
    trackAnalysisFailed,
    trackAnalysisStarted,
    trackQuickStartClicked,
    trackRateLimitHit,
    trackUserSignOut,
} from '@/lib/analytics';
import { AnalysisResponseSchema, type AnalysisResponse, type ErrorResponse } from '@/lib/schemas/analysis';
import { safeLoad, safeRemove, safeSave } from '@/lib/storage';
import { MessageSquareWarning } from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { AnalyzeHeader } from './components/AnalyzeHeader';
import { AnalyzeSidebar } from './components/AnalyzeSidebar';
import { AnalyzerForm } from './components/AnalyzerForm';
import { LoadingSkeleton } from './components/LoadingSkeleton';
import { ResultsLayout } from './components/ResultsLayout';

export default function AnalyzePage() {
    const { data: session, status } = useSession();
    const [appId, setAppId] = useState('');
    const [country, setCountry] = useState<string>(DEFAULT_REGION);
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<AnalysisResponse | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);
    const [remainingAnalyses, setRemainingAnalyses] = useState<number | null>(null);

    useEffect(() => {
        if (status === 'unauthenticated') {
            window.location.href = '/login';
        }
    }, [status]);

    useEffect(() => {
        const savedResults = safeLoad('analysisResults', AnalysisResponseSchema);
        if (savedResults) setResults(savedResults);

        const savedAppId = typeof window !== 'undefined' ? window.localStorage.getItem('lastAppId') : null;
        if (savedAppId) setAppId(savedAppId);
    }, []);

    useEffect(() => {
        if (status !== 'authenticated') return;
        let cancelled = false;
        (async () => {
            try {
                const res = await fetch('/api/quota');
                if (!res.ok) return;
                const data = await res.json();
                if (!cancelled && typeof data.remaining === 'number') {
                    setRemainingAnalyses(data.remaining);
                }
            } catch {
                // Quota peek is purely cosmetic — silent failure is fine; the
                // server still enforces the limit when the user submits.
            }
        })();
        return () => { cancelled = true; };
    }, [status]);

    if (status === 'loading') {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#F8F9FB]">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-gray-900"></div>
                    <p className="text-sm text-gray-500">Loading...</p>
                </div>
            </div>
        );
    }

    const handleAnalyze = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!appId.trim()) return;

        setLoading(true);
        setError(null);
        setResults(null);

        trackAnalysisStarted(appId, country);

        try {
            const response = await fetch('/api/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    appId,
                    country,
                    lang: getLanguageForRegion(country),
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                if (response.status === 429 || data.rateLimitExceeded) {
                    trackRateLimitHit(session?.user?.email || 'unknown');
                    setShowFeedbackModal(true);
                    setError(null);
                    return;
                }
                throw new Error((data as ErrorResponse).details || (data as ErrorResponse).error || 'Analysis failed');
            }

            setResults(data as AnalysisResponse);
            safeSave('analysisResults', data);
            if (typeof window !== 'undefined') {
                window.localStorage.setItem('lastAppId', appId);
            }

            trackAnalysisCompleted(
                appId,
                data.appName,
                data.top_complaints?.length || 0,
                data.feature_requests?.length || 0,
                data.app_ideas?.length || 0,
            );

            if (data.rateLimit) {
                setRemainingAnalyses(data.rateLimit.remaining);
            }

            if (data.rateLimit?.limitReached) {
                setTimeout(() => setShowFeedbackModal(true), 1500);
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
            setError(errorMessage);
            trackAnalysisFailed(appId, errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleClearResults = () => {
        setResults(null);
        setAppId('');
        setError(null);
        safeRemove('analysisResults');
        safeRemove('lastAppId');
    };

    const handleLogout = async () => {
        trackUserSignOut();
        safeRemove('analysisResults');
        safeRemove('lastAppId');
        await signOut({ callbackUrl: '/login' });
    };

    const handleQuickStart = (id: string) => {
        trackQuickStartClicked(id);
        setAppId(id);
    };

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
                    <div className="max-w-5xl mx-auto space-y-8">
                        <div>
                            <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 mb-2">
                                Welcome back
                            </h2>
                            <p className="text-gray-500">Find your next validated app idea</p>
                        </div>

                        <AnalyzerForm
                            appId={appId}
                            country={country}
                            loading={loading}
                            remainingAnalyses={remainingAnalyses}
                            onAppIdChange={setAppId}
                            onCountryChange={setCountry}
                            onSubmit={handleAnalyze}
                            onQuickStart={handleQuickStart}
                        />

                        {error && (
                            <div className="bg-red-50 border border-red-100 text-red-600 px-6 py-4 rounded-xl flex items-center gap-3 animate-fade-in">
                                <MessageSquareWarning className="w-5 h-5 flex-shrink-0" />
                                <p>{error}</p>
                            </div>
                        )}

                        {loading && <LoadingSkeleton />}

                        {results && !loading && (
                            <ResultsLayout results={results} onClear={handleClearResults} />
                        )}
                    </div>
                </div>
                <Footer />
            </main>

            <FeedbackModal
                isOpen={showFeedbackModal}
                onClose={() => setShowFeedbackModal(false)}
                userEmail={session?.user?.email || undefined}
            />
        </div>
    );
}
