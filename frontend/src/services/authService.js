import { supabase, isSupabaseConfigured } from '../lib/supabase';
import initialUsers from '../data/users.json';

const CURRENT_USER_KEY = 'saas_current_user';
const USERS_LIST_KEY = 'saas_users_list';
const DEFAULT_USER = initialUsers[0]; // Rishi Kumar (Admin)

function getStoredUsers() {
  if (typeof window === 'undefined') return initialUsers;
  const saved = localStorage.getItem(USERS_LIST_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      // fallback
    }
  }
  return initialUsers;
}

function saveStoredUsers(users) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(USERS_LIST_KEY, JSON.stringify(users));
  }
}

function normalizeUser(rawUser, metadata = {}) {
  if (!rawUser) return null;
  const meta = rawUser.user_metadata || metadata || {};
  const email = rawUser.email || meta.email || '';
  const fullName = meta.full_name || meta.fullName || rawUser.fullName || email.split('@')[0];
  const role = meta.role || rawUser.role || 'Viewer';
  const companyId = meta.company_id || meta.company_ID || rawUser.company_ID || rawUser.company_id || 'comp-apex-global';
  const id = rawUser.id || rawUser.ID || `usr-${Date.now()}`;

  return {
    ID: id,
    id,
    username: rawUser.username || email.split('@')[0],
    fullName,
    email,
    role,
    company_ID: companyId,
    company_id: companyId
  };
}

export const authService = {
  isSupabaseEnabled() {
    return isSupabaseConfigured;
  },

  getRoles() {
    return ['Admin', 'Manager', 'Analyst', 'Viewer'];
  },

  async getUsers() {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*');
        if (!error && data && data.length > 0) {
          return data.map(p => ({
            ID: p.id,
            id: p.id,
            username: p.username,
            fullName: p.full_name,
            email: p.email,
            role: p.role,
            company_ID: p.company_id
          }));
        }
      } catch {
        // Fallback to local storage if query fails
      }
    }
    return getStoredUsers();
  },

  async getCurrentUser() {
    if (isSupabaseConfigured) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          // Fetch profile details
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

          const normalized = normalizeUser(user, profile ? {
            full_name: profile.full_name,
            role: profile.role,
            company_id: profile.company_id
          } : undefined);

          if (normalized) {
            if (typeof window !== 'undefined') {
              localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(normalized));
            }
            return normalized;
          }
        }
      } catch {
        // Fallback to storage
      }
    }

    if (typeof window === 'undefined') return DEFAULT_USER;
    const saved = localStorage.getItem(CURRENT_USER_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return DEFAULT_USER;
  },

  async login(email, password) {
    if (!email) {
      throw new Error('Email is required');
    }

    if (isSupabaseConfigured && password) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      if (error) {
        throw new Error(error.message);
      }
      if (data?.user) {
        const user = normalizeUser(data.user);
        if (typeof window !== 'undefined') {
          localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
          window.dispatchEvent(new CustomEvent('saas:role_changed', { detail: user }));
        }
        return user;
      }
    }

    // Local / seed fallback
    const users = getStoredUsers();
    const match = users.find(u => u.email.toLowerCase() === (email || '').toLowerCase()) || {
      ID: `usr-${Date.now()}`,
      username: email.split('@')[0],
      fullName: email.split('@')[0],
      email,
      role: 'Admin',
      company_ID: 'comp-apex-global'
    };

    if (typeof window !== 'undefined') {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(match));
      window.dispatchEvent(new CustomEvent('saas:role_changed', { detail: match }));
    }
    return match;
  },

  async register({ fullName, email, password = 'Password123!', role = 'Analyst', company_ID = 'comp-apex-global' }) {
    if (!email) throw new Error('Email is required');

    const users = getStoredUsers();
    const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      throw new Error(`User with email ${email} already exists`);
    }

    if (isSupabaseConfigured) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role,
            company_id: company_ID
          }
        }
      });
      if (error) {
        throw new Error(error.message);
      }
      if (data?.user) {
        const newUser = normalizeUser(data.user, { full_name: fullName, role, company_id: company_ID });
        const updatedUsers = [...users, newUser];
        saveStoredUsers(updatedUsers);
        if (typeof window !== 'undefined') {
          localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));
          window.dispatchEvent(new CustomEvent('saas:role_changed', { detail: newUser }));
        }
        return newUser;
      }
    }

    const newUser = {
      ID: `usr-${Date.now()}`,
      id: `usr-${Date.now()}`,
      username: email.split('@')[0],
      fullName,
      email,
      role,
      company_ID,
      company_id: company_ID
    };

    const updatedUsers = [...users, newUser];
    saveStoredUsers(updatedUsers);

    if (typeof window !== 'undefined') {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));
      window.dispatchEvent(new CustomEvent('saas:role_changed', { detail: newUser }));
    }
    return newUser;
  },

  async switchRole(newRole) {
    const users = getStoredUsers();
    let match = users.find(u => u.role.toLowerCase() === newRole.toLowerCase());
    if (!match) {
      match = {
        ID: `usr-${newRole.toLowerCase()}-${Date.now()}`,
        id: `usr-${newRole.toLowerCase()}-${Date.now()}`,
        username: `${newRole.toLowerCase()}.user`,
        fullName: `${newRole} User`,
        email: `${newRole.toLowerCase()}@apexglobal.com`,
        role: newRole,
        company_ID: 'comp-apex-global',
        company_id: 'comp-apex-global'
      };
      users.push(match);
      saveStoredUsers(users);
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(match));
      window.dispatchEvent(new CustomEvent('saas:role_changed', { detail: match }));
    }
    return match;
  },

  async addUser(userData) {
    const users = getStoredUsers();
    const newUser = {
      ID: `usr-${Date.now()}`,
      id: `usr-${Date.now()}`,
      username: userData.email.split('@')[0],
      fullName: userData.fullName,
      email: userData.email,
      role: userData.role || 'Viewer',
      company_ID: userData.company_ID || 'comp-apex-global',
      company_id: userData.company_ID || 'comp-apex-global'
    };
    const updatedUsers = [...users, newUser];
    saveStoredUsers(updatedUsers);
    return newUser;
  },

  async logout() {
    if (isSupabaseConfigured) {
      try {
        await supabase.auth.signOut();
      } catch {
        // Continue clearing local state
      }
    }
    if (typeof window !== 'undefined') {
      localStorage.removeItem(CURRENT_USER_KEY);
      window.dispatchEvent(new CustomEvent('saas:role_changed', { detail: null }));
    }
    return true;
  },

  onAuthStateChange(callback) {
    if (isSupabaseConfigured) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        const user = session?.user ? normalizeUser(session.user) : null;
        callback(event, user);
      });
      return () => subscription.unsubscribe();
    }

    const listener = (event) => {
      callback('ROLE_CHANGED', event.detail);
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('saas:role_changed', listener);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('saas:role_changed', listener);
      }
    };
  }
};
