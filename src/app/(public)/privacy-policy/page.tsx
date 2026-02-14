

export const metadata = {
    title: 'Privacy Policy | StarOne',
    description: 'StarOne Privacy Policy',
};

export default function PrivacyPolicyPage() {
    return (
        <div className="bg-white py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto prose prose-blue prose-lg">
                <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl text-center mb-10">Privacy Policy</h1>

                <p className="text-gray-600 mb-8">
                    Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>

                <section className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Introduction</h2>
                    <p className="text-gray-600">
                        Welcome to StarOne (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;). We are committed to protecting your personal information and your right to privacy.
                        If you have any questions or concerns about our policy, or our practices with regards to your personal information, please create a ticket in contact us section.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Information We Collect</h2>
                    <p className="text-gray-600 mb-4">
                        We collect personal information that you voluntarily provide to us when you register on the website, express an interest in obtaining information about us or our products and services,
                        when you participate in activities on the website or otherwise when you contact us.
                    </p>
                    <ul className="list-disc pl-5 text-gray-600 space-y-2">
                        <li>Name and Contact Data (email address, phone number).</li>
                        <li>Credentials (passwords, hints, and similar security information).</li>
                        <li>Payment Data (data necessary to process your payment if you make purchases).</li>
                    </ul>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">3. How We Use Your Information</h2>
                    <p className="text-gray-600 mb-4">
                        We use personal information collected via our website for a variety of business purposes described below. We process your personal information for these purposes in reliance on our legitimate business interests,
                        in order to enter into or perform a contract with you, with your consent, and/or for compliance with our legal obligations.
                    </p>
                    <ul className="list-disc pl-5 text-gray-600 space-y-2">
                        <li>To facilitate account creation and logon process.</li>
                        <li>To send you marketing and promotional communications.</li>
                        <li>To fulfill and manage your orders.</li>
                        <li>To post testimonials.</li>
                        <li>To safeguard our Services.</li>
                    </ul>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Sharing Your Information</h2>
                    <p className="text-gray-600">
                        We only share information with your consent, to comply with laws, to provide you with services, to protect your rights, or to fulfill business obligations.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Contact Us</h2>
                    <p className="text-gray-600">
                        If you have questions or comments about this policy, you may email us at simpelkode@gmail.com.
                    </p>
                </section>
            </div>
        </div>
    );
}
