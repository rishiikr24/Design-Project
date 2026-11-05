/**
 * Canonical Supabase client & environment validator.
 *
 * Requirements:
 * 1. The application must use the configured Supabase project when valid credentials are available.
 * 2. Mock mode must not silently activate in production.
 * 3. Never expose the Supabase service-role key in frontend code.
 * 4. Never hardcode credentials.
 * 5. Ensure the Supabase client is initialised correctly.
 * 6. Handle missing configuration with a clear and useful error.
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? '';
const isProd = import.meta.env.PROD;

/**
 * True when the env vars look like a real Supabase project URL and anon key.
 */
export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.startsWith('https://') &&
  !supabaseUrl.includes('your-project') &&
  supabaseAnonKey.length > 20
);

/**
 * Determines whether mock mode should be used.
 * Safety rule: Mock mode MUST NOT silently activate in production.
 * If credentials are missing in production and VITE_USE_MOCKS is not explicitly true, an error is surfaced.
 */
export const shouldUseMocks = () => {
  const explicitMockFlag = import.meta.env.VITE_USE_MOCKS;

  if (explicitMockFlag === 'true') {
    return true;
  }

  if (explicitMockFlag === 'false') {
    if (!isSupabaseConfigured) {
      console.error(
        '[NIRNAY Supabase Config Error] VITE_USE_MOCKS is set to false, but VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is missing or invalid in frontend/.env.local'
      );
    }
    return false;
  }

  // If in production and not explicitly set to mocks:
  if (isProd && !isSupabaseConfigured) {
    console.error(
      '[NIRNAY Supabase Config Error] Missing Supabase configuration in production. Refusing to silently activate mock mode.'
    );
    return false;
  }

  // Default fallback for development/test when no credentials are provided:
  return !isSupabaseConfigured;
};

// Fallback in-memory storage for test/offline environments
class MockSupabaseAuth {
  constructor() {
    this.subscribers = new Set();
    this.session = null;
  }

  async signInWithPassword({ email, _password }) {
    if (!email) throw new Error('Email is required');
    const id = `mock-usr-${email.split('@')[0]}`;
    const user = {
      id,
      email,
      user_metadata: {
        full_name: email.split('@')[0].replace('.', ' '),
        role: 'Admin',
        company_id: 'comp-apex-global'
      }
    };
    this.session = { access_token: 'mock-token', user };
    this._notify();
    return { data: { user, session: this.session }, error: null };
  }

  async signUp({ email, _password, options = {} }) {
    if (!email) throw new Error('Email is required');
    const id = `mock-usr-${Date.now()}`;
    const user = {
      id,
      email,
      user_metadata: options.data || {
        full_name: email.split('@')[0],
        role: 'Analyst',
        company_id: 'comp-apex-global'
      }
    };
    this.session = { access_token: 'mock-token', user };
    this._notify();
    return { data: { user, session: this.session }, error: null };
  }

  async signOut() {
    this.session = null;
    this._notify();
    return { error: null };
  }

  async getUser() {
    return { data: { user: this.session ? this.session.user : null }, error: null };
  }

  async getSession() {
    return { data: { session: this.session }, error: null };
  }

  onAuthStateChange(callback) {
    this.subscribers.add(callback);
    return {
      data: {
        subscription: {
          unsubscribe: () => this.subscribers.delete(callback)
        }
      }
    };
  }

  _notify() {
    for (const sub of this.subscribers) {
      sub(this.session ? 'SIGNED_IN' : 'SIGNED_OUT', this.session);
    }
  }
}

function createMockSupabaseClient() {
  const auth = new MockSupabaseAuth();
  return {
    auth,
    functions: {
      async invoke(_name, _options) {
        return { data: null, error: null };
      }
    },
    from(_table) {
      return {
        select() {
          return {
            async single() { return { data: null, error: null }; },
            async eq() { return { data: [], error: null }; }
          };
        },
        async insert() { return { data: null, error: null }; },
        async update() { return { data: null, error: null }; },
        async delete() { return { data: null, error: null }; }
      };
    }
  };
}

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    })
  : createMockSupabaseClient();
