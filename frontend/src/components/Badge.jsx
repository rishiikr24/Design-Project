import { cn } from '../lib/utils';

export function Badge({ variant = 'default', className, children, ...props }) {
  const variants = {
    default: 'bg-slate-700/80 text-slate-200 border-slate-600',
    primary: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    cyan: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
    success: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    warning: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    danger: 'bg-red-500/15 text-red-400 border-red-500/30',
    purple: 'bg-purple-500/15 text-purple-400 border-purple-500/30'
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border tracking-wide uppercase',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
