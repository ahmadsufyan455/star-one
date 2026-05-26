'use client';

import { Card } from '@/components/ui/Card';
import type { AppIdea } from '@/lib/schemas/analysis';
import { Bookmark, Rocket } from 'lucide-react';
import { useEffect, useState } from 'react';

interface AppIdeasGridProps {
    ideas: (string | AppIdea)[];
    analysisId?: string;
}

export function AppIdeasGrid({ ideas, analysisId }: AppIdeasGridProps) {
    const [savedIndexes, setSavedIndexes] = useState<Set<number>>(new Set());

    useEffect(() => {
        if (!analysisId) return;
        let cancelled = false;
        (async () => {
            try {
                const res = await fetch(`/api/ideas/by-analysis/${analysisId}`);
                if (!res.ok) return;
                const data = await res.json();
                if (!cancelled && Array.isArray(data.indexes)) {
                    setSavedIndexes(new Set(data.indexes));
                }
            } catch {
                // Bookmark prefetch is best-effort; clicking still works without it.
            }
        })();
        return () => { cancelled = true; };
    }, [analysisId]);

    const handleToggleSave = async (index: number) => {
        if (!analysisId) return;
        const wasSaved = savedIndexes.has(index);

        setSavedIndexes((prev) => {
            const next = new Set(prev);
            if (wasSaved) next.delete(index);
            else next.add(index);
            return next;
        });

        try {
            if (wasSaved) {
                // Need the row id to delete; fetch the index list and find the
                // current saved row. We could alternatively cache row ids on
                // first save, but this keeps the client state simple.
                const res = await fetch('/api/ideas');
                const data = await res.json();
                const row = (data.ideas ?? []).find(
                    (r: { analysisId: string | null; ideaIndex: number; id: string }) =>
                        r.analysisId === analysisId && r.ideaIndex === index,
                );
                if (row) {
                    await fetch(`/api/ideas/${row.id}`, { method: 'DELETE' });
                }
            } else {
                await fetch('/api/ideas', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ analysisId, ideaIndex: index }),
                });
            }
        } catch {
            setSavedIndexes((prev) => {
                const next = new Set(prev);
                if (wasSaved) next.add(index);
                else next.delete(index);
                return next;
            });
        }
    };

    return (
        <Card padding="lg">
            <div className="flex items-center gap-4 mb-8 border-b border-gray-100 pb-6">
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                    <Rocket className="w-6 h-6" />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-gray-900">App Opportunities</h3>
                    <p className="text-gray-500 text-sm">
                        {analysisId
                            ? 'Bookmark ideas worth pursuing — they sync to your workspace'
                            : 'Project ideas for indie hackers'}
                    </p>
                </div>
            </div>

            <div className="grid gap-4">
                {ideas.map((idea, index) => (
                    <AppIdeaCard
                        key={index}
                        idea={idea}
                        index={index}
                        canSave={!!analysisId}
                        saved={savedIndexes.has(index)}
                        onToggleSave={() => handleToggleSave(index)}
                    />
                ))}
            </div>
        </Card>
    );
}

interface AppIdeaCardProps {
    idea: string | AppIdea;
    index: number;
    canSave: boolean;
    saved: boolean;
    onToggleSave: () => void;
}

function AppIdeaCard({ idea, index, canSave, saved, onToggleSave }: AppIdeaCardProps) {
    const isStructured = typeof idea === 'object' && idea !== null;

    return (
        <div className="bg-gray-50 rounded-xl p-6 border border-gray-100 hover:border-indigo-100 hover:bg-white hover:shadow-md transition-all duration-300 group">
            <div className="flex gap-4">
                <span className="flex-shrink-0 w-8 h-8 bg-white border border-gray-200 text-gray-500 rounded-lg flex items-center justify-center text-sm font-bold font-mono group-hover:bg-indigo-50 group-hover:text-indigo-600 group-hover:border-indigo-100 transition-colors">
                    {index + 1}
                </span>
                <div className="flex-1">
                    {isStructured ? <StructuredIdea idea={idea} /> : <p className="text-gray-600 leading-relaxed">{idea}</p>}
                </div>
                {canSave && (
                    <button
                        type="button"
                        onClick={onToggleSave}
                        aria-label={saved ? 'Remove from saved ideas' : 'Save idea'}
                        aria-pressed={saved}
                        className={`flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
                            saved
                                ? 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
                                : 'bg-white border border-gray-200 text-gray-400 hover:text-indigo-600 hover:border-indigo-200'
                        }`}
                    >
                        <Bookmark className={`w-4 h-4 ${saved ? 'fill-current' : ''}`} />
                    </button>
                )}
            </div>
        </div>
    );
}

function StructuredIdea({ idea }: { idea: AppIdea }) {
    return (
        <div className="space-y-2">
            <h4 className="font-bold text-lg text-gray-900 group-hover:text-indigo-700 transition-colors">
                {idea.name}
            </h4>
            <div className="grid lg:grid-cols-3 gap-6 mt-4 pt-4 border-t border-gray-200/50 text-sm">
                <IdeaField label="Pain Point" dot="bg-red-400" text={idea.pain_point} />
                <IdeaField label="Differentiation" dot="bg-blue-400" text={idea.differentiation} />
                <IdeaField label="Value" dot="bg-green-400" text={idea.value_proposition} highlight />
            </div>
        </div>
    );
}

function IdeaField({ label, dot, text, highlight = false }: { label: string; dot: string; text: string; highlight?: boolean }) {
    return (
        <div className="space-y-1.5">
            <span className="text-gray-400 text-xs uppercase tracking-wider font-bold flex items-center gap-1">
                <span className={`w-1.5 h-1.5 rounded-full ${dot}`}></span>
                {label}
            </span>
            <p className={`${highlight ? 'text-gray-900 font-medium' : 'text-gray-600'} text-xs leading-relaxed`}>
                {text}
            </p>
        </div>
    );
}
