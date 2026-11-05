import React from 'react';
import { cn } from '../lib/utils';

export function PageHeader({
  title,
  subtitle,
  badge,
  actions,
  className = ''
}) {
  return (
    <div className={cn('flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#DCE5EA]', className)}>
      <div>
        <div className="flex items-center gap-2 mb-1">
          <h1 className="text-2xl font-bold text-[#102B46] tracking-tight">{title}</h1>
          {badge && (
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#247C78]/10 text-[#247C78] border border-[#247C78]/20">
              {badge}
            </span>
          )}
        </div>
        {subtitle && (
          <p className="text-xs text-[#718096] leading-normal">{subtitle}</p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-2.5 shrink-0">{actions}</div>
      )}
    </div>
  );
}

