import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ClipboardCheck,
  Package,
  TrendingUp,
  ShieldAlert,
  Milestone,
  Bot,
  Building2
} from 'lucide-react';
import { cn } from '../lib/utils';

const navItems = [
  {
    name: 'Dashboard',
    moduleNum: 'Module 7',
    path: '/dashboard',
    icon: LayoutDashboard
  },
  {
    name: 'Enterprise Assessment',
    moduleNum: 'Module 2',
    path: '/assessment',
    icon: ClipboardCheck
  },
  {
    name: 'SaaS Catalog',
    moduleNum: 'Module 3',
    path: '/catalog',
    icon: Package
  },
  {
    name: 'Recommendations',
    moduleNum: 'Module 4',
    path: '/recommendation',
    icon: TrendingUp
  },
  {
    name: 'Risk Assessment',
    moduleNum: 'Module 5',
    path: '/risk',
    icon: ShieldAlert
  },
  {
    name: '8-Phase Roadmap',
    moduleNum: 'Module 6',
    path: '/planner',
    icon: Milestone
  },
  {
    name: 'AI Advisor',
    moduleNum: 'Module 8',
    path: '/assistant',
    icon: Bot
  },
  {
    name: 'Organization & Admin',
    moduleNum: 'Module 1',
    path: '/company',
    icon: Building2
  }
];

export function Sidebar() {
  return (
    <aside className="w-64 bg-[#102B46] border-r border-[#0B1E32] flex flex-col shrink-0 text-white shadow-xl z-20">
      {/* Brand Header */}
      <div className="p-5 border-b border-white/10 flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-[#247C78] flex items-center justify-center text-white font-extrabold text-sm shadow-md tracking-wider">
          N
        </div>
        <div>
          <span className="text-sm font-bold tracking-tight text-white block leading-none">
            NIRNAY
          </span>
          <span className="text-[10px] text-slate-300 font-medium block mt-1">
            Transformation Framework
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3.5 space-y-1 overflow-y-auto">
        <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Core Modules
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all group',
                  isActive
                    ? 'bg-[#247C78] text-white shadow-md shadow-[#247C78]/30 font-semibold'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                )
              }
            >
              <Icon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />
              <div className="flex flex-col text-left truncate">
                <span className="truncate">{item.name}</span>
                <span className="text-[10px] text-slate-400 font-normal group-hover:text-slate-200">
                  {item.moduleNum}
                </span>
              </div>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-white/10 text-[11px] text-slate-400 text-center font-medium">
        <span>Design Project-I | E1ITA306</span>
      </div>
    </aside>
  );
}
