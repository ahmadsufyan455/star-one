

export const metadata = {
    title: 'About Us | StarOne',
    description: 'StarOne was built to flip the script on app development.',
};

export default function AboutPage() {
    return (
        <div className="bg-white">
            <div className="max-w-4xl mx-auto px-6 py-16 sm:py-24 lg:px-8">
                <div className="text-center">
                    <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl mb-6">
                        The best product ideas are hiding in plain sight.
                    </h1>
                    <p className="max-w-2xl mx-auto text-xl text-gray-500 mb-10">
                        As developers, we waste too much time building features nobody asked for, while massive, slow-moving apps ignore the thousands of users begging for basic improvements.
                    </p>
                </div>

                <div className="mt-12">
                    <div className="prose prose-lg mx-auto text-gray-500">
                        <div className="bg-gray-50 rounded-2xl p-8 mb-10 border border-gray-100">
                            <h2 className="text-3xl font-bold text-gray-900 mb-4 text-center">
                                StarOne.dev was built to flip the script.
                            </h2>
                        </div>

                        <p className="mb-6">
                            We believe that 1-star reviews are the ultimate cheat code for indie hackers. Instead of reading through thousands of angry comments manually, StarOne uses AI to instantly synthesize user frustration into actionable Day-1 roadmaps.
                        </p>
                        <p className="mb-6">
                            We don&apos;t just tell you what&apos;s broken; we look at install counts, update history, and monetization to tell you if a market is actually worth disrupting.
                        </p>

                        <div className="border-t border-gray-200 pt-8 mt-10">
                            <p className="text-lg font-medium text-gray-900 text-center italic">
                                Built for solo-founders, fast-moving teams, and anyone who wants to build exactly what the market is asking for.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
