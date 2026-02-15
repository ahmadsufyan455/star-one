import { createClient } from '@supabase/supabase-js'

// Client-side Supabase client for browser use
export const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
