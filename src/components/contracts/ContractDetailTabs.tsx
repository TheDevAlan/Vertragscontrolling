'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { FileText, History, CheckSquare } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import { ContractHistory } from './ContractHistory';

interface ContractDetailTabsProps {
  contractId: string;
  overviewContent?: React.ReactNode;
  initialTab?: 'overview' | 'history' | 'abschluss';
  showContent?: boolean; // Wenn false, wird nur die Tab-Navigation angezeigt (für Abschluss-Seite)
}

export const ContractDetailTabs = ({ contractId, overviewContent, initialTab, showContent = true }: ContractDetailTabsProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'abschluss'>('overview');
  
  useEffect(() => {
    // Bestimme aktiven Tab basierend auf Route (nur im Client)
    if (pathname?.endsWith('/abschluss')) {
      setActiveTab('abschluss');
    } else if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      if (searchParams.get('tab') === 'history') {
        setActiveTab('history');
      } else if (initialTab) {
        setActiveTab(initialTab);
      }
    } else if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [pathname, initialTab]);

  const handleTabChange = (value: string) => {
    if (value === 'abschluss') {
      router.push(`/vertraege/${contractId}/abschluss`);
    } else if (value === 'history') {
      // Verwende URL-Parameter für History-Tab
      router.push(`/vertraege/${contractId}?tab=history`);
      setActiveTab('history');
    } else {
      router.push(`/vertraege/${contractId}`);
      setActiveTab('overview');
    }
  };

  const isAbschlussPage = pathname?.endsWith('/abschluss');
  const currentTab = isAbschlussPage ? 'abschluss' : activeTab;

  return (
    <Tabs value={currentTab} onValueChange={handleTabChange}>
      <TabsList className="border-b border-slate-200">
        <TabsTrigger value="overview" className="gap-2">
          <FileText className="w-4 h-4" />
          Übersicht
        </TabsTrigger>
        <TabsTrigger value="history" className="gap-2">
          <History className="w-4 h-4" />
          Änderungsverlauf
        </TabsTrigger>
        <TabsTrigger value="abschluss" className="gap-2">
          <CheckSquare className="w-4 h-4" />
          Abschluss
        </TabsTrigger>
      </TabsList>

      {showContent && !isAbschlussPage && (
        <>
          {currentTab === 'overview' && overviewContent && (
            <TabsContent value="overview">{overviewContent}</TabsContent>
          )}
          {currentTab === 'history' && (
            <TabsContent value="history">
              <ContractHistory contractId={contractId} />
            </TabsContent>
          )}
        </>
      )}
    </Tabs>
  );
};
