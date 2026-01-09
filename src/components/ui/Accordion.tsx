'use client';

import { useState, ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AccordionProps {
  title: string;
  icon?: ReactNode;
  defaultOpen?: boolean;
  children: ReactNode;
  badge?: ReactNode;
  className?: string;
}

export const Accordion = ({
  title,
  icon,
  defaultOpen = false,
  children,
  badge,
  className,
}: AccordionProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div
      className={cn(
        'border border-slate-200 rounded-xl bg-white shadow-sm overflow-hidden',
        className
      )}
    >
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          {icon && <span className="text-primary-600">{icon}</span>}
          <span className="font-semibold text-slate-900">{title}</span>
          {badge}
        </div>
        <ChevronDown
          className={cn(
            'w-5 h-5 text-slate-400 transition-transform duration-200',
            isOpen && 'rotate-180'
          )}
        />
      </button>
      <div
        className={cn(
          'transition-all duration-200 ease-in-out',
          isOpen ? 'max-h-[5000px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
        )}
      >
        <div className="px-6 pb-6 pt-2 border-t border-slate-100">
          {children}
        </div>
      </div>
    </div>
  );
};

// Accordion Group für konsistentes Styling
interface AccordionGroupProps {
  children: ReactNode;
  className?: string;
}

export const AccordionGroup = ({ children, className }: AccordionGroupProps) => {
  return <div className={cn('space-y-4', className)}>{children}</div>;
};



