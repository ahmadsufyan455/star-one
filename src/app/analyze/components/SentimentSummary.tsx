'use client';

import { Card } from '@/components/ui/Card';
import { MessageSquareWarning } from 'lucide-react';

export function SentimentSummary({ summary }: { summary: string }) {
    return (
        <Card>
            <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                    <MessageSquareWarning className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Sentiment Summary</h3>
            </div>
            <p className="text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-xl text-sm">
                {summary}
            </p>
        </Card>
    );
}
