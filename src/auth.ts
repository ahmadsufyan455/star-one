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
                try {
                    await syncUserToSupabase({
                        email: user.email,
                        name: user.name,
                        avatar_url: user.image,
                        google_id: account.providerAccountId, // Google user ID
                    })
                    return true
                } catch (error) {
                    console.error("Failed to sync user to Supabase:", error)
                    // Allow login even if Supabase sync fails
                    return true
                }
            }
            return true
        },
    },
    pages: {
        signIn: "/login", // Custom login page
    },
})
