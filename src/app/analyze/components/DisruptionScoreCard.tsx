'use client';

import { calculateDisruptionScore, disruptionDescription } from '@/lib/utils/disruption-score';

interface DisruptionScoreCardProps {
    lastUpdated: string;
    score: number;
    installs: string;
}

export function DisruptionScoreCard({ lastUpdated, score, installs }: DisruptionScoreCardProps) {
    const disruption = calculateDisruptionScore(lastUpdated, score, installs);
    const strokeColor =
        disruption.score >= 70 ? '#dc2626' :
            disruption.score >= 50 ? '#ea580c' :
                disruption.score >= 30 ? '#ca8a04' : '#16a34a';

    return (
        <div className="mb-6 p-4 lg:p-6 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100">
            <div className="flex flex-col lg:flex-row items-center gap-4 lg:gap-6">
                <div className="relative flex-shrink-0">
                    <svg className="w-24 h-24 lg:w-32 lg:h-32 transform -rotate-90" viewBox="0 0 128 128">
                        <circle cx="64" cy="64" r="56" stroke="#e5e7eb" strokeWidth="12" fill="none" />
                        <circle
                            cx="64"
                            cy="64"
                            r="56"
                            stroke={strokeColor}
                            strokeWidth="12"
                            fill="none"
                            strokeDasharray={`${(disruption.score / 100) * 351.86} 351.86`}
                            strokeLinecap="round"
                            className="transition-all duration-1000 ease-out"
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-2xl lg:text-3xl font-bold text-gray-900">{disruption.score}</span>
                        <span className="text-xs text-gray-500 font-medium">/ 100</span>
                    </div>
                </div>

                <div className="flex-1 text-center lg:text-left">
                    <div className="flex flex-col lg:flex-row items-center gap-2 lg:gap-3 mb-2">
                        <h4 className="text-xl lg:text-2xl font-bold text-gray-900">Disruption Score</h4>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${disruption.color}`}>
                            {disruption.label}
                        </span>
                    </div>
                    <p className="text-xs lg:text-sm text-gray-600 leading-relaxed">
                        {disruptionDescription(disruption.score)}
                    </p>
                </div>
            </div>
        </div>
    );
}
