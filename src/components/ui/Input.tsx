'use client';

import { InputHTMLAttributes, forwardRef, useId } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
    { label, id, className = '', ...props },
    ref,
) {
    const reactId = useId();
    const inputId = id ?? reactId;

    return (
        <div>
            {label && (
                <label
                    htmlFor={inputId}
                    className="text-xs text-gray-500 font-medium mb-2 block"
                >
                    {label}
                </label>
            )}
            <input
                ref={ref}
                id={inputId}
                className={`w-full bg-gray-50 border border-gray-200 rounded-xl px-5 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
                {...props}
            />
        </div>
    );
});
