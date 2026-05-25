'use client';

import { Button } from '@/components/ui/Button';
import { X } from 'lucide-react';
import Image from 'next/image';

interface ResultsHeaderProps {
    appName: string;
    appIcon: string;
    onClear: () => void;
}

export function ResultsHeader({ appName, appIcon, onClear }: ResultsHeaderProps) {
    return (
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4 lg:gap-6 bg-white p-4 lg:p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="relative w-12 h-12 lg:w-16 lg:h-16 rounded-xl overflow-hidden shadow-sm border border-gray-100 flex-shrink-0">
                <Image
                    src={appIcon}
                    alt={appName}
                    fill
                    sizes="(max-width: 640px) 48px, 64px"
                    className="object-cover"
                />
            </div>
            <div className="flex-1 min-w-0">
                <h2 className="text-lg lg:text-2xl font-bold text-gray-900 mb-1 truncate">{appName}</h2>
                <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1 rounded-full w-fit">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    <span className="text-xs font-medium uppercase tracking-wide">Analysis Complete</span>
                </div>
            </div>
            <Button variant="secondary" size="md" onClick={onClear} className="w-full lg:w-auto">
                <X className="w-4 h-4" />
                <span className="hidden lg:inline">Analyze Another App</span>
                <span className="lg:hidden">New Analysis</span>
            </Button>
        </div>
    );
}
