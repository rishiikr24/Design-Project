import React from 'react';
import { cn } from '../lib/utils';
import { AlertCircle, FileText, Loader2 } from 'lucide-react';
import { Button } from './Button';

export function ProgressBar({
  value = 0,
  max = 100,
  variant = 'teal',
  size = 'md',
  showLabel = false,
  className = ''
}) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  const variants = {
    teal: 'bg-[#247C78]',
    navy: 'bg-[#102B46]',
    amber: 'bg-[#E7B65C]',
    emerald: 'bg-emerald-500',
    red: 'bg-red-500'
  };

  const sizes = {
    sm: 'h-1',
    md: 'h-1.5',
    lg: 'h-2.5'
  };

  return (
    <div className={cn('w-full', className)}>
      {showLabel && (
        <div className="flex justify-between items-center text-xs text-[#718096] mb-1">
          <span>Progress</span>
          <span className="font-semibold text-[#102B46]">{Math.round(percentage)}%</span>
        </div>
      )}
      <div className={cn('w-full bg-[#F4F7FA] rounded-full overflow-hidden border border-[#DCE5EA]', sizes[size])}>
        <div
          className={cn('h-full rounded-full transition-all duration-300', variants[variant] || variants.teal)}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

export function Tabs({ tabs, activeTab, onChange, className = '' }) {
  return (
    <div className={cn('flex items-center gap-1 border-b border-[#DCE5EA] overflow-x-auto', className)}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all whitespace-nowrap',
              isActive
                ? 'border-[#247C78] text-[#247C78] bg-[#247C78]/5'
                : 'border-transparent text-[#718096] hover:text-[#102B46] hover:border-[#DCE5EA]'
            )}
          >
            {Icon && <Icon className="w-3.5 h-3.5" />}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={cn(
                  'px-1.5 py-0.2 rounded-full text-[10px] font-bold',
                  isActive ? 'bg-[#247C78] text-white' : 'bg-[#DCE5EA] text-[#718096]'
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export function LoadingState({ message = 'Loading enterprise records...', className = '' }) {
  return (
    <div className={cn('flex flex-col items-center justify-center p-12 text-center space-y-3', className)}>
      <div className="w-10 h-10 rounded-xl bg-[#247C78]/10 text-[#247C78] flex items-center justify-center animate-spin">
        <Loader2 className="w-5 h-5" />
      </div>
      <p className="text-xs text-[#718096] font-medium">{message}</p>
    </div>
  );
}

export function EmptyState({
  title = 'No Records Found',
  description = 'No active entries are available for this section.',
  actionText,
  onAction,
  icon: Icon = FileText,
  className = ''
}) {
  return (
    <div className={cn('flex flex-col items-center justify-center p-10 bg-white rounded-xl border border-[#DCE5EA] text-center space-y-3', className)}>
      <div className="w-12 h-12 rounded-xl bg-[#F4F7FA] border border-[#DCE5EA] flex items-center justify-center text-[#718096]">
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <h4 className="text-sm font-bold text-[#102B46]">{title}</h4>
        <p className="text-xs text-[#718096] mt-1 max-w-sm">{description}</p>
      </div>
      {actionText && onAction && (
        <Button variant="primary" size="sm" onClick={onAction} className="mt-2">
          {actionText}
        </Button>
      )}
    </div>
  );
}

export function ErrorState({
  title = 'Something Went Wrong',
  message = 'An unexpected error occurred while loading this module.',
  onRetry,
  className = ''
}) {
  return (
    <div className={cn('flex flex-col items-center justify-center p-8 bg-white rounded-xl border border-red-200 text-center space-y-3', className)}>
      <div className="w-12 h-12 rounded-full bg-red-50 border border-red-200 flex items-center justify-center text-red-600">
        <AlertCircle className="w-6 h-6" />
      </div>
      <div>
        <h4 className="text-sm font-bold text-[#102B46]">{title}</h4>
        <p className="text-xs text-[#718096] mt-1 max-w-sm">{message}</p>
      </div>
      {onRetry && (
        <Button variant="primary" size="sm" onClick={onRetry} className="mt-2">
          Try Again
        </Button>
      )}
    </div>
  );
}

export function Tooltip({ text, children, position = 'top' }) {
  const [visible, setVisible] = React.useState(false);

  const positions = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-1.5',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-1.5'
  };

  return (
    <div
      className="relative inline-flex items-center"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible && (
        <div
          className={cn(
            'absolute z-30 px-2.5 py-1 text-[11px] font-medium text-white bg-[#102B46] rounded-md shadow-md whitespace-nowrap pointer-events-none transition-opacity',
            positions[position]
          )}
        >
          {text}
        </div>
      )}
    </div>
  );
}

