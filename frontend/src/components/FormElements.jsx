import React from 'react';
import { cn } from '../lib/utils';

export function Input({
  label,
  error,
  helperText,
  className = '',
  id,
  type = 'text',
  ...props
}) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-semibold text-[#102B46]">
          {label}
        </label>
      )}
      <input
        id={inputId}
        type={type}
        className={cn(
          'w-full bg-white border border-[#DCE5EA] rounded-lg px-3.5 py-2 text-xs text-[#263746] placeholder-[#718096]',
          'focus:outline-none focus:border-[#247C78] focus:ring-1 focus:ring-[#247C78]',
          'disabled:bg-[#F4F7FA] disabled:text-[#718096] disabled:cursor-not-allowed transition-all shadow-2xs',
          error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
          className
        )}
        {...props}
      />
      {error && <p className="text-[11px] text-red-600 font-medium">{error}</p>}
      {!error && helperText && <p className="text-[11px] text-[#718096]">{helperText}</p>}
    </div>
  );
}

export function Select({
  label,
  error,
  helperText,
  options = [],
  children,
  className = '',
  id,
  ...props
}) {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label htmlFor={selectId} className="block text-xs font-semibold text-[#102B46]">
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={cn(
          'w-full bg-white border border-[#DCE5EA] rounded-lg px-3.5 py-2 text-xs text-[#263746]',
          'focus:outline-none focus:border-[#247C78] focus:ring-1 focus:ring-[#247C78]',
          'disabled:bg-[#F4F7FA] disabled:text-[#718096] disabled:cursor-not-allowed transition-all shadow-2xs cursor-pointer',
          error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
          className
        )}
        {...props}
      >
        {children ||
          options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
      </select>
      {error && <p className="text-[11px] text-red-600 font-medium">{error}</p>}
      {!error && helperText && <p className="text-[11px] text-[#718096]">{helperText}</p>}
    </div>
  );
}

export function Textarea({
  label,
  error,
  helperText,
  className = '',
  id,
  rows = 3,
  ...props
}) {
  const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label htmlFor={textareaId} className="block text-xs font-semibold text-[#102B46]">
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        rows={rows}
        className={cn(
          'w-full bg-white border border-[#DCE5EA] rounded-lg px-3.5 py-2 text-xs text-[#263746] placeholder-[#718096]',
          'focus:outline-none focus:border-[#247C78] focus:ring-1 focus:ring-[#247C78]',
          'disabled:bg-[#F4F7FA] disabled:text-[#718096] disabled:cursor-not-allowed transition-all shadow-2xs resize-none',
          error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
          className
        )}
        {...props}
      />
      {error && <p className="text-[11px] text-red-600 font-medium">{error}</p>}
      {!error && helperText && <p className="text-[11px] text-[#718096]">{helperText}</p>}
    </div>
  );
}

