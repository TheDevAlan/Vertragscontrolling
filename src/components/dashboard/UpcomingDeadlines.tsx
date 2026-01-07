'use client';

import Link from 'next/link';
import { Calendar, AlertTriangle, ChevronRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatDate, daysUntil } from '@/lib/utils';
import type { ContractWithType } from '@/types';

interface UpcomingDeadlinesProps {
  contracts: ContractWithType[];
}

export const UpcomingDeadlines = ({ contracts }: UpcomingDeadlinesProps) => {
  const getUrgencyVariant = (days: number | null) => {
    if (days === null) return 'default';
    if (days <= 14) return 'danger';
    if (days <= 30) return 'warning';
    return 'info';
  };

  const getUrgencyText = (days: number | null) => {
    if (days === null) return '-';
    if (days < 0) return 'Überfällig';
    if (days === 0) return 'Heute';
    if (days === 1) return 'Morgen';
    return `${days} Tage`;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary-600" />
          Anstehende Fristen
        </CardTitle>
        <Link
          href="/vertraege"
          className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
        >
          Alle anzeigen
          <ChevronRight className="w-4 h-4" />
        </Link>
      </CardHeader>
      <CardContent className="p-0">
        {contracts.length === 0 ? (
          <div className="px-6 py-8 text-center text-slate-500">
            <Calendar className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p>Keine anstehenden Fristen</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {contracts.map((contract) => {
              const days = daysUntil(contract.terminationDate || contract.endDate);
              const urgencyVariant = getUrgencyVariant(days);
              const isUrgent = days !== null && days <= 14;

              return (
                <Link
                  key={contract.id}
                  href={`/vertraege/${contract.id}`}
                  className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    {isUrgent && (
                      <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />
                    )}
                    <div>
                      <p className="font-medium text-slate-900">
                        {contract.title}
                      </p>
                      <p className="text-sm text-slate-500">
                        {contract.partner} • {contract.contractNumber}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-sm text-slate-500">
                        {formatDate(contract.terminationDate || contract.endDate)}
                      </p>
                      <Badge variant={urgencyVariant} size="sm">
                        {getUrgencyText(days)}
                      </Badge>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

