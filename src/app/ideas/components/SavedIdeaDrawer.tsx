'use client';

import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import type { SavedIdea, SavedIdeaStatus } from '@/lib/schemas/saved-idea';
import { Hammer, Lightbulb, Rocket } from 'lucide-react';
import { useEffect, useState } from 'react';

interface SavedIdeaDrawerProps {
    idea: SavedIdea | null;
    onClose: () => void;
    onSave: (patch: { notes?: string; status?: SavedIdeaStatus }) => Promise<void>;
    onDelete: () => Promise<void>;
}

const STATUS_OPTIONS: {
    value: SavedIdeaStatus;
    label: string;
    activeClass: string;
    inactiveClass: string;
}[] = [
    {
        value: 'idea',
        label: 'Idea',
        activeClass: 'bg-gray-900 text-white border-gray-900',
        inactiveClass: 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100',
    },
    {
        value: 'building',
        label: 'Building',
        activeClass: 'bg-blue-600 text-white border-blue-600',
        inactiveClass: 'bg-blue-50 text-blue-700 border-blue-100 hover:bg-blue-100',
    },
    {
        value: 'shipped',
        label: 'Shipped',
        activeClass: 'bg-green-600 text-white border-green-600',
        inactiveClass: 'bg-green-50 text-green-700 border-green-100 hover:bg-green-100',
    },
    {
        value: 'skipped',
        label: 'Skipped',
        activeClass: 'bg-amber-600 text-white border-amber-600',
        inactiveClass: 'bg-amber-50 text-amber-700 border-amber-100 hover:bg-amber-100',
    },
];

export function SavedIdeaDrawer({ idea, onClose, onSave, onDelete }: SavedIdeaDrawerProps) {
    const [notes, setNotes] = useState('');
    const [status, setStatus] = useState<SavedIdeaStatus>('idea');
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        if (idea) {
            setNotes(idea.notes);
            setStatus(idea.status);
        }
    }, [idea]);

    if (!idea) return null;

    const handleSave = async () => {
        setSaving(true);
        try {
            await onSave({ notes, status });
            onClose();
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Remove this idea from your workspace? You can always save it again from the analysis.')) {
            return;
        }
        setDeleting(true);
        try {
            await onDelete();
            onClose();
        } finally {
            setDeleting(false);
        }
    };

    return (
        <Modal isOpen={!!idea} onClose={onClose} maxWidth="xl">
            <header className="flex-shrink-0 px-6 pt-6 pb-4 border-b border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-1 break-words pr-8">
                    {idea.idea.name}
                </h2>
                <p className="text-xs text-gray-500">From {idea.appName}</p>
            </header>

            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
                <div className="grid gap-3 text-sm">
                    <DrawerField icon={<Lightbulb className="w-4 h-4" />} label="Pain point" body={idea.idea.pain_point} />
                    <DrawerField icon={<Hammer className="w-4 h-4" />} label="Differentiation" body={idea.idea.differentiation} />
                    <DrawerField icon={<Rocket className="w-4 h-4" />} label="Value" body={idea.idea.value_proposition} />
                </div>

                <div className="space-y-2">
                    <label className="block text-xs text-gray-500 font-medium uppercase tracking-wide">
                        Status
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {STATUS_OPTIONS.map((opt) => {
                            const active = status === opt.value;
                            return (
                                <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => setStatus(opt.value)}
                                    aria-pressed={active}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                                        active ? opt.activeClass : opt.inactiveClass
                                    }`}
                                >
                                    {opt.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="space-y-2">
                    <label htmlFor="idea-notes" className="block text-xs text-gray-500 font-medium uppercase tracking-wide">
                        Notes
                    </label>
                    <textarea
                        id="idea-notes"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={5}
                        maxLength={2000}
                        placeholder="Capture next steps, links, partners, gut reactions..."
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 transition-all resize-none"
                    />
                    <p className="text-xs text-gray-400 text-right">{notes.length}/2000</p>
                </div>
            </div>

            <footer className="flex-shrink-0 flex flex-col-reverse sm:flex-row sm:justify-between gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/50 rounded-b-2xl">
                <Button
                    type="button"
                    variant="ghost"
                    onClick={handleDelete}
                    loading={deleting}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                    Remove
                </Button>
                <div className="flex gap-3">
                    <Button type="button" variant="secondary" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button type="button" onClick={handleSave} loading={saving}>
                        Save changes
                    </Button>
                </div>
            </footer>
        </Modal>
    );
}

function DrawerField({ icon, label, body }: { icon: React.ReactNode; label: string; body: string }) {
    return (
        <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
            <div className="flex items-center gap-2 text-xs text-gray-500 font-medium uppercase tracking-wide mb-1.5">
                {icon}
                {label}
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">{body}</p>
        </div>
    );
}