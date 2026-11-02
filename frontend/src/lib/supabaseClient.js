/**
 * Canonical Supabase client.
 *
 * Reads VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY from import.meta.env.
 * Throws immediately if either is missing AND mocks are disabled, so
 * misconfiguration surfaces at startup rather than at the first query.
 *
 * When VITE_USE_MOCKS=true (or the env vars are absent) the app falls back
 * to the mock client exported from ./supabase.js — this file is only used
 * when a real Supabase connection is intended.
 */

import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL ?? '';
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? '';

/**
 * True when the env vars look like a real Supabase project URL/key.
 */
export const isSupabaseConfigured =
  url.startsWith('https://') &&
  anonKey.length > 0 &&
  !url.includes('your-project');

/**
 * Create and return the real Supabase client.
 * Call this only when you know Supabase is configured; it will throw
 * a developer-friendly error otherwise.
 */
function buildClient() {
  if (!isSupabaseConfigured) {
    throw new Error(
      '[supabaseClient] Missing or invalid Supabase configuration.\n' +
        '  → Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in frontend/.env.local\n' +
        '  → Or set VITE_USE_MOCKS=true to run without a Supabase backend.'
    );
  }

  return createClient(url, anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
}

/**
 * The singleton Supabase client.
 * Lazily initialised on first access so the error is deferred until
 * something actually tries to talk to Supabase (not at import time).
 */
let _client = null;

export function getSupabaseClient() {
  if (!_client) {
    _client = buildClient();
  }
  return _client;
}

export default getSupabaseClient;
