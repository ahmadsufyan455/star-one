import { ArrowLeft, Construction } from "lucide-react";
import Link from "next/link";
import Footer from "./Footer";

interface ComingSoonProps {
    title: string;
    description: string;
}

export default function ComingSoon({ title, description }: ComingSoonProps) {
    return (
        <div className="flex min-h-screen flex-col bg-[#F8F9FB]">
            <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
                <div className="mb-6 rounded-full bg-white p-6 shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
                    <Construction className="h-12 w-12 text-indigo-500" />
                </div>
                <h1 className="mb-2 text-3xl font-bold text-gray-900">{title}</h1>
                <p className="mb-8 text-gray-500 max-w-md">{description}</p>

                <Link
                    href="/analyze"
                    className="flex items-center gap-2 rounded-xl bg-[#1A1F2C] px-6 py-3 text-sm font-medium text-white transition-all hover:bg-gray-800"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Dashboard
                </Link>
            </div>
            <Footer />
        </div>
    );
}
