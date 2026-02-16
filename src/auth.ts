import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { syncUserToSupabase } from "./lib/supabase/user-sync"

export const { handlers, auth, signIn, signOut } = NextAuth({
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        }),
    ],
    callbacks: {
        authorized: async ({ auth }) => {
            // Logged in users are authenticated, otherwise redirect to login
            return !!auth
        },
        // Sync user to Supabase on sign-in
        async signIn({ user, account }) {
            // Only sync for Google provider
            if (account?.provider === "google" && user.email) {
                const MAX_RETRIES = 2;
                let lastError: Error | null = null;

                // Try to sync with retries
                for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
                    try {
                        await syncUserToSupabase({
                            email: user.email,
                            name: user.name,
                            avatar_url: user.image,
                            google_id: account.providerAccountId,
                        });

                        // Success! Allow sign-in
                        return true;
                    } catch (error) {
                        lastError = error as Error;
                        console.error(`Supabase sync attempt ${attempt}/${MAX_RETRIES} failed:`, error);

                        // If it's the last attempt, decide whether to allow login
                        if (attempt === MAX_RETRIES) {
                            // Check if it's a critical error
                            const errorMessage = lastError?.message || '';

                            // Network/timeout errors - allow login (temporary issue)
                            if (errorMessage.includes('fetch') ||
                                errorMessage.includes('network') ||
                                errorMessage.includes('timeout')) {
                                console.warn('⚠️ Supabase sync failed due to network issue. Allowing login.');
                                return true;
                            }

                            // Database errors - block login (data integrity issue)
                            if (errorMessage.includes('duplicate') ||
                                errorMessage.includes('constraint') ||
                                errorMessage.includes('permission')) {
                                console.error('🚫 Supabase sync failed due to database error. Blocking login.');
                                return false;
                            }

                            // Unknown errors - allow login but log warning
                            console.warn('⚠️ Supabase sync failed with unknown error. Allowing login.');
                            return true;
                        }

                        // Wait before retry (exponential backoff)
                        await new Promise(resolve => setTimeout(resolve, attempt * 500));
                    }
                }
            }
            return true;
        },
    },
    pages: {
        signIn: "/login", // Custom login page
        error: "/login", // Redirect errors to login page
    },
})
