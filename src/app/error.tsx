'use client';

import * as Sentry from '@sentry/nextjs';
import Link from 'next/link';
import { useEffect } from 'react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        Sentry.captureException(error);
    }, [error]);

    return (
        <div className="flex min-h-screen items-center justify-center bg-[#F8F9FB] px-4">
            <div className="max-w-md w-full bg-white border border-gray-100 rounded-2xl shadow-sm p-8 text-center">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-red-50 text-red-600 flex items-center justify-center text-2xl font-bold">
                    !
                </div>
                <h1 className="text-xl font-bold text-gray-900 mb-2">Something went wrong</h1>
                <p className="text-sm text-gray-500 mb-6">
                    An unexpected error occurred. We&apos;ve been notified and are looking into it.
                </p>
                {error.digest && (
                    <p className="text-xs text-gray-400 font-mono mb-6 select-all">
                        Error ID: {error.digest}
                    </p>
                )}
                <div className="flex gap-3 justify-center">
                    <button
                        onClick={reset}
                        className="px-5 py-2.5 bg-[#1A1F2C] hover:bg-black text-white rounded-xl font-medium text-sm transition-colors"
                    >
                        Try again
                    </button>
                    <Link
                        href="/"
                        className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium text-sm transition-colors"
                    >
                        Go home
                    </Link>
                </div>
            </div>
        </div>
    );
}
