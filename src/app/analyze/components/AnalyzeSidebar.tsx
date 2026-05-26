'use client';

import { Bookmark, History, LogOut, Search, Settings } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface AnalyzeSidebarProps {
    isOpen: boolean;
    onClose: () => void;
    onLogout: () => void;
}

export function AnalyzeSidebar({ isOpen, onClose, onLogout }: AnalyzeSidebarProps) {
    return (
        <>
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={onClose}
                />
            )}

            <aside
                className={`w-64 bg-white border-r border-gray-100 flex flex-col fixed h-full z-50 transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'
                    } lg:translate-x-0`}
            >
                <Link href="/" className="p-8 flex items-center gap-3 hover:opacity-80 transition-opacity">
                    <Image src="/starone.svg" alt="StarOne Logo" width={32} height={32} />
                    <h1 className="text-xl font-bold tracking-wide">StarOne</h1>
                </Link>

                <nav className="flex-1 px-4 space-y-1">
                    <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                        Main Menu
                    </div>
                    <Link
                        href="/analyze"
                        className="flex items-center gap-3 px-4 py-3 bg-[#1A1F2C] text-white rounded-xl transition-colors"
                        onClick={onClose}
                    >
                        <Search className="w-5 h-5" />
                        <span className="font-medium">Analyzer</span>
                    </Link>
                    <Link
                        href="/history"
                        className="flex items-center gap-3 px-4 py-3 text-gray-500 hover:bg-gray-50 hover:text-gray-900 rounded-xl transition-colors"
                        onClick={onClose}
                    >
                        <History className="w-5 h-5" />
                        <span className="font-medium">History</span>
                    </Link>
                    <Link
                        href="/ideas"
                        className="flex items-center gap-3 px-4 py-3 text-gray-500 hover:bg-gray-50 hover:text-gray-900 rounded-xl transition-colors"
                        onClick={onClose}
                    >
                        <Bookmark className="w-5 h-5" />
                        <span className="font-medium">Saved Ideas</span>
                    </Link>
                </nav>

                <nav className="p-4 space-y-1 mb-8">
                    <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                        Account
                    </div>
                    <Link
                        href="/settings"
                        className="flex items-center gap-3 px-4 py-3 text-gray-500 hover:bg-gray-50 hover:text-gray-900 rounded-xl transition-colors"
                        onClick={onClose}
                    >
                        <Settings className="w-5 h-5" />
                        <span className="font-medium">Setting</span>
                    </Link>
                    <button
                        onClick={onLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-gray-500 hover:bg-gray-50 hover:text-gray-900 rounded-xl transition-colors text-left"
                    >
                        <LogOut className="w-5 h-5" />
                        <span className="font-medium">Log out</span>
                    </button>
                </nav>
            </aside>
        </>
    );
}
