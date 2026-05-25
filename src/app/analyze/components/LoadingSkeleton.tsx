'use client';

import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';

export function LoadingSkeleton() {
    return (
        <div className="space-y-6 animate-fade-in pb-12">
            <Card>
                <div className="flex items-center gap-4 mb-4">
                    <Skeleton className="w-12 h-12 rounded-xl" />
                    <div className="flex-1 space-y-2">
                        <Skeleton className="h-6 w-48" />
                        <Skeleton className="h-4 w-32" />
                    </div>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-500 bg-blue-50 px-4 py-3 rounded-xl border border-blue-100">
                    <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <span className="font-medium">Analyzing app reviews... This typically takes 5-10 seconds</span>
                </div>
            </Card>

            <Card>
                <Skeleton className="h-6 w-64 mb-6" />
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                            <Skeleton className="h-3 w-20 mb-3" />
                            <Skeleton className="h-5 w-24" />
                        </div>
                    ))}
                </div>
            </Card>

            <div className="grid lg:grid-cols-2 gap-6">
                {[1, 2].map((i) => (
                    <Card key={i}>
                        <Skeleton className="h-6 w-40 mb-6" />
                        <div className="space-y-4">
                            {[1, 2, 3].map((j) => (
                                <Skeleton key={j} className="h-12 rounded-lg" />
                            ))}
                        </div>
                    </Card>
                ))}
            </div>

            <Card>
                <Skeleton className="h-6 w-48 mb-4" />
                <div className="space-y-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                    <Skeleton className="h-4 w-4/6" />
                </div>
            </Card>
        </div>
    );
}
