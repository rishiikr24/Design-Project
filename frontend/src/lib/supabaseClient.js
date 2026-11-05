/**
 * Canonical Supabase client.
 *
 * Reads VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY from import.meta.env.
 * Throws immediately if either is missing AND mocks are disabled, so
 * misconfiguration surfaces at startup rather than at the first query.
 */

import { supabase, isSupabaseConfigured } from './supabase';

export { isSupabaseConfigured };

export function getSupabaseClient() {
  if (!isSupabaseConfigured) {
    throw new Error(
      '[NIRNAY Supabase Config Error] Missing or invalid Supabase configuration.\n' +
        '  → Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in frontend/.env.local\n' +
        '  → Or set VITE_USE_MOCKS=true for local offline testing.'
    );
  }
  return supabase;
}

export default getSupabaseClient;
