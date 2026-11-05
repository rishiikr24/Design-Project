import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  ClipboardCheck,
  Package,
  Layers,
  Award,
  ShieldAlert,
  Milestone,
  FileText,
  Settings,
  Bot,
  X
} from 'lucide-react';
import { cn } from '../lib/utils';

const navSections = [
  {
    title: 'WORKSPACE',
    items: [
      { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
      { name: 'Company profile', path: '/company', icon: Building2 },
      { name: 'Readiness assessment', path: '/assessment', icon: ClipboardCheck },
      { name: 'AI Advisor', path: '/assistant', icon: Bot }
    ]
  },
  {
    title: 'EVALUATE',
    items: [
      { name: 'SaaS catalogue', path: '/catalog', icon: Package },
      { name: 'Compare solutions', path: '/catalog?tab=compare', icon: Layers },
      { name: 'Recommendations', path: '/recommendation', icon: Award }
    ]
  },
  {
    title: 'TRANSFORM',
    items: [
      { name: 'Risk analysis', path: '/risk', icon: ShieldAlert },
      { name: 'Migration roadmap', path: '/planner', icon: Milestone }
    ]
  },
  {
    title: 'INSIGHTS',
    items: [
      { name: 'Reports', path: '/reports', icon: FileText },
      { name: 'Settings', path: '/settings', icon: Settings }
    ]
  }
];

export function Sidebar({ onClose }) {
  return (
    <aside className="w-64 h-full bg-[#102B46] border-r border-[#0B1E32] flex flex-col shrink-0 text-white select-none shadow-xl lg:shadow-none">
      {/* Top Header Card in Sidebar */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#247C78] flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-sm">
            E
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold text-white tracking-tight leading-tight">
              Enterprise SaaS
            </div>
            <div className="text-[10px] text-slate-300 font-normal leading-tight">
              Transformation workspace
            </div>
          </div>
        </div>

        {/* Mobile close button */}
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden text-slate-400 hover:text-white p-1 rounded-md"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation Sections */}
      <nav className="flex-1 p-3 space-y-4 overflow-y-auto">
        {navSections.map((section) => (
          <div key={section.title} className="space-y-1">
            <div className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              {section.title}
            </div>
            {section.items.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  onClick={() => {
                    if (onClose) onClose();
                  }}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all group',
                      isActive
                        ? 'bg-[#18395B] text-white font-semibold'
                        : 'text-slate-300 hover:text-white hover:bg-white/5'
                    )
                  }
                >
                  <Icon className="w-4 h-4 shrink-0 text-slate-300 group-hover:text-white" />
                  <span className="truncate">{item.name}</span>
                </NavLink>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User profile footer at bottom of sidebar matching prototype */}
      <div className="p-3 border-t border-white/10 flex items-center justify-between text-xs bg-[#0C2237]">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-full bg-[#247C78] flex items-center justify-center text-white text-[10px] font-bold shrink-0">
            AM
          </div>
          <div className="min-w-0 leading-tight">
            <div className="font-semibold text-white truncate text-[11px]">Alex Morgan</div>
            <div className="text-[10px] text-slate-400 truncate">alex@company.com</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
