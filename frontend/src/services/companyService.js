import companiesData from '../data/companies.json';
import usersData from '../data/users.json';

export const companyService = {
  async getCompanies() {
    return {
      companies: companiesData,
      users: usersData
    };
  },

  async getCompanyById(id) {
    const comp = companiesData.find(c => c.ID === id);
    if (!comp) return null;
    return {
      ...comp,
      users: usersData.filter(u => u.company_ID === id)
    };
  }
};

