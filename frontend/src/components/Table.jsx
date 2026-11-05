import React from 'react';
import { cn } from '../lib/utils';

export function Table({ children, className = '', ...props }) {
  return (
    <div className="w-full overflow-x-auto rounded-xl border border-[#DCE5EA] bg-white">
      <table className={cn('w-full text-left text-xs border-collapse', className)} {...props}>
        {children}
      </table>
    </div>
  );
}

export function TableHeader({ children, className = '', ...props }) {
  return (
    <thead className={cn('bg-[#F4F7FA] border-b border-[#DCE5EA] text-[#718096] uppercase text-[10px] font-bold tracking-wider', className)} {...props}>
      {children}
    </thead>
  );
}

export function TableBody({ children, className = '', ...props }) {
  return (
    <tbody className={cn('divide-y divide-[#DCE5EA] text-[#263746]', className)} {...props}>
      {children}
    </tbody>
  );
}

export function TableRow({ children, className = '', ...props }) {
  return (
    <tr className={cn('hover:bg-[#F4F7FA]/60 transition-colors', className)} {...props}>
      {children}
    </tr>
  );
}

export function TableHead({ children, className = '', ...props }) {
  return (
    <th className={cn('p-3.5 font-bold', className)} {...props}>
      {children}
    </th>
  );
}

export function TableCell({ children, className = '', ...props }) {
  return (
    <td className={cn('p-3.5', className)} {...props}>
      {children}
    </td>
  );
}

