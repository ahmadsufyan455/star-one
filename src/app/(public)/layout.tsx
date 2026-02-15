import Footer from '@/components/Footer';
import Image from 'next/image';
import Link from 'next/link';

export default function PublicLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex flex-col min-h-screen">
            <header className="border-b border-gray-100 bg-white sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                        <Image src="/starone.svg" alt="StarOne Logo" width={32} height={32} />
                        <span className="text-xl font-bold tracking-wide text-gray-900">StarOne</span>
                    </Link>

                </div>
            </header>
            <main className="flex-1">
                {children}
            </main>
            <Footer />
        </div>
    );
}
