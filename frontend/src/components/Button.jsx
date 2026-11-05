import { cn } from '../lib/utils';

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  disabled,
  children,
  ...props
}) {
  const base = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none shadow-sm';

  const variants = {
    primary: 'bg-[#102B46] hover:bg-[#0B1E32] text-white focus:ring-[#102B46]',
    secondary: 'bg-[#F4F7FA] hover:bg-slate-200 text-[#102B46] border border-[#DCE5EA] focus:ring-[#247C78]',
    teal: 'bg-[#247C78] hover:bg-[#1D6864] text-white focus:ring-[#247C78]',
    outline: 'border border-[#DCE5EA] hover:border-slate-400 text-[#102B46] hover:bg-[#F4F7FA] focus:ring-[#247C78]',
    outlineCyan: 'border border-[#247C78] text-[#247C78] hover:bg-[#247C78]/10 focus:ring-[#247C78]',
    ghost: 'hover:bg-slate-100 text-slate-600 hover:text-[#102B46] focus:ring-slate-300 shadow-none',
    danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500',
    success: 'bg-[#247C78] hover:bg-[#1D6864] text-white focus:ring-[#247C78]'
  };

  const sizes = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-xs px-4 py-2 gap-2',
    lg: 'text-sm px-5 py-2.5 gap-2.5'
  };

  return (
    <button
      className={cn(base, variants[variant], sizes[size], className)}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
