import { useState, useEffect } from 'react';
import { Building2, LogOut, User } from 'lucide-react';
import { authService } from '../services/authService';
import { companyService } from '../services/companyService';
import { shouldUseMocks } from '../lib/supabase';
import { useToast } from '../components/Toast';

export function Topbar() {
  const [currentUser, setCurrentUser] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState('comp-apex-global');
  const { showToast } = useToast();
  const isMockMode = shouldUseMocks();

  useEffect(() => {
    async function loadShellData() {
      const user = await authService.getCurrentUser();
      setCurrentUser(user);
      if (user?.company_id || user?.company_ID) {
        setSelectedCompanyId(user.company_id || user.company_ID);
      }
      const data = await companyService.getCompanies();
      setCompanies(data.companies || []);
    }
    loadShellData();

    const handleRoleChanged = (e) => {
      if (e.detail) {
        setCurrentUser(e.detail);
        if (e.detail.company_id || e.detail.company_ID) {
          setSelectedCompanyId(e.detail.company_id || e.detail.company_ID);
        }
      }
    };
    window.addEventListener('saas:role_changed', handleRoleChanged);
    return () => window.removeEventListener('saas:role_changed', handleRoleChanged);
  }, []);

  const handleCompanyChange = (e) => {
    const newCompId = e.target.value;
    setSelectedCompanyId(newCompId);
    showToast(`Organization view updated`, 'info');
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      showToast('Signed out successfully', 'info');
      window.location.assign('/login');
    } catch (err) {
      showToast(`Sign out failed: ${err.message}`, 'danger');
    }
  };

  const userCompany = companies.find(c => (c.ID || c.id) === selectedCompanyId)?.name ||
    (currentUser?.company_id || currentUser?.company_ID || 'Apex Global Enterprises');

  return (
    <header className="h-16 bg-white border-b border-[#DCE5EA] px-6 flex items-center justify-between shrink-0 shadow-sm z-10">
      {/* Title */}
      <div>
        <h1 className="text-base font-bold text-[#102B46] tracking-tight leading-none">
          NIRNAY <span className="font-normal text-slate-500 text-xs">| Enterprise Transformation Platform</span>
        </h1>
        <span className="text-[11px] text-slate-400 mt-1 block">
          Strategic Cloud Migration Decision-Support System
        </span>
      </div>

      {/* Action controls */}
      <div className="flex items-center gap-3.5">
        {/* Company Selector or Live Tenant Display */}
        {isMockMode ? (
          <div className="flex items-center gap-1.5 bg-[#F4F7FA] border border-[#DCE5EA] rounded-xl px-3 py-1.5 text-xs text-[#102B46]">
            <Building2 className="w-3.5 h-3.5 text-[#247C78]" />
            <select
              value={selectedCompanyId}
              onChange={handleCompanyChange}
              className="bg-transparent text-[#102B46] font-medium focus:outline-none cursor-pointer pr-1"
            >
              {companies.map((c) => (
                <option key={c.ID || c.id} value={c.ID || c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className="flex items-center gap-2 bg-[#F4F7FA] border border-[#DCE5EA] rounded-xl px-3 py-1.5 text-xs text-[#102B46]">
            <Building2 className="w-3.5 h-3.5 text-[#247C78]" />
            <span className="font-semibold max-w-[180px] truncate">{userCompany}</span>
          </div>
        )}

        {/* User Role Badge */}
        <div className="flex items-center gap-2 bg-[#F4F7FA] border border-[#DCE5EA] rounded-xl px-3 py-1.5 text-xs text-[#102B46]">
          <User className="w-3.5 h-3.5 text-[#247C78]" />
          <span className="text-slate-500 font-medium">Role:</span>
          <span className="font-bold text-[#247C78] uppercase">{currentUser?.role || 'Viewer'}</span>
        </div>

        {/* Sign Out Button */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#DCE5EA] text-slate-500 hover:text-red-600 hover:bg-red-50 text-xs font-semibold transition"
          title="Sign out of Nirnay"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </header>
  );
}
