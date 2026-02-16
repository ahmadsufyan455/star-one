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
        // Validate input data
        if (!userData.email || !userData.google_id) {
            throw new Error('Missing required user data: email or google_id');
        }

        // Check if user exists
        const { data: existingUser, error: fetchError } = await supabase
            .from('users')
            .select('*')
            .eq('google_id', userData.google_id)
            .single()

        if (fetchError && fetchError.code !== 'PGRST116') {
            // PGRST116 = not found, which is fine
            throw new Error(`Failed to fetch user: ${fetchError.message}`);
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

            if (updateError) {
                throw new Error(`Failed to update user: ${updateError.message}`);
            }

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

            if (insertError) {
                // Check for specific error types
                if (insertError.code === '23505') {
                    throw new Error(`User with email ${userData.email} already exists (duplicate key)`);
                }
                if (insertError.code === '42501') {
                    throw new Error('Permission denied: Cannot insert user into database');
                }
                throw new Error(`Failed to create user: ${insertError.message}`);
            }

            console.log(`New user ${userData.email} added to Supabase`)
            return newUser
        }
    } catch (error) {
        // Re-throw with context
        if (error instanceof Error) {
            console.error('Error syncing user to Supabase:', error.message);
            throw error;
        }

        // Unknown error type
        const unknownError = new Error(`Unknown error syncing user: ${String(error)}`);
        console.error(unknownError.message);
        throw unknownError;
    }
}
