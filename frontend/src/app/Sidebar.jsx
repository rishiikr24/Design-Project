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
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0">
      <div className="p-4 border-b border-slate-800">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
          Core Transformation Modules
        </span>
      </div>

      <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
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
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/30 font-semibold'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/80'
                )
              }
            >
              <Icon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />
              <div className="flex flex-col text-left truncate">
                <span className="truncate">{item.name}</span>
                <span className="text-[10px] text-slate-400 font-normal">
                  {item.moduleNum}
                </span>
              </div>
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800 text-[11px] text-slate-400 text-center">
        <span>Design Project-I | E1ITA306</span>
      </div>
    </aside>
  );
}
