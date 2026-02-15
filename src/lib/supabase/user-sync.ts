import { createServerSupabaseClient } from './server'

export interface UserData {
    email: string
    name?: string | null
    avatar_url?: string | null
    google_id: string
}

/**
 * Sync user data to Supabase on Google sign-in
 * Creates new user or updates existing user's last_login
 */
export async function syncUserToSupabase(userData: UserData) {
    const supabase = createServerSupabaseClient()

    try {
        // Check if user exists
        const { data: existingUser, error: fetchError } = await supabase
            .from('users')
            .select('*')
            .eq('google_id', userData.google_id)
            .single()

        if (fetchError && fetchError.code !== 'PGRST116') {
            // PGRST116 = not found, which is fine
            throw fetchError
        }

        if (existingUser) {
            // User exists, update their info and last login time
            const { error: updateError } = await supabase
                .from('users')
                .update({
                    email: userData.email,
                    name: userData.name,
                    avatar_url: userData.avatar_url,
                    updated_at: new Date().toISOString(),
                })
                .eq('google_id', userData.google_id)

            if (updateError) throw updateError

            console.log(`User ${userData.email} updated in Supabase`)
            return existingUser
        } else {
            // New user, create record
            const { data: newUser, error: insertError } = await supabase
                .from('users')
                .insert({
                    email: userData.email,
                    name: userData.name,
                    avatar_url: userData.avatar_url,
                    google_id: userData.google_id,
                })
                .select()
                .single()

            if (insertError) throw insertError

            console.log(`New user ${userData.email} added to Supabase`)
            return newUser
        }
    } catch (error) {
        console.error('Error syncing user to Supabase:', error)
        throw error
    }
}
