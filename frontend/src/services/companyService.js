import initialCompanies from '../data/companies.json';
import initialUsers from '../data/users.json';
import { authService } from './authService';

const COMPANIES_KEY = 'saas_companies_data';

function getStoredCompanies() {
  if (typeof window === 'undefined') return initialCompanies;
  const saved = localStorage.getItem(COMPANIES_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      // fallback
    }
  }
  return initialCompanies;
}

function saveStoredCompanies(companies) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(COMPANIES_KEY, JSON.stringify(companies));
  }
}

export const companyService = {
  async getCompanies() {
    const companies = getStoredCompanies();
    const users = await authService.getUsers();
    return {
      companies,
      users: users.length > 0 ? users : initialUsers
    };
  },

  async getCompanyById(id) {
    const companies = getStoredCompanies();
    const comp = companies.find(c => c.ID === id);
    if (!comp) return null;
    const users = await authService.getUsers();
    return {
      ...comp,
      users: users.filter(u => u.company_ID === id)
    };
  },

  async updateCompany(id, updates) {
    const companies = getStoredCompanies();
    const idx = companies.findIndex(c => c.ID === id);
    if (idx === -1) {
      throw new Error(`Company with ID ${id} not found`);
    }
    const updated = {
      ...companies[idx],
      ...updates
    };
    companies[idx] = updated;
    saveStoredCompanies(companies);
    return updated;
  }
};
