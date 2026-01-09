'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface TabsProps {
  children: ReactNode;
  defaultValue?: string;
  className?: string;
}

interface TabsContextType {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

import { createContext, useContext, useState, useEffect } from 'react';

const TabsContext = createContext<TabsContextType | undefined>(undefined);

export const Tabs = ({ children, defaultValue = '', value, onValueChange, className }: TabsProps & { value?: string; onValueChange?: (value: string) => void }) => {
  const [activeTab, setActiveTab] = useState(value || defaultValue);

  // Update activeTab wenn value prop sich ändert
  useEffect(() => {
    if (value !== undefined) {
      setActiveTab(value);
    }
  }, [value]);

  const handleSetActiveTab = (tab: string) => {
    setActiveTab(tab);
    onValueChange?.(tab);
  };

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab: handleSetActiveTab }}>
      <div className={cn('w-full', className)}>{children}</div>
    </TabsContext.Provider>
  );
};

interface TabsListProps {
  children: ReactNode;
  className?: string;
}

export const TabsList = ({ children, className }: TabsListProps) => {
  return (
    <div className={cn('flex', className)}>{children}</div>
  );
};

interface TabsTriggerProps {
  value: string;
  children: ReactNode;
  className?: string;
}

export const TabsTrigger = ({ value, children, className }: TabsTriggerProps) => {
  const context = useContext(TabsContext);
  if (!context) throw new Error('TabsTrigger must be used within Tabs');

  const { activeTab, setActiveTab } = context;
  const isActive = activeTab === value;

  return (
    <button
      type="button"
      onClick={() => setActiveTab(value)}
      className={cn(
        'px-4 py-3 text-sm font-medium transition-colors',
        'border-b-2 -mb-px',
        isActive
          ? 'border-primary-600 text-primary-600'
          : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300',
        className
      )}
    >
      {children}
    </button>
  );
};

interface TabsContentProps {
  value: string;
  children: ReactNode;
  className?: string;
}

export const TabsContent = ({ value, children, className }: TabsContentProps) => {
  const context = useContext(TabsContext);
  if (!context) throw new Error('TabsContent must be used within Tabs');

  const { activeTab } = context;
  if (activeTab !== value) return null;

  return <div className={cn('mt-6', className)}>{children}</div>;
};
