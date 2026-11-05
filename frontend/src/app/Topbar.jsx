import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Menu, LogOut } from 'lucide-react';
import { authService } from '../services/authService';
import { useToast } from '../components/Toast';

export function Topbar({ onToggleSidebar }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const handleLogout = async () => {
    try {
      await authService.logout();
      showToast('Signed out successfully', 'info');
      window.location.assign('/login');
    } catch (err) {
      showToast(`Sign out failed: ${err.message}`, 'danger');
    }
  };

  const getBreadcrumb = () => {
    const path = location.pathname;
    if (path.includes('dashboard')) return 'Dashboard';
    if (path.includes('company')) return 'Company profile';
    if (path.includes('assessment')) return 'Readiness assessment';
    if (path.includes('catalog')) return 'SaaS catalogue';
    if (path.includes('recommendation')) return 'Recommendations';
    if (path.includes('risk')) return 'Risk analysis';
    if (path.includes('planner')) return 'Migration roadmap';
    if (path.includes('assistant')) return 'AI Advisor';
    if (path.includes('reports')) return 'Reports';
    if (path.includes('settings')) return 'Settings';
    return 'Workspace';
  };

  return (
    <header className="h-14 bg-white border-b border-[#DCE5EA] px-4 sm:px-6 flex items-center justify-between shrink-0 select-none z-10 min-w-0">
      {/* Left: Mobile Hamburger & Prototype Breadcrumb */}
      <div className="flex items-center gap-2.5 min-w-0 truncate">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-1.5 -ml-1 text-[#102B46] hover:bg-[#F4F7FA] rounded-md transition-colors"
            aria-label="Toggle navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <div className="flex items-center gap-1.5 text-xs truncate">
          <span className="text-[#718096] hidden xs:inline">Workspace</span>
          <span className="text-[#718096] hidden xs:inline">/</span>
          <span className="font-semibold text-[#102B46] truncate">{getBreadcrumb()}</span>
        </div>
      </div>

      {/* Right controls: Demo workspace pill & User Avatar */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-[#F4F7FA] text-[#718096] border border-[#DCE5EA]">
          Demo workspace
        </span>

        <button
          onClick={() => navigate('/settings')}
          className="w-7 h-7 rounded-full bg-[#247C78]/15 border border-[#247C78]/30 text-[#247C78] text-[11px] font-bold flex items-center justify-center hover:opacity-80 transition-opacity shrink-0"
          title="Account profile"
        >
          AM
        </button>

        <button
          onClick={handleLogout}
          className="text-[#718096] hover:text-red-600 transition-colors p-1"
          title="Sign out"
        >
          <LogOut className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
}
