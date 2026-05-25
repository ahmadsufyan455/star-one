'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';

export default function GlobalError({
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
        <html lang="en">
            <body style={{ margin: 0, fontFamily: 'system-ui, sans-serif', backgroundColor: '#F8F9FB' }}>
                <div
                    style={{
                        minHeight: '100vh',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '1rem',
                    }}
                >
                    <div
                        style={{
                            maxWidth: '28rem',
                            width: '100%',
                            backgroundColor: 'white',
                            border: '1px solid #f3f4f6',
                            borderRadius: '1rem',
                            padding: '2rem',
                            textAlign: 'center',
                            boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
                        }}
                    >
                        <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111827', marginBottom: '0.5rem' }}>
                            Something went wrong
                        </h1>
                        <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1.5rem' }}>
                            An unexpected error occurred. We&apos;ve been notified.
                        </p>
                        {error.digest && (
                            <p
                                style={{
                                    fontSize: '0.75rem',
                                    color: '#9ca3af',
                                    fontFamily: 'monospace',
                                    marginBottom: '1.5rem',
                                }}
                            >
                                Error ID: {error.digest}
                            </p>
                        )}
                        <button
                            onClick={reset}
                            style={{
                                padding: '0.625rem 1.25rem',
                                backgroundColor: '#1A1F2C',
                                color: 'white',
                                borderRadius: '0.75rem',
                                fontWeight: 500,
                                fontSize: '0.875rem',
                                border: 'none',
                                cursor: 'pointer',
                            }}
                        >
                            Try again
                        </button>
                    </div>
                </div>
            </body>
        </html>
    );
}
