'use client';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { QUICK_START_APPS } from '@/config/quick-start';
import { REGIONS } from '@/config/regions';
import { SOURCE_UI, uiMetaForSource } from '@/config/sources';
import type { SourceId } from '@/lib/sources/types';
import { ArrowUpRight, Search } from 'lucide-react';

interface AnalyzerFormProps {
    appId: string;
    country: string;
    source: SourceId;
    loading: boolean;
    remainingAnalyses: number | null;
    onAppIdChange: (value: string) => void;
    onCountryChange: (code: string) => void;
    onSourceChange: (source: SourceId) => void;
    onSubmit: (e: React.FormEvent) => void;
    onQuickStart: (id: string) => void;
}

export function AnalyzerForm({
    appId,
    country,
    source,
    loading,
    remainingAnalyses,
    onAppIdChange,
    onCountryChange,
    onSourceChange,
    onSubmit,
    onQuickStart,
}: AnalyzerFormProps) {
    const meta = uiMetaForSource(source);
    const quickStarts = QUICK_START_APPS[source];

    return (
        <Card padding="lg" className="relative overflow-hidden group">
            <div className="relative z-10 w-full">
                <div className="flex justify-between items-start mb-6">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                            <h3 className="text-xl font-bold text-gray-900">Market Gap Detector</h3>
                            {remainingAnalyses !== null && (
                                <span
                                    className={`px-3 py-1 rounded-full text-xs font-medium ${remainingAnalyses === 0
                                        ? 'bg-red-100 text-red-700'
                                        : 'bg-blue-100 text-blue-700'
                                        }`}
                                >
                                    {remainingAnalyses}/2 daily analyses left
                                </span>
                            )}
                        </div>
                        <p className="text-gray-500 text-sm">
                            Identify user pain points and feature gaps instantly
                        </p>
                    </div>
                    <ArrowUpRight className="w-5 h-5 text-gray-400" />
                </div>

                <form onSubmit={onSubmit} className="w-full">
                    <div className="mb-4">
                        <div className="text-xs text-gray-500 font-medium mb-2 block">Source</div>
                        <div className="flex gap-2 p-1.5 bg-gray-100 rounded-xl">
                            {SOURCE_UI.map((src) => (
                                <button
                                    key={src.id}
                                    type="button"
                                    onClick={() => onSourceChange(src.id)}
                                    disabled={loading}
                                    className={`flex-1 px-4 py-2.5 rounded-lg font-medium text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed ${source === src.id
                                        ? 'bg-white text-gray-900 shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                        }`}
                                >
                                    {src.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="mb-4">
                        <Input
                            label="App Package ID"
                            id="appId"
                            name="appId"
                            value={appId}
                            onChange={(e) => onAppIdChange(e.target.value)}
                            placeholder={meta.placeholder}
                            disabled={loading}
                            autoComplete="off"
                        />
                    </div>

                    <div className="mb-4">
                        <div className="text-xs text-gray-500 font-medium mb-2 block">Region</div>
                        <div className="hidden lg:flex gap-2 p-1.5 bg-gray-100 rounded-xl">
                            {REGIONS.map((region) => (
                                <button
                                    key={region.code}
                                    type="button"
                                    onClick={() => onCountryChange(region.code)}
                                    disabled={loading}
                                    className={`flex-1 px-4 py-2.5 rounded-lg font-medium text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed ${country === region.code
                                        ? 'bg-white text-gray-900 shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                        }`}
                                >
                                    <span className="mr-1.5">{region.flag}</span>
                                    {region.name}
                                </button>
                            ))}
                        </div>
                        <div className="grid grid-cols-3 gap-2 lg:hidden">
                            {REGIONS.map((region) => (
                                <button
                                    key={region.code}
                                    type="button"
                                    onClick={() => onCountryChange(region.code)}
                                    disabled={loading}
                                    className={`px-3 py-2.5 rounded-xl font-medium text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed border ${country === region.code
                                        ? 'bg-gray-900 text-white border-gray-900'
                                        : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-100'
                                        }`}
                                >
                                    <span className="mr-1">{region.flag}</span>
                                    {region.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    <Button
                        type="submit"
                        size="lg"
                        fullWidth
                        loading={loading}
                        disabled={!appId.trim()}
                    >
                        {loading ? (
                            'Analyzing...'
                        ) : (
                            <>
                                <Search className="w-4 h-4" />
                                Analyze
                            </>
                        )}
                    </Button>
                </form>

                <div className="flex items-center gap-3 text-sm mt-6 flex-wrap">
                    <span className="text-gray-400">Quick start:</span>
                    {quickStarts.map((app) => (
                        <button
                            key={app.name}
                            onClick={() => onQuickStart(app.id)}
                            className="px-3 py-1 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-lg text-xs font-medium transition-colors"
                        >
                            {app.name}
                        </button>
                    ))}
                </div>
            </div>
        </Card>
    );
}
