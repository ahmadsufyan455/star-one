'use client';

import { HTMLAttributes, ReactNode } from 'react';

type Padding = 'none' | 'sm' | 'md' | 'lg';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
    children: ReactNode;
    padding?: Padding;
}

const paddingClasses: Record<Padding, string> = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
};

export function Card({ children, padding = 'md', className = '', ...props }: CardProps) {
    return (
        <div
            className={`bg-white rounded-2xl border border-gray-100 shadow-sm ${paddingClasses[padding]} ${className}`}
            {...props}
        >
            {children}
        </div>
    );
}
