import { cn } from '../lib/utils';

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  disabled,
  children,
  ...props
}) {
  const base = 'inline-flex items-center justify-center font-medium rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed select-none';

  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-900/30 focus:ring-blue-500',
    secondary: 'bg-slate-700 hover:bg-slate-600 text-slate-100 border border-slate-600 focus:ring-slate-400',
    outline: 'border border-slate-600 hover:border-slate-400 text-slate-200 hover:bg-slate-800/80 focus:ring-slate-400',
    outlineCyan: 'border border-cyan-500/80 text-cyan-400 hover:bg-cyan-950/40 focus:ring-cyan-400',
    ghost: 'hover:bg-slate-800 text-slate-300 hover:text-white focus:ring-slate-400',
    danger: 'bg-red-600 hover:bg-red-500 text-white shadow-md shadow-red-900/30 focus:ring-red-500',
    success: 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-900/30 focus:ring-emerald-500'
  };

  const sizes = {
    sm: 'text-xs px-2.5 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2 gap-2',
    lg: 'text-base px-5 py-2.5 gap-2.5'
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
