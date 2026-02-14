

export const metadata = {
    title: 'Terms of Service | StarOne',
    description: 'StarOne Terms of Service',
};

export default function TermsOfServicePage() {
    return (
        <div className="bg-white py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto prose prose-blue prose-lg">
                <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl text-center mb-10">Terms of Service</h1>

                <p className="text-gray-600 mb-8">
                    Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>

                <section className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Agreement to Terms</h2>
                    <p className="text-gray-600">
                        These Terms of Use constitute a legally binding agreement made between you, whether personally or on behalf of an entity (“you”) and StarOne (&quot;we,&quot; &quot;us&quot; or &quot;our&quot;),
                        concerning your access to and use of the StarOne website as well as any other media form, media channel, mobile website or mobile application related, linked, or otherwise connected thereto (collectively, the “Site”).
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Intellectual Property Rights</h2>
                    <p className="text-gray-600">
                        Unless otherwise indicated, the Site is our proprietary property and all source code, databases, functionality, software, website designs, audio, video, text, photographs, and graphics on the Site (collectively, the “Content”)
                        and the trademarks, service marks, and logos contained therein (the “Marks”) are owned or controlled by us or licensed to us, and are protected by copyright and trademark laws.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">3. User Representations</h2>
                    <p className="text-gray-600">
                        By using the Site, you represent and warrant that:
                        (1) all registration information you submit will be true, accurate, current, and complete;
                        (2) you will maintain the accuracy of such information and promptly update such registration information as necessary;
                        (3) you have the legal capacity and you agree to comply with these Terms of Use.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Prohibited Activities</h2>
                    <p className="text-gray-600">
                        You may not access or use the Site for any purpose other than that for which we make the Site available.
                        The Site may not be used in connection with any commercial endeavors except those that are specifically endorsed or approved by us.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Modifications and Interruptions</h2>
                    <p className="text-gray-600">
                        We reserve the right to change, modify, or remove the contents of the Site at any time or for any reason at our sole discretion without notice.
                        We will not be liable to you or any third party for any modification, price change, suspension, or discontinuance of the Site.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Contact Us</h2>
                    <p className="text-gray-600">
                        In order to resolve a complaint regarding the Site or to receive further information regarding use of the Site, please contact us at simpelkode@gmail.com.
                    </p>
                </section>
            </div>
        </div>
    );
}
