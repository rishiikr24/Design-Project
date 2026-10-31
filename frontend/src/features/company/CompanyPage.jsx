import { useState, useEffect } from 'react';
import { Building2, Users } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { companyService } from '../../services/companyService';
import { authService } from '../../services/authService';
import { formatCurrency } from '../../lib/utils';
import { useToast } from '../../components/Toast';

export function CompanyPage() {
  const [data, setData] = useState({ companies: [], users: [] });
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const { showToast } = useToast();

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleImpersonate = async (role) => {
    const updated = await authService.switchRole(role);
    setCurrentUser(updated);
    showToast(`Switched active profile role to: ${role}`, 'info');
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
      {/* Header */}
      <div className="pb-2 border-b border-slate-800">
        <h2 className="text-xl font-bold text-white tracking-tight">Organization & User Profile Management</h2>
        <p className="text-xs text-slate-400 mt-1">
          Module 1: Multi-tenant organizational profiles, enterprise metadata, and role-based access control (RBAC).
        </p>
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
              <CardContent className="text-xs text-slate-300">
                <div className="flex justify-between p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  <span>Workforce Access Headcount:</span>
                  <strong className="text-white">{c.employees.toLocaleString()} Employees</strong>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* User Profiles & RBAC */}
      <div className="space-y-3 pt-4">
        <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
          <Users className="w-4 h-4 text-cyan-400" />
          <span>User Profiles & Role-Based Permissions (RBAC)</span>
        </h3>

        <div className="overflow-x-auto border border-slate-800 rounded-xl bg-slate-900/60">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800/80 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-3">User</th>
                <th className="p-3">Email Address</th>
                <th className="p-3">Organization</th>
                <th className="p-3">System Role</th>
                <th className="p-3 text-right">Switch Active Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {data.users.map((u) => {
                const isCurrent = currentUser?.email === u.email;
                return (
                  <tr key={u.ID} className={`hover:bg-slate-800/40 ${isCurrent ? 'bg-blue-950/20' : ''}`}>
                    <td className="p-3 font-semibold text-white flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-[10px] text-white font-bold">
                        {u.fullName[0]}
                      </div>
                      <span>{u.fullName}</span>
                      {isCurrent && <Badge variant="primary">Active</Badge>}
                    </td>
                    <td className="p-3 text-slate-300 font-mono">{u.email}</td>
                    <td className="p-3 text-slate-400">{u.company_ID}</td>
                    <td className="p-3">
                      <Badge
                        variant={
                          u.role === 'Admin' ? 'primary' :
                          u.role === 'Manager' ? 'cyan' :
                          u.role === 'Analyst' ? 'purple' : 'default'
                        }
                      >
                        {u.role}
                      </Badge>
                    </td>
                    <td className="p-3 text-right">
                      <Button
                        variant={isCurrent ? 'outline' : 'ghost'}
                        size="sm"
                        disabled={isCurrent}
                        onClick={() => handleImpersonate(u.role)}
                      >
                        {isCurrent ? 'Current' : 'Select'}
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
