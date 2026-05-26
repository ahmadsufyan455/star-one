'use client';

import { Button } from '@/components/ui/Button';
import { Check, Share2, X } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

interface ResultsHeaderProps {
    appName: string;
    appIcon: string;
    onClear?: () => void;
    shareId?: string;
}

export function ResultsHeader({ appName, appIcon, onClear, shareId }: ResultsHeaderProps) {
    const [copied, setCopied] = useState(false);

    const handleShare = async () => {
        if (!shareId || typeof window === 'undefined') return;
        const url = `${window.location.origin}/r/${shareId}`;
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            window.prompt('Copy this share link:', url);
        }
    };

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
            <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
                {shareId && (
                    <Button variant="secondary" size="md" onClick={handleShare} className="w-full sm:w-auto">
                        {copied ? (
                            <>
                                <Check className="w-4 h-4" />
                                <span>Copied</span>
                            </>
                        ) : (
                            <>
                                <Share2 className="w-4 h-4" />
                                <span>Share</span>
                            </>
                        )}
                    </Button>
                )}
                {onClear && (
                    <Button variant="secondary" size="md" onClick={onClear} className="w-full sm:w-auto">
                        <X className="w-4 h-4" />
                        <span className="hidden lg:inline">Analyze Another App</span>
                        <span className="lg:hidden">New Analysis</span>
                    </Button>
                )}
            </div>
        </div>
    );
}
