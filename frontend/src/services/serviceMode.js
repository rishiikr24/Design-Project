/**
 * Service-mode resolver.
 *
 * Each service module calls `getServiceMode('catalog')` (or whatever
 * feature name) to decide whether to use the in-memory mock or the
 * real Supabase backend.
 *
 * Resolution order:
 *   1. Per-feature override:  VITE_USE_MOCKS_CATALOG=false  (highest priority)
 *   2. Global flag:           VITE_USE_MOCKS=true
 *   3. Auto-detect:           if Supabase env vars are missing → mock
 */

import { isSupabaseConfigured } from '../lib/supabaseClient';

const MODE_MOCK = 'mock';
const MODE_SUPABASE = 'supabase';

/**
 * @param {string} [feature] - optional feature name (e.g. 'catalog', 'auth')
 * @returns {'mock' | 'supabase'}
 */
export function getServiceMode(feature) {
  // 1. Per-feature override:  VITE_USE_MOCKS_CATALOG
  if (feature) {
    const perFeature =
      import.meta.env[`VITE_USE_MOCKS_${feature.toUpperCase()}`];
    if (perFeature === 'true') return MODE_MOCK;
    if (perFeature === 'false') return MODE_SUPABASE;
  }

  // 2. Global flag
  const global = import.meta.env.VITE_USE_MOCKS;
  if (global === 'true') return MODE_MOCK;
  if (global === 'false' && isSupabaseConfigured) return MODE_SUPABASE;

  // 3. Auto-detect
  return isSupabaseConfigured ? MODE_SUPABASE : MODE_MOCK;
}

/** Convenience boolean helpers */
export const useMocks = (feature) => getServiceMode(feature) === MODE_MOCK;
export const useSupabase = (feature) => getServiceMode(feature) === MODE_SUPABASE;
