'use client';

import { Menu, User } from 'lucide-react';
import Image from 'next/image';
import type { Session } from 'next-auth';

interface AnalyzeHeaderProps {
    session: Session | null;
    onMenuToggle: () => void;
}

export function AnalyzeHeader({ session, onMenuToggle }: AnalyzeHeaderProps) {
    return (
        <header className="border-b border-gray-100 bg-white sticky top-0 z-40">
            <div className="px-4 lg:px-8 h-16 flex items-center justify-between">
                <button
                    onClick={onMenuToggle}
                    className="lg:hidden flex items-center justify-center w-10 h-10 rounded-lg hover:bg-gray-50 transition-colors"
                    aria-label="Toggle menu"
                >
                    <Menu className="w-5 h-5 text-gray-700" />
                </button>

                <div className="ml-auto">
                    <button
                        type="button"
                        className="flex items-center gap-3 pl-2 pr-4 py-1.5 bg-white rounded-lg border border-gray-100 hover:border-gray-200 transition-colors"
                    >
                        {session?.user?.image ? (
                            <Image
                                src={session.user.image}
                                alt={session.user.name || 'User'}
                                width={32}
                                height={32}
                                className="w-8 h-8 rounded-full object-cover"
                            />
                        ) : (
                            <div className="w-8 h-8 bg-[#1A1F2C] rounded-full flex items-center justify-center text-white">
                                <User className="w-4 h-4" />
                            </div>
                        )}
                        <span className="font-medium text-sm hidden lg:inline">
                            {session?.user?.name || 'Indie Hacker'}
                        </span>
                    </button>
                </div>
            </div>
        </header>
    );
}
