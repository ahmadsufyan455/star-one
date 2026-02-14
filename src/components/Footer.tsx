import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="bg-white border-t border-gray-100 mt-auto">
            <div className="max-w-7xl mx-auto px-8 py-8">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    {/* Brand */}
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">
                            © {new Date().getFullYear()} <span className="font-semibold text-gray-900">StarOne</span>. All rights reserved.
                        </span>
                    </div>

                    {/* Links */}
                    <nav className="flex items-center gap-6">
                        <Link
                            href="/about"
                            className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                        >
                            About
                        </Link>
                        <Link
                            href="/privacy-policy"
                            className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                        >
                            Privacy Policy
                        </Link>
                        <Link
                            href="/terms-of-service"
                            className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                        >
                            Terms of Service
                        </Link>
                    </nav>
                </div>
            </div>
        </footer>
    );
}
