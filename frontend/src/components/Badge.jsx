import React from 'react';
import { cn } from '../lib/utils';

export function Badge({ children, variant = 'primary', className = '' }) {
  const variants = {
    primary: 'bg-[#247C78]/10 text-[#247C78] border-[#247C78]/25',
    navy: 'bg-[#102B46]/10 text-[#102B46] border-[#102B46]/20',
    amber: 'bg-[#E7B65C]/20 text-[#92400E] border-[#E7B65C]/40',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    danger: 'bg-red-50 text-red-700 border-red-200',
    neutral: 'bg-[#F4F7FA] text-[#718096] border-[#DCE5EA]',
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    cyan: 'bg-cyan-50 text-cyan-800 border-cyan-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200'
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold border',
        variants[variant] || variants.primary,
        className
      )}
    >
      {children}
    </span>
  );
}
