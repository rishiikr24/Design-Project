import { useState, useEffect } from 'react';
import { Building2, Users, Edit3, Plus, UserPlus, Check, X, FileText, ChevronRight, Activity } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { Modal } from '../../components/Modal';
import { companyService } from '../../services/companyService';
import { authService } from '../../services/authService';
import { formatCurrency } from '../../lib/utils';
import { useToast } from '../../components/Toast';

export function CompanyPage() {
  const [data, setData] = useState({ companies: [], users: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  
  // Modals & Active Selections
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [companyAssessments, setCompanyAssessments] = useState([]);
  const [isCreateCompanyModalOpen, setIsCreateCompanyModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const { showToast } = useToast();

  const [newCompanyForm, setNewCompanyForm] = useState({
    name: '',
    industry: 'Technology & Cloud',
    employees: 250,
    itBudget: 750000,
    region: 'North America'
  });

  const [inviteForm, setInviteForm] = useState({
    fullName: '',
    email: '',
    company_ID: 'comp-apex-global'
  });

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await companyService.getCompanies();
      setData(res);
      const user = await authService.getCurrentUser();
      setCurrentUser(user);

      if (res.companies && res.companies.length > 0) {
        const primary = res.companies[0];
        setSelectedCompany(primary);
        const history = await companyService.getCompanyAssessments(primary.ID || primary.id);
        setCompanyAssessments(history);
      }
    } catch (err) {
      setError(err.message || 'Error loading tenant profiles');
      showToast(`Error loading organization data: ${err.message}`, 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const handleUserChanged = (e) => {
      if (e.detail) setCurrentUser(e.detail);
    };
    window.addEventListener('saas:user_changed', handleUserChanged);
    return () => window.removeEventListener('saas:user_changed', handleUserChanged);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSelectCompany = async (company) => {
    setSelectedCompany(company);
    try {
      const history = await companyService.getCompanyAssessments(company.ID || company.id);
      setCompanyAssessments(history);
    } catch {
      setCompanyAssessments([]);
    }
  };

  const handleOpenEditCompany = (company, e) => {
    if (e) e.stopPropagation();
    setEditingCompany({ ...company });
  };

  const handleSaveCompany = async (e) => {
    e.preventDefault();
    if (!editingCompany) return;
    try {
      await companyService.updateCompany(editingCompany.ID || editingCompany.id, editingCompany);
      showToast(`Updated organization ${editingCompany.name}`, 'success');
      setEditingCompany(null);
      loadData();
    } catch (err) {
      showToast(`Error updating company: ${err.message}`, 'danger');
    }
  };

  const handleCreateCompany = async (e) => {
    e.preventDefault();
    if (!newCompanyForm.name.trim()) {
      showToast('Please provide a company name', 'warning');
      return;
    }
    try {
      const created = await companyService.createCompany(newCompanyForm);
      showToast(`Created organization ${created.name}`, 'success');
      setIsCreateCompanyModalOpen(false);
      setNewCompanyForm({
        name: '',
        industry: 'Technology & Cloud',
        employees: 250,
        itBudget: 750000,
        region: 'North America'
      });
      loadData();
    } catch (err) {
      showToast(`Failed to create company: ${err.message}`, 'danger');
    }
  };

  const handleInviteUser = async (e) => {
    e.preventDefault();
    if (!inviteForm.fullName.trim() || !inviteForm.email.trim()) {
      showToast('Please fill in user details', 'warning');
      return;
    }
    try {
      await authService.addUser(inviteForm);
      showToast(`Associated ${inviteForm.fullName} with company`, 'success');
      setIsInviteModalOpen(false);
      setInviteForm({ fullName: '', email: '', company_ID: selectedCompany?.ID || 'comp-apex-global' });
      loadData();
    } catch (err) {
      showToast(`Failed to associate user: ${err.message}`, 'danger');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#247C78]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto my-16 p-6 rounded-2xl bg-white border border-red-200 text-center space-y-4 shadow-sm">
        <h3 className="text-base font-bold text-[#102B46]">Error Loading Organizations</h3>
        <p className="text-xs text-red-600">{error}</p>
        <Button variant="primary" size="sm" onClick={loadData}>
          Retry
        </Button>
      </div>
    );
  }

  const activeCompanyUsers = data.users.filter(
    u => u.company_ID === (selectedCompany?.ID || selectedCompany?.id) ||
         u.company_id === (selectedCompany?.ID || selectedCompany?.id)
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Page Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#DCE5EA]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <h2 className="text-2xl font-bold text-[#102B46] tracking-tight">Organization Management</h2>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#247C78]/10 text-[#247C78] border border-[#247C78]/20">
              Module 1
            </span>
          </div>
          <p className="text-sm text-[#718096]">
            Manage enterprise information, company details and connected users.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Button variant="outline" size="sm" onClick={() => setIsCreateCompanyModalOpen(true)}>
            <Plus className="w-3.5 h-3.5 mr-1 text-[#247C78]" />
            <span>Create Company</span>
          </Button>
          <Button variant="primary" size="sm" onClick={() => setIsInviteModalOpen(true)}>
            <UserPlus className="w-3.5 h-3.5 mr-1" />
            <span>Associate User</span>
          </Button>
        </div>
      </div>

      {/* Main Grid: Companies (Left) and Details & History (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Registered Organizations List */}
        <div className="space-y-4 lg:col-span-1">
          <h3 className="text-sm font-bold text-[#102B46] tracking-tight flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-[#247C78]" />
              Enterprise Companies
            </span>
            <span className="text-xs text-[#718096] font-normal">{data.companies.length} Registered</span>
          </h3>

          <div className="space-y-3">
            {data.companies.map((c) => {
              const isSelected = (selectedCompany?.ID || selectedCompany?.id) === (c.ID || c.id);
              return (
                <div
                  key={c.ID || c.id}
                  onClick={() => handleSelectCompany(c)}
                  className={`p-4 rounded-2xl border transition cursor-pointer text-left ${
                    isSelected
                      ? 'bg-white border-[#247C78] shadow-sm ring-2 ring-[#247C78]/20'
                      : 'bg-white border-[#DCE5EA] hover:border-[#247C78]/40 shadow-2xs'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#F4F7FA] text-[#247C78] border border-[#DCE5EA]">
                        {c.industry}
                      </span>
                      <h4 className="mt-1.5 text-base font-bold text-[#102B46]">{c.name}</h4>
                      <p className="text-xs text-[#718096] mt-0.5">{c.region}</p>
                    </div>
                    <button
                      onClick={(e) => handleOpenEditCompany(c, e)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-[#247C78] hover:bg-[#F4F7FA] transition"
                      title="Edit Company Details"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="mt-3 pt-3 border-t border-[#DCE5EA] flex justify-between text-xs text-[#263746]">
                    <div>
                      <span className="text-[10px] text-[#718096] block">Employees</span>
                      <strong className="font-semibold">{c.employees?.toLocaleString()}</strong>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-[#718096] block">Annual IT Budget</span>
                      <strong className="font-semibold text-[#247C78]">{formatCurrency(c.itBudget)}</strong>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Active Company Deep View & Assessment History */}
        <div className="space-y-6 lg:col-span-2">
          {selectedCompany && (
            <div className="bg-white border border-[#DCE5EA] rounded-2xl p-6 shadow-2xs space-y-5">
              <div className="flex items-start justify-between pb-4 border-b border-[#DCE5EA]">
                <div>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#247C78]/10 text-[#247C78] border border-[#247C78]/20">
                    {selectedCompany.industry}
                  </span>
                  <h3 className="text-xl font-bold text-[#102B46] mt-2">{selectedCompany.name}</h3>
                  <p className="text-xs text-[#718096] mt-0.5">Headquarters & Jurisdiction: <strong>{selectedCompany.region}</strong></p>
                </div>
                <Button variant="outline" size="sm" onClick={() => handleOpenEditCompany(selectedCompany)}>
                  <Edit3 className="w-3.5 h-3.5 mr-1.5" />
                  <span>Edit Details</span>
                </Button>
              </div>

              {/* 3 Metric Summary Tiles */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-[#F4F7FA] border border-[#DCE5EA]">
                  <span className="text-[11px] text-[#718096] uppercase font-bold">Total Workforce</span>
                  <div className="text-xl font-bold text-[#102B46] mt-1">{selectedCompany.employees?.toLocaleString()}</div>
                  <span className="text-[10px] text-[#718096]">Workforce headcount</span>
                </div>
                <div className="p-3.5 rounded-xl bg-[#F4F7FA] border border-[#DCE5EA]">
                  <span className="text-[11px] text-[#718096] uppercase font-bold">Annual IT Budget</span>
                  <div className="text-xl font-bold text-[#247C78] mt-1">{formatCurrency(selectedCompany.itBudget)}</div>
                  <span className="text-[10px] text-[#718096]">Annual tech allocation</span>
                </div>
                <div className="p-3.5 rounded-xl bg-[#F4F7FA] border border-[#DCE5EA]">
                  <span className="text-[11px] text-[#718096] uppercase font-bold">Budget / Employee</span>
                  <div className="text-xl font-bold text-[#102B46] mt-1">
                    ${selectedCompany.employees ? Math.round(selectedCompany.itBudget / selectedCompany.employees).toLocaleString() : 0}
                  </div>
                  <span className="text-[10px] text-[#718096]">Adoption capacity ratio</span>
                </div>
              </div>

              {/* Company Assessment History */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold text-[#102B46] uppercase tracking-wider flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-[#247C78]" />
                  <span>Readiness Assessment History</span>
                </h4>

                <div className="border border-[#DCE5EA] rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#F4F7FA] text-[#263746] font-semibold border-b border-[#DCE5EA]">
                      <tr>
                        <th className="p-3">Assessment Initiative</th>
                        <th className="p-3">TOE Score</th>
                        <th className="p-3">Status</th>
                        <th className="p-3">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#DCE5EA]">
                      {companyAssessments.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="p-4 text-center text-[#718096]">
                            No assessments logged yet for this enterprise.
                          </td>
                        </tr>
                      ) : (
                        companyAssessments.map((a) => (
                          <tr key={a.id} className="hover:bg-[#F4F7FA]/60 transition">
                            <td className="p-3 font-semibold text-[#102B46]">{a.title}</td>
                            <td className="p-3">
                              <span className="font-bold text-[#247C78] bg-[#247C78]/10 px-2.5 py-0.5 rounded-full border border-[#247C78]/20">
                                {a.readinessScore}/100
                              </span>
                            </td>
                            <td className="p-3">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 border border-emerald-300">
                                {a.status}
                              </span>
                            </td>
                            <td className="p-3 text-[#718096]">
                              {new Date(a.createdAt).toLocaleDateString()}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Connected User Accounts */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#102B46] tracking-tight flex items-center gap-1.5">
                <Users className="w-4 h-4 text-[#247C78]" />
                <span>Connected User Accounts</span>
              </h3>
              <Button variant="outline" size="sm" onClick={() => setIsInviteModalOpen(true)}>
                <UserPlus className="w-3.5 h-3.5 mr-1" />
                <span>Add User</span>
              </Button>
            </div>

            <div className="overflow-x-auto border border-[#DCE5EA] rounded-2xl bg-white shadow-2xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F4F7FA] text-[#263746] border-b border-[#DCE5EA] font-semibold">
                  <tr>
                    <th className="p-3.5">User Name</th>
                    <th className="p-3.5">Email</th>
                    <th className="p-3.5">Company Association</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DCE5EA]">
                  {data.users.map((u) => {
                    const isCurrent = currentUser?.email?.toLowerCase() === u.email?.toLowerCase();
                    return (
                      <tr key={u.ID || u.email} className={`hover:bg-[#F4F7FA]/70 transition ${isCurrent ? 'bg-[#247C78]/5' : ''}`}>
                        <td className="p-3.5">
                          <div className="font-bold text-[#102B46] flex items-center gap-1.5">
                            <span>{u.fullName || u.email}</span>
                            {isCurrent && <span className="text-[10px] text-[#247C78] font-bold">(You)</span>}
                          </div>
                        </td>
                        <td className="p-3.5 text-[#718096] font-mono text-[11px]">{u.email}</td>
                        <td className="p-3.5 text-[#263746] font-medium">
                          {u.company_ID || u.company_id || 'Apex Global Enterprises'}
                        </td>
                        <td className="p-3.5">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
                            Active
                          </span>
                        </td>
                        <td className="p-3.5 text-right">
                          <span className="text-[11px] text-[#247C78] font-medium cursor-pointer hover:underline">
                            Verified
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Create Company */}
      <Modal
        isOpen={isCreateCompanyModalOpen}
        onClose={() => setIsCreateCompanyModalOpen(false)}
        title="Create Enterprise Company"
        subtitle="Register a new enterprise tenant in NIRNAY"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleCreateCompany} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-[#263746] mb-1">Company Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Horizon Logistics Corp"
              value={newCompanyForm.name}
              onChange={(e) => setNewCompanyForm({ ...newCompanyForm, name: e.target.value })}
              className="w-full bg-white border border-[#DCE5EA] rounded-xl p-2.5 text-[#263746] focus:outline-none focus:border-[#247C78]"
            />
          </div>
          <div>
            <label className="block font-semibold text-[#263746] mb-1">Industry Sector *</label>
            <input
              type="text"
              required
              placeholder="e.g. Healthcare & Pharmaceuticals"
              value={newCompanyForm.industry}
              onChange={(e) => setNewCompanyForm({ ...newCompanyForm, industry: e.target.value })}
              className="w-full bg-white border border-[#DCE5EA] rounded-xl p-2.5 text-[#263746] focus:outline-none focus:border-[#247C78]"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#263746] mb-1">Employees *</label>
              <input
                type="number"
                min="1"
                required
                value={newCompanyForm.employees}
                onChange={(e) => setNewCompanyForm({ ...newCompanyForm, employees: Number(e.target.value) })}
                className="w-full bg-white border border-[#DCE5EA] rounded-xl p-2.5 text-[#263746] focus:outline-none focus:border-[#247C78]"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#263746] mb-1">Annual IT Budget ($) *</label>
              <input
                type="number"
                min="0"
                step="10000"
                required
                value={newCompanyForm.itBudget}
                onChange={(e) => setNewCompanyForm({ ...newCompanyForm, itBudget: Number(e.target.value) })}
                className="w-full bg-white border border-[#DCE5EA] rounded-xl p-2.5 text-[#263746] font-mono focus:outline-none focus:border-[#247C78]"
              />
            </div>
          </div>
          <div>
            <label className="block font-semibold text-[#263746] mb-1">Headquarters Region *</label>
            <select
              value={newCompanyForm.region}
              onChange={(e) => setNewCompanyForm({ ...newCompanyForm, region: e.target.value })}
              className="w-full bg-white border border-[#DCE5EA] rounded-xl p-2.5 text-[#263746] focus:outline-none focus:border-[#247C78] cursor-pointer"
            >
              <option value="North America">North America</option>
              <option value="EMEA">Europe, Middle East & Africa</option>
              <option value="Asia Pacific">Asia Pacific</option>
              <option value="Latin America">Latin America</option>
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t border-[#DCE5EA]">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsCreateCompanyModalOpen(false)}>
              <X className="w-3.5 h-3.5 mr-1" />
              <span>Cancel</span>
            </Button>
            <Button type="submit" variant="primary" size="sm">
              <Plus className="w-3.5 h-3.5 mr-1" />
              <span>Create Company</span>
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Edit Company */}
      <Modal
        isOpen={Boolean(editingCompany)}
        onClose={() => setEditingCompany(null)}
        title="Edit Organization Profile"
        subtitle={`Tenant ID: ${editingCompany?.ID || editingCompany?.id}`}
        maxWidth="max-w-md"
      >
        {editingCompany && (
          <form onSubmit={handleSaveCompany} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-[#263746] mb-1">Company Name</label>
              <input
                type="text"
                required
                value={editingCompany.name}
                onChange={(e) => setEditingCompany({ ...editingCompany, name: e.target.value })}
                className="w-full bg-white border border-[#DCE5EA] rounded-xl p-2.5 text-[#263746] focus:outline-none focus:border-[#247C78]"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#263746] mb-1">Industry Sector</label>
              <input
                type="text"
                required
                value={editingCompany.industry}
                onChange={(e) => setEditingCompany({ ...editingCompany, industry: e.target.value })}
                className="w-full bg-white border border-[#DCE5EA] rounded-xl p-2.5 text-[#263746] focus:outline-none focus:border-[#247C78]"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-[#263746] mb-1">Employees</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={editingCompany.employees}
                  onChange={(e) => setEditingCompany({ ...editingCompany, employees: Number(e.target.value) })}
                  className="w-full bg-white border border-[#DCE5EA] rounded-xl p-2.5 text-[#263746] focus:outline-none focus:border-[#247C78]"
                />
              </div>
              <div>
                <label className="block font-semibold text-[#263746] mb-1">IT Budget ($)</label>
                <input
                  type="number"
                  min="0"
                  step="10000"
                  required
                  value={editingCompany.itBudget}
                  onChange={(e) => setEditingCompany({ ...editingCompany, itBudget: Number(e.target.value) })}
                  className="w-full bg-white border border-[#DCE5EA] rounded-xl p-2.5 text-[#263746] font-mono focus:outline-none focus:border-[#247C78]"
                />
              </div>
            </div>
            <div>
              <label className="block font-semibold text-[#263746] mb-1">Headquarters Region</label>
              <select
                value={editingCompany.region}
                onChange={(e) => setEditingCompany({ ...editingCompany, region: e.target.value })}
                className="w-full bg-white border border-[#DCE5EA] rounded-xl p-2.5 text-[#263746] focus:outline-none focus:border-[#247C78] cursor-pointer"
              >
                <option value="North America">North America</option>
                <option value="EMEA">Europe, Middle East & Africa</option>
                <option value="Asia Pacific">Asia Pacific</option>
                <option value="Latin America">Latin America</option>
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t border-[#DCE5EA]">
              <Button type="button" variant="outline" size="sm" onClick={() => setEditingCompany(null)}>
                <X className="w-3.5 h-3.5 mr-1" />
                <span>Cancel</span>
              </Button>
              <Button type="submit" variant="primary" size="sm">
                <Check className="w-3.5 h-3.5 mr-1" />
                <span>Save Changes</span>
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Modal: Associate / Invite User */}
      <Modal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        title="Associate User to Company"
        subtitle="Connect an enterprise collaborator to this workspace"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleInviteUser} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-[#263746] mb-1">Full Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Alex Morgan"
              value={inviteForm.fullName}
              onChange={(e) => setInviteForm({ ...inviteForm, fullName: e.target.value })}
              className="w-full bg-white border border-[#DCE5EA] rounded-xl p-2.5 text-[#263746] focus:outline-none focus:border-[#247C78]"
            />
          </div>
          <div>
            <label className="block font-semibold text-[#263746] mb-1">Email Address *</label>
            <input
              type="email"
              required
              placeholder="alex.morgan@apexglobal.com"
              value={inviteForm.email}
              onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
              className="w-full bg-white border border-[#DCE5EA] rounded-xl p-2.5 text-[#263746] focus:outline-none focus:border-[#247C78] font-mono"
            />
          </div>
          <div>
            <label className="block font-semibold text-[#263746] mb-1">Company Association *</label>
            <select
              value={inviteForm.company_ID}
              onChange={(e) => setInviteForm({ ...inviteForm, company_ID: e.target.value })}
              className="w-full bg-white border border-[#DCE5EA] rounded-xl p-2.5 text-[#263746] focus:outline-none focus:border-[#247C78] cursor-pointer"
            >
              {data.companies.map((c) => (
                <option key={c.ID || c.id} value={c.ID || c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t border-[#DCE5EA]">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsInviteModalOpen(false)}>
              <X className="w-3.5 h-3.5 mr-1" />
              <span>Cancel</span>
            </Button>
            <Button type="submit" variant="primary" size="sm">
              <UserPlus className="w-3.5 h-3.5 mr-1" />
              <span>Associate User</span>
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
