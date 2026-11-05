import React from 'react';
import { cn } from '../lib/utils';

export function Card({ children, className = '', ...props }) {
  return (
    <div
      className={cn(
        'bg-white rounded-xl border border-[#DCE5EA] shadow-xs text-[#263746] transition-shadow duration-200',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '', ...props }) {
  return (
    <div
      className={cn('p-5 border-b border-[#DCE5EA] flex items-center justify-between', className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardTitle({ children, className = '', ...props }) {
  return (
    <h3
      className={cn('text-base font-bold text-[#102B46] tracking-tight leading-tight', className)}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardDescription({ children, className = '', ...props }) {
  return (
    <p
      className={cn('text-xs text-[#718096] mt-1 leading-normal', className)}
      {...props}
    >
      {children}
    </p>
  );
}

export function CardContent({ children, className = '', ...props }) {
  return (
    <div className={cn('p-5', className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className = '', ...props }) {
  return (
    <div
      className={cn('p-4 border-t border-[#DCE5EA] bg-[#F4F7FA]/50 rounded-b-xl flex items-center justify-between', className)}
      {...props}
    >
      {children}
    </div>
  );
}
