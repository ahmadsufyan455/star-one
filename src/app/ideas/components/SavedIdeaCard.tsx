'use client';

import { Card } from '@/components/ui/Card';
import type { SavedIdea } from '@/lib/schemas/saved-idea';
import { formatRelativeDate } from '@/lib/utils/format';
import Image from 'next/image';
import { StatusBadge } from './StatusBadge';

interface SavedIdeaCardProps {
    idea: SavedIdea;
    onOpen: () => void;
}

export function SavedIdeaCard({ idea, onOpen }: SavedIdeaCardProps) {
    return (
        <button
            type="button"
            onClick={onOpen}
            className="text-left w-full group"
        >
            <Card className="hover:border-gray-300 transition-colors h-full">
                <div className="flex items-start gap-4">
                    <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-gray-100 flex-shrink-0">
                        <Image
                            src={idea.appIcon}
                            alt={idea.appName}
                            fill
                            sizes="40px"
                            className="object-cover"
                        />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3 mb-2">
                            <h3 className="font-semibold text-gray-900 leading-tight">
                                {idea.idea.name}
                            </h3>
                            <StatusBadge status={idea.status} />
                        </div>
                        <p className="text-xs text-gray-500 mb-3">
                            From {idea.appName} · saved {formatRelativeDate(idea.createdAt)}
                        </p>
                        <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                            {idea.idea.value_proposition}
                        </p>
                        {idea.notes && (
                            <p className="text-xs text-gray-500 mt-3 line-clamp-1 italic">
                                Note: {idea.notes}
                            </p>
                        )}
                    </div>
                </div>
            </Card>
        </button>
    );
}