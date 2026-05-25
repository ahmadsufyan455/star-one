'use client';

import { Card } from '@/components/ui/Card';
import type { AppInfo } from '@/lib/schemas/analysis';
import { formatNumber } from '@/lib/utils/format';
import { TrendingUp } from 'lucide-react';
import { DisruptionScoreCard } from './DisruptionScoreCard';

export function CompetitiveIntelligence({ app }: { app: AppInfo }) {
    return (
        <Card>
            <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                    <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-gray-900">Competitive Intelligence</h3>
                    <p className="text-xs text-gray-500">Key metrics for market opportunity analysis</p>
                </div>
            </div>

            <DisruptionScoreCard lastUpdated={app.lastUpdated} score={app.score} installs={app.installs} />

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Stat dot="bg-blue-400" label="Last Updated" value={app.lastUpdated} />
                <Stat dot="bg-green-400" label="Installs" value={`${formatNumber(app.installs)}+`} />
                <Stat
                    dot="bg-yellow-400"
                    label="Rating"
                    value={
                        app.score > 0 && app.ratings > 0
                            ? `${app.score.toFixed(1)} ★ (${formatNumber(app.ratings)} reviews)`
                            : 'N/A'
                    }
                />
                <Stat
                    dot="bg-purple-400"
                    label="Pricing"
                    value={
                        <>
                            {app.free ? 'Free' : app.price}
                            {app.offersIAP && <span className="text-xs text-gray-500 ml-1">(IAP)</span>}
                        </>
                    }
                />
            </div>
        </Card>
    );
}

function Stat({ dot, label, value }: { dot: string; label: string; value: React.ReactNode }) {
    return (
        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-indigo-100 hover:bg-white transition-all group">
            <div className="text-xs text-gray-400 uppercase tracking-wider font-bold mb-2 flex items-center gap-1">
                <span className={`w-1.5 h-1.5 rounded-full ${dot}`}></span>
                {label}
            </div>
            <div className="text-sm font-bold text-gray-900 group-hover:text-indigo-700 transition-colors">
                {value}
            </div>
        </div>
    );
}
