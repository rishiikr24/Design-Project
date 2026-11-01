import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes('your-project') &&
  supabaseUrl.startsWith('http')
);

export const shouldUseMocks = () => {
  if (import.meta.env.VITE_USE_MOCKS === 'true') return true;
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
