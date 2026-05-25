'use client';

import { Card } from '@/components/ui/Card';
import { Lightbulb, TrendingUp } from 'lucide-react';

interface InsightListProps {
    title: string;
    icon: 'complaints' | 'features';
    items: string[];
}

const iconClasses = {
    complaints: { wrap: 'p-2 bg-red-50 text-red-600 rounded-lg', badge: 'bg-gray-100 text-gray-600', extra: 'rotate-180' },
    features: { wrap: 'p-2 bg-blue-50 text-blue-600 rounded-lg', badge: 'bg-blue-100 text-blue-600', extra: '' },
} as const;

export function InsightList({ title, icon, items }: InsightListProps) {
    const styles = iconClasses[icon];
    const Icon = icon === 'complaints' ? TrendingUp : Lightbulb;

    return (
        <Card>
            <div className="flex items-center gap-3 mb-6">
                <div className={styles.wrap}>
                    <Icon className={`w-5 h-5 ${styles.extra}`} />
                </div>
                <h3 className="text-lg font-bold text-gray-900">{title}</h3>
            </div>
            <ul className="space-y-4">
                {items.map((item, index) => (
                    <li key={index} className="flex gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                        <span className={`flex-shrink-0 w-6 h-6 ${styles.badge} rounded-full flex items-center justify-center text-xs font-bold font-mono`}>
                            {index + 1}
                        </span>
                        <span className="text-gray-600 text-sm leading-relaxed">{item}</span>
                    </li>
                ))}
            </ul>
        </Card>
    );
}
