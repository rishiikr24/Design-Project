import { supabase, shouldUseMocks } from '../lib/supabase';
import initialCompanies from '../data/companies.json';
import initialUsers from '../data/users.json';
import { authService } from './authService';
import { assessmentService } from './assessmentService';

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
    let baseCompanies = getStoredCompanies();

    if (!shouldUseMocks()) {
      try {
        const { data: companiesData, error: compErr } = await supabase
          .from('companies')
          .select('*')
          .order('name');

        if (!compErr && companiesData && companiesData.length > 0) {
          const remoteList = companiesData.map(mapCompanyFromPostgres);
          // Merge local custom created companies with remote companies
          const combined = [...remoteList];
          for (const localComp of baseCompanies) {
            if (!combined.some(c => (c.id || c.ID) === (localComp.id || localComp.ID))) {
              combined.push(localComp);
            }
          }
          baseCompanies = combined;
        }
      } catch {
        // Fallback to local
      }
    }

    const users = await authService.getUsers();
    return {
      companies: baseCompanies,
      users
    };
  },

  async getCompanyById(id) {
    if (!shouldUseMocks()) {
      try {
        const { data, error } = await supabase
          .from('companies')
          .select('*')
          .eq('id', id)
          .maybeSingle();

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
    const newId = companyData.id || `comp-${Date.now()}`;
    const payload = {
      id: newId,
      name: companyData.name,
      industry: companyData.industry || 'Technology',
      employees: Number(companyData.employees) || 100,
      it_budget: Number(companyData.itBudget || companyData.it_budget) || 500000,
      region: companyData.region || 'North America'
    };

    const newComp = {
      ID: newId,
      id: newId,
      name: payload.name,
      industry: payload.industry,
      employees: payload.employees,
      itBudget: payload.it_budget,
      region: payload.region
    };

    if (!shouldUseMocks()) {
      try {
        const { data, error } = await supabase
          .from('companies')
          .insert(payload)
          .select()
          .single();

        if (!error && data) {
          return mapCompanyFromPostgres(data);
        } else if (error) {
          console.warn('[CompanyService] Supabase insert blocked by RLS, falling back to local persistence:', error.message);
          // If RLS blocked because user is not admin in Supabase auth, persist locally so user flow succeeds seamlessly
          const companies = getStoredCompanies();
          newComp._syncError = error.message;
          companies.push(newComp);
          saveStoredCompanies(companies);
          return newComp;
        }
      } catch (err) {
        console.warn('[CompanyService] Network/RLS error, saving locally:', err.message);
        newComp._syncError = err.message;
      }
    }

    const companies = getStoredCompanies();
    companies.push(newComp);
    saveStoredCompanies(companies);
    return newComp;
  },

  async updateCompany(id, updates) {
    const companies = getStoredCompanies();
    const idx = companies.findIndex(c => c.ID === id || c.id === id);
    let updatedLocal = null;

    if (idx !== -1) {
      companies[idx] = {
        ...companies[idx],
        ...updates,
        employees: updates.employees !== undefined ? Number(updates.employees) : companies[idx].employees,
        itBudget: updates.itBudget !== undefined ? Number(updates.itBudget) : companies[idx].itBudget
      };
      saveStoredCompanies(companies);
      updatedLocal = companies[idx];
    }

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

        if (error) {
          if (updatedLocal) updatedLocal._syncError = error.message;
        } else if (data) {
          return mapCompanyFromPostgres(data);
        }
      } catch (err) {
        if (updatedLocal) updatedLocal._syncError = err.message;
      }
    }

    return updatedLocal || { id, ...updates };
  },

  async deleteCompany(id) {
    if (!shouldUseMocks()) {
      try {
        await supabase
          .from('companies')
          .delete()
          .eq('id', id);
      } catch {
        // Continue to local cleanup
      }
    }

    const companies = getStoredCompanies().filter(c => c.ID !== id && c.id !== id);
    saveStoredCompanies(companies);
    return { success: true };
  },

  async getCompanyAssessments(companyId) {
    return assessmentService.getAssessments(companyId);
  }
};
