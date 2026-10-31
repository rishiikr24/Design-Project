import { useState, useEffect } from 'react';
import { Building2, Users, Edit3, UserPlus, Shield, Check, X } from 'lucide-react';
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
  const [currentUser, setCurrentUser] = useState(null);
  const [editingCompany, setEditingCompany] = useState(null);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const { showToast } = useToast();

  const [inviteForm, setInviteForm] = useState({
    fullName: '',
    email: '',
    role: 'Viewer',
    company_ID: 'comp-apex-global'
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await companyService.getCompanies();
      setData(res);
      const user = await authService.getCurrentUser();
      setCurrentUser(user);
    } catch (err) {
      showToast(`Error loading tenant profiles: ${err.message}`, 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const handleRoleChanged = (e) => {
      if (e.detail) setCurrentUser(e.detail);
    };
    window.addEventListener('saas:role_changed', handleRoleChanged);
    return () => window.removeEventListener('saas:role_changed', handleRoleChanged);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleImpersonate = async (role) => {
    try {
      const updated = await authService.switchRole(role);
      setCurrentUser(updated);
      showToast(`Switched active profile role to: ${role}`, 'info');
    } catch (err) {
      showToast(`Role switch failed: ${err.message}`, 'danger');
    }
  };

  const handleOpenEditCompany = (company) => {
    setEditingCompany({ ...company });
  };

  const handleSaveCompany = async (e) => {
    e.preventDefault();
    if (!editingCompany) return;
    try {
      await companyService.updateCompany(editingCompany.ID, editingCompany);
      showToast(`Updated organization ${editingCompany.name}`, 'success');
      setEditingCompany(null);
      loadData();
    } catch (err) {
      showToast(`Error updating company: ${err.message}`, 'danger');
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
      showToast(`Added ${inviteForm.fullName} (${inviteForm.role})`, 'success');
      setIsInviteModalOpen(false);
      setInviteForm({ fullName: '', email: '', role: 'Viewer', company_ID: 'comp-apex-global' });
      loadData();
    } catch (err) {
      showToast(`Failed to add user: ${err.message}`, 'danger');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Notice Banner */}
      <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <Badge variant="warning">New, not ported</Badge>
          <span className="text-amber-200">
            <strong>Module 1: User & Admin Management:</strong> The legacy repo only had a simulated role switcher in the shell bar. This complete tenant & user profile administration interface is newly constructed with a mocked data service.
          </span>
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Organization & User Profile Management</h2>
          <p className="text-xs text-slate-400 mt-1">
            Multi-tenant enterprise metadata and role-based access control (RBAC). Current active session: <strong className="text-blue-400 font-mono">{currentUser?.fullName} [{currentUser?.role}]</strong>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outlineCyan" size="sm" onClick={() => setIsInviteModalOpen(true)}>
            <UserPlus className="w-3.5 h-3.5" />
            <span>Invite / Add User</span>
          </Button>
        </div>
      </div>

      {/* Organizations Grid */}
      <div className="space-y-3">
        <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
          <Building2 className="w-4 h-4 text-blue-400" />
          <span>Registered Tenant Organizations</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.companies.map((c) => (
            <Card key={c.ID} className="border-slate-700/80">
              <CardHeader className="pb-3">
                <div>
                  <Badge variant="cyan">{c.industry}</Badge>
                  <CardTitle className="mt-2 text-lg">{c.name}</CardTitle>
                  <CardDescription>Region: {c.region}</CardDescription>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400 block">IT Budget</span>
                  <span className="text-sm font-bold text-emerald-400">{formatCurrency(c.itBudget)}</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-xs text-slate-300">
                <div className="flex justify-between p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  <span>Workforce Access Headcount:</span>
                  <strong className="text-white">{c.employees.toLocaleString()} Employees</strong>
                </div>
                <div className="flex justify-between p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  <span>Annual IT Budget Per Employee:</span>
                  <strong className="text-blue-400">${Math.round(c.itBudget / c.employees).toLocaleString()}/emp</strong>
                </div>
              </CardContent>
              <CardFooter className="pt-2 flex justify-end">
                <Button variant="outline" size="sm" onClick={() => handleOpenEditCompany(c)}>
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Profile</span>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>

      {/* User Profiles & RBAC */}
      <div className="space-y-3 pt-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <Users className="w-4 h-4 text-cyan-400" />
            <span>User Profiles & Role-Based Permissions (RBAC)</span>
          </h3>
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <span>Quick switch role:</span>
            {['Admin', 'Manager', 'Analyst', 'Viewer'].map((r) => (
              <button
                key={r}
                onClick={() => handleImpersonate(r)}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold transition ${
                  currentUser?.role === r
                    ? 'bg-blue-600 text-white ring-1 ring-blue-400'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto border border-slate-800 rounded-xl bg-slate-900/60">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800/80 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-3">User</th>
                <th className="p-3">Assigned Role</th>
                <th className="p-3">Role Capabilities / Permissions</th>
                <th className="p-3">Tenant</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {data.users.map((u) => {
                const isCurrent = currentUser?.email?.toLowerCase() === u.email.toLowerCase() || currentUser?.role === u.role;
                return (
                  <tr key={u.ID || u.email} className={`hover:bg-slate-800/40 ${isCurrent ? 'bg-blue-950/20' : ''}`}>
                    <td className="p-3">
                      <div className="font-semibold text-white flex items-center gap-1.5">
                        <span>{u.fullName}</span>
                        {isCurrent && <span className="text-[10px] text-emerald-400 font-bold">(Active)</span>}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">{u.email}</div>
                    </td>
                    <td className="p-3">
                      <Badge
                        variant={
                          u.role === 'Admin'
                            ? 'danger'
                            : u.role === 'Manager'
                            ? 'warning'
                            : u.role === 'Analyst'
                            ? 'primary'
                            : 'neutral'
                        }
                      >
                        {u.role}
                      </Badge>
                    </td>
                    <td className="p-3 text-slate-300">
                      {u.role === 'Admin' && <span className="text-red-300">Full platform control, Add SaaS products, User management</span>}
                      {u.role === 'Manager' && <span className="text-amber-300">Assessment CRUD, Evaluation run, Roadmap progress updates</span>}
                      {u.role === 'Analyst' && <span className="text-blue-300">View assessments, Run sensitivity simulations, Transformation AI</span>}
                      {u.role === 'Viewer' && <span className="text-slate-400">Read-only platform inspection (mutations blocked)</span>}
                    </td>
                    <td className="p-3 text-slate-400 font-mono text-[11px]">
                      {u.company_ID}
                    </td>
                    <td className="p-3 text-right">
                      <Button
                        variant={isCurrent ? 'ghost' : 'outline'}
                        size="sm"
                        onClick={() => handleImpersonate(u.role)}
                        disabled={isCurrent}
                      >
                        {isCurrent ? 'Current' : 'Switch Role'}
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Edit Company */}
      <Modal
        isOpen={Boolean(editingCompany)}
        onClose={() => setEditingCompany(null)}
        title="Edit Organization Profile"
        subtitle={`Tenant ID: ${editingCompany?.ID}`}
        maxWidth="max-w-md"
      >
        {editingCompany && (
          <form onSubmit={handleSaveCompany} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Company Name</label>
              <input
                type="text"
                required
                value={editingCompany.name}
                onChange={(e) => setEditingCompany({ ...editingCompany, name: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Industry Sector</label>
              <select
                value={editingCompany.industry}
                onChange={(e) => setEditingCompany({ ...editingCompany, industry: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
              >
                <option value="Manufacturing & Logistics">Manufacturing & Logistics</option>
                <option value="Financial Technology">Financial Technology</option>
                <option value="Healthcare & Life Sciences">Healthcare & Life Sciences</option>
                <option value="Retail & Consumer Goods">Retail & Consumer Goods</option>
                <option value="Energy & Utilities">Energy & Utilities</option>
                <option value="Public Sector">Public Sector</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Total Employees</label>
                <input
                  type="number"
                  min="10"
                  required
                  value={editingCompany.employees}
                  onChange={(e) => setEditingCompany({ ...editingCompany, employees: Number(e.target.value) })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Annual IT Budget ($)</label>
                <input
                  type="number"
                  min="10000"
                  step="10000"
                  required
                  value={editingCompany.itBudget}
                  onChange={(e) => setEditingCompany({ ...editingCompany, itBudget: Number(e.target.value) })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Region</label>
              <select
                value={editingCompany.region}
                onChange={(e) => setEditingCompany({ ...editingCompany, region: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
              >
                <option value="North America">North America</option>
                <option value="EMEA">EMEA</option>
                <option value="Asia Pacific">Asia Pacific</option>
                <option value="Latin America">Latin America</option>
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <Button type="button" variant="outline" size="sm" onClick={() => setEditingCompany(null)}>
                <X className="w-3.5 h-3.5" />
                <span>Cancel</span>
              </Button>
              <Button type="submit" variant="primary" size="sm">
                <Check className="w-3.5 h-3.5" />
                <span>Save Profile</span>
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Modal: Invite User */}
      <Modal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        title="Invite New User Profile"
        subtitle="Provision a team member with role-based permissions"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleInviteUser} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Full Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Elena Rostova"
              value={inviteForm.fullName}
              onChange={(e) => setInviteForm({ ...inviteForm, fullName: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Email Address *</label>
            <input
              type="email"
              required
              placeholder="elena.rostova@apexglobal.com"
              value={inviteForm.email}
              onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Assigned Role *</label>
              <select
                value={inviteForm.role}
                onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
              >
                <option value="Admin">Admin (Full Control)</option>
                <option value="Manager">Manager (CRUD)</option>
                <option value="Analyst">Analyst (Simulations)</option>
                <option value="Viewer">Viewer (Read-only)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Organization *</label>
              <select
                value={inviteForm.company_ID}
                onChange={(e) => setInviteForm({ ...inviteForm, company_ID: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
              >
                <option value="comp-apex-global">Apex Global Enterprises</option>
                <option value="comp-novasystems">Nova Systems Corp</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsInviteModalOpen(false)}>
              <X className="w-3.5 h-3.5" />
              <span>Cancel</span>
            </Button>
            <Button type="submit" variant="primary" size="sm">
              <Shield className="w-3.5 h-3.5" />
              <span>Add User</span>
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
