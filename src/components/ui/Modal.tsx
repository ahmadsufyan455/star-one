'use client';

import { X } from 'lucide-react';
import { ReactNode, useEffect } from 'react';

type MaxWidth = 'sm' | 'md' | 'lg' | 'xl';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: ReactNode;
    showCloseButton?: boolean;
    closeOnBackdropClick?: boolean;
    maxWidth?: MaxWidth;
}

const widthClasses: Record<MaxWidth, string> = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
};

export function Modal({
    isOpen,
    onClose,
    children,
    showCloseButton = true,
    closeOnBackdropClick = true,
    maxWidth = 'md',
}: ModalProps) {
    useEffect(() => {
        if (!isOpen) return;

        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleKey);

        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        return () => {
            document.removeEventListener('keydown', handleKey);
            document.body.style.overflow = prevOverflow;
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={closeOnBackdropClick ? onClose : undefined}
            role="dialog"
            aria-modal="true"
        >
            <div
                className={`relative w-full ${widthClasses[maxWidth]} bg-white rounded-2xl shadow-2xl p-6 animate-[scale-in_0.2s_ease-out]`}
                onClick={(e) => e.stopPropagation()}
            >
                {showCloseButton && (
                    <button
                        type="button"
                        onClick={onClose}
                        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                        aria-label="Close"
                    >
                        <X className="w-5 h-5" />
                    </button>
                )}
                {children}
            </div>
        </div>
    );
}
