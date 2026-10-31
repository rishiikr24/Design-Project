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

export const authService = {
  getRoles() {
    return ['Admin', 'Manager', 'Analyst', 'Viewer'];
  },

  async getUsers() {
    return getStoredUsers();
  },

  async getCurrentUser() {
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

  async switchRole(newRole) {
    const users = getStoredUsers();
    let match = users.find(u => u.role === newRole);
    if (!match) {
      match = {
        ID: `usr-${newRole.toLowerCase()}-${Date.now()}`,
        username: `${newRole.toLowerCase()}.user`,
        fullName: `${newRole} User`,
        email: `${newRole.toLowerCase()}@apexglobal.com`,
        role: newRole,
        company_ID: 'comp-apex-global'
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

  async login(email, _password) {
    const users = getStoredUsers();
    const match = users.find(u => u.email.toLowerCase() === (email || '').toLowerCase()) || users[0];
    if (typeof window !== 'undefined') {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(match));
      window.dispatchEvent(new CustomEvent('saas:role_changed', { detail: match }));
    }
    return match;
  },

  async register({ fullName, email, role = 'Analyst', company_ID = 'comp-apex-global' }) {
    const users = getStoredUsers();
    const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      throw new Error(`User with email ${email} already exists`);
    }

    const newUser = {
      ID: `usr-${Date.now()}`,
      username: email.split('@')[0],
      fullName,
      email,
      role,
      company_ID
    };

    const updatedUsers = [...users, newUser];
    saveStoredUsers(updatedUsers);

    if (typeof window !== 'undefined') {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));
      window.dispatchEvent(new CustomEvent('saas:role_changed', { detail: newUser }));
    }
    return newUser;
  },

  async addUser(userData) {
    const users = getStoredUsers();
    const newUser = {
      ID: `usr-${Date.now()}`,
      username: userData.email.split('@')[0],
      fullName: userData.fullName,
      email: userData.email,
      role: userData.role || 'Viewer',
      company_ID: userData.company_ID || 'comp-apex-global'
    };
    const updatedUsers = [...users, newUser];
    saveStoredUsers(updatedUsers);
    return newUser;
  },

  async logout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(CURRENT_USER_KEY);
      window.dispatchEvent(new CustomEvent('saas:role_changed', { detail: null }));
    }
    return true;
  }
};
