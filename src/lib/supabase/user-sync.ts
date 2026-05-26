import { createServerSupabaseClient } from './server'

export interface UserData {
    email: string
    name?: string | null
    avatar_url?: string | null
    google_id: string
}

/**
 * Sync user data to Supabase on Google sign-in.
 *
 * Uses an upsert keyed on `google_id` so concurrent first sign-ins (e.g.
 * the same Google account opening the site in two tabs at once) cannot
 * race into a duplicate-key violation. The previous SELECT+INSERT/UPDATE
 * pattern would intermittently fail under this exact workload.
 *
 * Requires a unique constraint on `users.google_id` for the upsert
 * conflict target to work — the column is already declared unique in the
 * production schema.
 */
export async function syncUserToSupabase(userData: UserData) {
    if (!userData.email || !userData.google_id) {
        throw new Error('Missing required user data: email or google_id');
    }

    const supabase = createServerSupabaseClient()

    try {
        const { data, error } = await supabase
            .from('users')
            .upsert(
                {
                    email: userData.email,
                    name: userData.name,
                    avatar_url: userData.avatar_url,
                    google_id: userData.google_id,
                    updated_at: new Date().toISOString(),
                },
                { onConflict: 'google_id' },
            )
            .select()
            .single()

        if (error) {
            if (error.code === '42501') {
                throw new Error('Permission denied: Cannot upsert user into database');
            }
            throw new Error(`Failed to upsert user: ${error.message}`);
        }

        console.log(`User ${userData.email} synced to Supabase`)
        return data
    } catch (error) {
        if (error instanceof Error) {
            console.error('Error syncing user to Supabase:', error.message);
            throw error;
        }
        const unknownError = new Error(`Unknown error syncing user: ${String(error)}`);
        console.error(unknownError.message);
        throw unknownError;
    }
}
