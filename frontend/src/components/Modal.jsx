import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '../lib/utils';

export function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'max-w-xl',
  className = ''
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#102B46]/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className={cn(
          'w-full bg-white rounded-2xl border border-[#DCE5EA] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]',
          maxWidth,
          className
        )}
      >
        {/* Modal Header */}
        <div className="p-5 border-b border-[#DCE5EA] flex items-center justify-between bg-white shrink-0">
          <div>
            <h3 className="text-base font-bold text-[#102B46] tracking-tight">{title}</h3>
            {subtitle && <p className="text-xs text-[#718096] mt-0.5">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-[#718096] hover:text-[#102B46] hover:bg-[#F4F7FA] flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );
}
