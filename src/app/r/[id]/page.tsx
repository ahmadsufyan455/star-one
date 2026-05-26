import 'server-only';

import Footer from '@/components/Footer';
import { getAnalysisById } from '@/lib/analyses';
import type { AnalysisResponse } from '@/lib/schemas/analysis';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ResultsLayout } from '../../analyze/components/ResultsLayout';

interface SharePageProps {
    params: Promise<{ id: string }>;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const dynamic = 'force-dynamic';

export default async function SharePage({ params }: SharePageProps) {
    const { id } = await params;
    if (!UUID_RE.test(id)) notFound();

    const analysis = await getAnalysisById(id);
    if (!analysis) notFound();

    const results: AnalysisResponse = {
        ...analysis.payload,
        id: analysis.id,
        createdAt: analysis.createdAt,
    };

    return (
        <div className="min-h-screen bg-[#F8F9FB] font-sans text-gray-900">
            <header className="border-b border-gray-100 bg-white">
                <div className="max-w-5xl mx-auto px-4 lg:px-8 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                        <Image src="/starone.svg" alt="StarOne" width={28} height={28} />
                        <span className="font-bold text-lg">StarOne</span>
                    </Link>
                    <Link
                        href="/login"
                        className="px-4 py-2 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-800"
                    >
                        Run your own analysis
                    </Link>
                </div>
            </header>

            <main className="p-4 lg:p-8">
                <div className="max-w-5xl mx-auto space-y-6">
                    <div className="text-xs text-gray-500 uppercase tracking-wide font-medium">
                        Shared analysis · read-only
                    </div>
                    <ResultsLayout results={results} />
                </div>
            </main>

            <Footer />
        </div>
    );
}
