'use client';

import type { AnalysisResponse } from '@/lib/schemas/analysis';
import { AppIdeasGrid } from './AppIdeasGrid';
import { BadReviewsList } from './BadReviewsList';
import { CompetitiveIntelligence } from './CompetitiveIntelligence';
import { InsightList } from './InsightList';
import { ResultsHeader } from './ResultsHeader';
import { SentimentSummary } from './SentimentSummary';

interface ResultsLayoutProps {
    results: AnalysisResponse;
    onClear?: () => void;
}

export function ResultsLayout({ results, onClear }: ResultsLayoutProps) {
    return (
        <div className="space-y-6 animate-fade-in pb-12">
            <ResultsHeader
                appName={results.appName}
                appIcon={results.appIcon}
                onClear={onClear}
                shareId={results.id}
            />
            <CompetitiveIntelligence app={results} />

            <div className="grid lg:grid-cols-2 gap-6">
                <InsightList title="Top Complaints" icon="complaints" items={results.top_complaints} />
                <InsightList title="Feature Requests" icon="features" items={results.feature_requests} />
            </div>

            <SentimentSummary summary={results.sentiment_summary} />
            <BadReviewsList reviews={results.badReviews || []} />
            <AppIdeasGrid ideas={results.app_ideas} />
        </div>
    );
}
