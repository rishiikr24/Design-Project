import { useState, useEffect } from 'react';
import { Sparkles, Building2 } from 'lucide-react';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { authService } from '../services/authService';
import { companyService } from '../services/companyService';
import { dashboardService } from '../services/dashboardService';
import { useToast } from '../components/Toast';

export function Topbar() {
  const [currentUser, setCurrentUser] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState('comp-apex-global');
  const [isSeeding, setIsSeeding] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    async function loadShellData() {
      const user = await authService.getCurrentUser();
      setCurrentUser(user);
      const data = await companyService.getCompanies();
      setCompanies(data.companies || []);
    }
    loadShellData();
  }, []);

  const handleRoleChange = async (e) => {
    const newRole = e.target.value;
    const updated = await authService.switchRole(newRole);
    setCurrentUser(updated);
    showToast(`Active role switched to: ${newRole}`, 'info');
  };

  const handleCompanyChange = (e) => {
    const id = e.target.value;
    setSelectedCompanyId(id);
    const comp = companies.find((c) => c.ID === id);
    showToast(`Switched active tenant to: ${comp ? comp.name : id}`, 'info');
  };

  const handleSeedReferenceCase = async () => {
    setIsSeeding(true);
    try {
      const result = await dashboardService.seedReferenceCase();
      showToast(result.message || 'Reference Case Loaded (1,000 users, on-prem ERP, High Security)', 'success');
      window.dispatchEvent(new CustomEvent('saas:data_refreshed'));
    } catch (err) {
      showToast(`Error seeding reference: ${err.message}`, 'danger');
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <header className="h-16 bg-slate-900/90 border-b border-slate-800 px-5 flex items-center justify-between shrink-0 backdrop-blur-md">
      {/* Brand logo & title */}
      <div className="flex items-center gap-3.5">
        <div className="w-10 h-7 bg-blue-600 rounded flex items-center justify-center font-black text-white text-xs tracking-wider shadow-md shadow-blue-900/50">
          SAP
        </div>
        <div>
          <h1 className="text-sm font-bold text-white tracking-tight leading-none">
            Enterprise SaaS Transformation Platform
          </h1>
          <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">
            React + Tailwind + Supabase Architecture | Decision-Support
          </span>
        </div>
      </div>

      {/* Action controls */}
      <div className="flex items-center gap-3">
        {/* 1-Click Load Reference Case */}
        <Button
          variant="outlineCyan"
          size="sm"
          onClick={handleSeedReferenceCase}
          disabled={isSeeding}
          title="Load 1,000-employee on-premise reference case"
        >
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>{isSeeding ? 'Seeding...' : 'Load Reference Case'}</span>
        </Button>

        {/* Company Selector */}
        <div className="flex items-center gap-1.5 bg-slate-800/80 border border-slate-700 rounded-lg px-2.5 py-1 text-xs">
          <Building2 className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={selectedCompanyId}
            onChange={handleCompanyChange}
            className="bg-transparent text-slate-200 focus:outline-none cursor-pointer pr-1"
          >
            {companies.map((c) => (
              <option key={c.ID} value={c.ID} className="bg-slate-900 text-slate-200">
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Role Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-800/80 border border-slate-700 rounded-lg px-2.5 py-1 text-xs">
          <Badge
            variant={
              currentUser?.role === 'Admin'
                ? 'primary'
                : currentUser?.role === 'Manager'
                ? 'cyan'
                : currentUser?.role === 'Analyst'
                ? 'purple'
                : 'default'
            }
          >
            {currentUser?.role || 'Admin'}
          </Badge>
          <select
            value={currentUser?.role || 'Admin'}
            onChange={handleRoleChange}
            className="bg-transparent text-slate-200 focus:outline-none cursor-pointer"
          >
            <option value="Admin" className="bg-slate-900 text-slate-200">Role: Admin</option>
            <option value="Manager" className="bg-slate-900 text-slate-200">Role: Manager</option>
            <option value="Analyst" className="bg-slate-900 text-slate-200">Role: Analyst</option>
            <option value="Viewer" className="bg-slate-900 text-slate-200">Role: Viewer (Read-only)</option>
          </select>
        </div>

        {/* User profile avatar */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-800" title={currentUser?.email || ''}>
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white text-xs font-bold shadow-md">
            {currentUser?.fullName?.split(' ').map((n) => n[0]).slice(0, 2).join('') || 'RK'}
          </div>
        </div>
      </div>
    </header>
  );
}
