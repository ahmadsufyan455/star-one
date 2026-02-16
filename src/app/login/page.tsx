import { signIn } from "@/auth"
import Footer from "@/components/Footer"
import Image from "next/image"
import Link from "next/link"
import { use } from "react"

export default function LoginPage({
    searchParams,
}: {
    searchParams: Promise<{ error?: string }>
}) {
    // Unwrap the Promise using React.use()
    const params = use(searchParams);

    // Map NextAuth error codes to user-friendly messages
    const getErrorMessage = (error?: string) => {
        if (!error) return null;

        const errorMessages: Record<string, string> = {
            OAuthSignin: "Error connecting to Google. Please try again.",
            OAuthCallback: "Error during sign-in. Please try again.",
            OAuthCallbackError: "Error during sign-in. Please try again.",
            OAuthCreateAccount: "Could not create your account. Please try again.",
            EmailCreateAccount: "Could not create your account. Please try again.",
            Callback: "Error during sign-in. Please try again.",
            OAuthAccountNotLinked: "This email is already associated with another account.",
            EmailSignin: "Error sending sign-in email.",
            CredentialsSignin: "Sign-in failed. Please try again.",
            SessionRequired: "Please sign in to access this page.",
            AccessDenied: "You denied access. Please grant permission to continue.",
            Verification: "The verification link has expired or has already been used.",
            Default: "An error occurred. Please try again.",
        };

        return errorMessages[error] || errorMessages.Default;
    };

    const errorMessage = getErrorMessage(params.error);

    return (
        <div className="flex min-h-screen flex-col bg-[#F8F9FB] font-sans text-gray-900">
            <div className="flex-1 flex flex-col items-center justify-center p-4">
                {/* Logo Section */}
                <div className="mb-8 flex flex-col items-center gap-4">
                    <Link href="/" className="flex flex-col items-center gap-4 hover:opacity-80 transition-opacity">
                        <Image src="/starone.svg" alt="StarOne Logo" width={32} height={32} />
                        <h1 className="text-2xl font-bold tracking-wide text-gray-900">StarOne</h1>
                    </Link>
                    <p className="text-sm text-gray-500">Turn user pain points into your next product idea</p>
                </div>

                {/* Error Message */}
                {errorMessage && (
                    <div className="w-full max-w-md mb-6 rounded-xl bg-red-50 border-2 border-red-300 p-5 shadow-lg animate-[shake_0.5s_ease-in-out]">
                        <div className="flex items-start gap-3">
                            <div className="flex-shrink-0">
                                <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="flex-1">
                                <h3 className="text-sm font-semibold text-red-900 mb-1">Sign-in Failed</h3>
                                <p className="text-sm text-red-800">{errorMessage}</p>
                                {params.error === "AccessDenied" && (
                                    <p className="text-xs text-red-700 mt-2 bg-red-100 p-2 rounded">
                                        💡 <strong>Note:</strong> You must accept the Google consent screen to sign in. This allows us to access your basic profile information.
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Login Card */}
                <div className="w-full max-w-md rounded-3xl bg-white p-10 shadow-[0_4px_24px_rgba(0,0,0,0.04)] border border-gray-100/50">
                    <div className="mb-8 text-center">
                        <h2 className="mb-2 text-xl font-bold text-gray-900">Welcome</h2>
                        <p className="text-sm text-gray-500">Sign in to start analyzing competitor apps</p>
                    </div>

                    <form
                        action={async () => {
                            "use server"
                            await signIn("google", { redirectTo: "/analyze" })
                        }}
                    >
                        <button
                            type="submit"
                            className="flex w-full items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white py-3 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all focus:outline-none focus:ring-2 focus:ring-gray-200 focus:ring-offset-2"
                        >
                            <svg className="h-5 w-5" viewBox="0 0 24 24">
                                <path
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    fill="#4285F4"
                                />
                                <path
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    fill="#34A853"
                                />
                                <path
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                    fill="#FBBC05"
                                />
                                <path
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    fill="#EA4335"
                                />
                            </svg>
                            Continue with Google
                        </button>
                    </form>
                </div>

                {/* Terms text */}
                <p className="mt-8 text-xs text-gray-400 text-center max-w-xs mx-auto leading-relaxed">
                    By continuing, you agree to our <Link href="/terms-of-service" className="underline hover:text-gray-600">Terms of Service</Link> and <Link href="/privacy-policy" className="underline hover:text-gray-600">Privacy Policy</Link>
                </p>
            </div>

            {/* Footer */}
            <Footer />
        </div>
    )
}
