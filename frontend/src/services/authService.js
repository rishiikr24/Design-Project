import usersData from '../data/users.json';

const CURRENT_USER_KEY = 'saas_current_user';
const DEFAULT_USER = usersData[0]; // Rishi Kumar (Admin)

export const authService = {
  async getCurrentUser() {
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
    const match = usersData.find(u => u.role === newRole) || {
      ...DEFAULT_USER,
      role: newRole,
      fullName: `User (${newRole})`
    };
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(match));
    return match;
  },

  async login(email) {
    const match = usersData.find(u => u.email.toLowerCase() === (email || '').toLowerCase()) || DEFAULT_USER;
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(match));
    return match;
  },

  async logout() {
    localStorage.removeItem(CURRENT_USER_KEY);
    return true;
  }
};

