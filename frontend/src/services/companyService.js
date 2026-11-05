import { supabase, shouldUseMocks } from '../lib/supabase';
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

function mapCompanyFromPostgres(row) {
  if (!row) return null;
  return {
    ID: row.id,
    id: row.id,
    name: row.name,
    industry: row.industry,
    employees: row.employees,
    itBudget: Number(row.it_budget) || 0,
    region: row.region
  };
}

export const companyService = {
  async getCompanies() {
    if (!shouldUseMocks()) {
      try {
        const { data: companiesData, error: compErr } = await supabase
          .from('companies')
          .select('*')
          .order('name');

        if (!compErr && companiesData && companiesData.length > 0) {
          const users = await authService.getUsers();
          return {
            companies: companiesData.map(mapCompanyFromPostgres),
            users: users.length > 0 ? users : initialUsers
          };
        }
      } catch {
        // Fallback to mock data if network/query fails
      }
    }

    const companies = getStoredCompanies();
    const users = await authService.getUsers();
    return {
      companies,
      users: users.length > 0 ? users : initialUsers
    };
  },

  async getCompanyById(id) {
    if (!shouldUseMocks()) {
      try {
        const { data, error } = await supabase
          .from('companies').select('*').eq('id', id).maybeSingle();

        if (!error && data) {
          const users = await authService.getUsers();
          return {
            ...mapCompanyFromPostgres(data),
            users: users.filter(u => u.company_ID === id || u.company_id === id)
          };
        }
      } catch {
        // Fallback to local
      }
    }

    const companies = getStoredCompanies();
    const comp = companies.find(c => c.ID === id || c.id === id);
    if (!comp) return null;
    const users = await authService.getUsers();
    return {
      ...comp,
      users: users.filter(u => u.company_ID === id || u.company_id === id)
    };
  },

  async createCompany(companyData) {
    if (!shouldUseMocks()) {
      const payload = {
        name: companyData.name,
        industry: companyData.industry || 'Technology',
        employees: Number(companyData.employees) || 100,
        it_budget: Number(companyData.itBudget || companyData.it_budget) || 500000,
        region: companyData.region || 'North America'
      };
      if (companyData.id) payload.id = companyData.id;

      const { data, error } = await supabase
        .from('companies')
        .insert(payload)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }
      return mapCompanyFromPostgres(data);
    }

    const companies = getStoredCompanies();
    const newComp = {
      ID: companyData.id || `comp-${Date.now()}`,
      id: companyData.id || `comp-${Date.now()}`,
      name: companyData.name,
      industry: companyData.industry || 'Technology',
      employees: Number(companyData.employees) || 100,
      itBudget: Number(companyData.itBudget || companyData.it_budget) || 500000,
      region: companyData.region || 'North America'
    };
    companies.push(newComp);
    saveStoredCompanies(companies);
    return newComp;
  },

  async updateCompany(id, updates) {
    if (!shouldUseMocks()) {
      try {
        const payload = {};
        if (updates.name !== undefined) payload.name = updates.name;
        if (updates.industry !== undefined) payload.industry = updates.industry;
        if (updates.employees !== undefined) payload.employees = Number(updates.employees);
        if (updates.itBudget !== undefined) payload.it_budget = Number(updates.itBudget);
        if (updates.region !== undefined) payload.region = updates.region;

        const { data, error } = await supabase
          .from('companies')
          .update(payload)
          .eq('id', id)
          .select()
          .single();

        if (!error && data) {
          return mapCompanyFromPostgres(data);
        }
      } catch {
        // Fallback to local update
      }
    }

    const companies = getStoredCompanies();
    const idx = companies.findIndex(c => c.ID === id || c.id === id);
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
