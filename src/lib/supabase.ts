import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// The SAME Supabase project as potesia.com (same env names, same default auth storage),
// so when the games are served from potesia.com/games a login there is a login here too.
const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const supabase: SupabaseClient | null = url && key ? createClient(url, key) : null;
