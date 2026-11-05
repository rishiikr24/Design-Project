import React from 'react';
import { cn } from '../lib/utils';

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  type = 'button',
  onClick,
  ...props
}) {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed select-none';

  const variants = {
    primary: 'bg-[#247C78] hover:bg-[#1F6B67] text-white focus:ring-[#247C78] shadow-sm',
    secondary: 'bg-[#102B46] hover:bg-[#0B1E32] text-white focus:ring-[#102B46] shadow-sm',
    outline: 'border border-[#DCE5EA] bg-white hover:bg-[#F4F7FA] text-[#263746] focus:ring-[#247C78] shadow-xs',
    ghost: 'text-[#718096] hover:text-[#102B46] hover:bg-[#F4F7FA] focus:ring-[#247C78]',
    danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500 shadow-sm',
    warning: 'bg-amber-500 hover:bg-amber-600 text-white focus:ring-amber-400 shadow-sm'
  };

  const sizes = {
    xs: 'px-2 py-1 text-[11px] gap-1',
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2 text-xs font-semibold gap-2',
    lg: 'px-5 py-2.5 text-sm font-semibold gap-2.5'
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </button>
  );
}
