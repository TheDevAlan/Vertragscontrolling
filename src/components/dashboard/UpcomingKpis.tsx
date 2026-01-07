'use client';

import Link from 'next/link';
import { BarChart3, ChevronRight, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { formatDate, daysUntil } from '@/lib/utils';

interface KpiType {
  id: string;
  name: string;
  dataType: string;
  color: string;
}

interface Contract {
  id: string;
  title: string;
  contractNumber: string;
  partner: string;
}

interface ContractKpi {
  id: string;
  targetValue: number;
  currentValue: number;
  dueDate: Date | null;
  kpiType: KpiType;
  contract: Contract;
}

interface UpcomingKpisProps {
  kpis: ContractKpi[];
}

// Fortschritt berechnen
const calculateProgress = (current: number, target: number): number => {
  if (target === 0) return current > 0 ? 100 : 0;
  return Math.min(Math.round((current / target) * 100), 100);
};

// Wert formatieren
const formatValue = (value: number, dataType: string): string => {
  switch (dataType) {
    case 'PERCENT':
      return `${value.toFixed(0)}%`;
    case 'CURRENCY':
      return new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: 'EUR',
        maximumFractionDigits: 0,
      }).format(value);
    default:
      return value.toLocaleString('de-DE');
  }
};

// Ampel-Farben basierend auf Frist und Fortschritt
const getKpiColor = (progress: number, dueDate: Date | null) => {
  const days = dueDate ? daysUntil(dueDate) : null;
  
  // Ziel erreicht
  if (progress >= 100) return 'bg-green-500';
  
  // Kein Fristdatum
  if (days === null) {
    if (progress >= 75) return 'bg-green-400';
    if (progress >= 50) return 'bg-amber-400';
    return 'bg-red-400';
  }
  
  // Überfällig
  if (days < 0) return 'bg-red-600';
  
  // Frist-basiert
  if (days <= 7) return progress >= 90 ? 'bg-amber-400' : 'bg-red-500';
  if (days <= 14) return progress >= 75 ? 'bg-amber-400' : 'bg-orange-500';
  if (days <= 30) return progress >= 50 ? 'bg-amber-400' : 'bg-orange-400';
  
  return 'bg-green-400';
};

const getKpiBgColor = (progress: number, dueDate: Date | null) => {
  const days = dueDate ? daysUntil(dueDate) : null;
  
  if (progress >= 100) return 'bg-green-50 border-green-200';
  if (days !== null && days < 0) return 'bg-red-50 border-red-300';
  if (days !== null && days <= 7 && progress < 90) return 'bg-red-50 border-red-200';
  if (days !== null && days <= 14) return 'bg-orange-50 border-orange-200';
  if (days !== null && days <= 30) return 'bg-amber-50 border-amber-200';
  
  return 'bg-slate-50 border-slate-200';
};

const getStatusText = (progress: number, dueDate: Date | null) => {
  const days = dueDate ? daysUntil(dueDate) : null;
  
  if (progress >= 100) return 'Erreicht';
  if (days === null) return `${progress}%`;
  if (days < 0) return `${Math.abs(days)}d überfällig`;
  if (days === 0) return 'Heute fällig';
  return `${days}d verbleibend`;
};

const getStatusTextColor = (progress: number, dueDate: Date | null) => {
  const days = dueDate ? daysUntil(dueDate) : null;
  
  if (progress >= 100) return 'text-green-700';
  if (days !== null && days < 0) return 'text-red-700 font-semibold';
  if (days !== null && days <= 7) return 'text-red-600 font-semibold';
  if (days !== null && days <= 14) return 'text-orange-600';
  if (days !== null && days <= 30) return 'text-amber-600';
  
  return 'text-slate-600';
};

export const UpcomingKpis = ({ kpis }: UpcomingKpisProps) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-primary-600" />
          Kennzahlen-Übersicht
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
        {kpis.length === 0 ? (
          <div className="px-6 py-8 text-center text-slate-500">
            <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-green-400" />
            <p className="font-medium text-green-600">Keine offenen Kennzahlen</p>
            <p className="text-sm text-slate-400 mt-1">Alles im grünen Bereich!</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {kpis.map((kpi) => {
              const progress = calculateProgress(kpi.currentValue, kpi.targetValue);
              const color = getKpiColor(progress, kpi.dueDate);
              const bgColor = getKpiBgColor(progress, kpi.dueDate);
              const statusText = getStatusText(progress, kpi.dueDate);
              const statusTextColor = getStatusTextColor(progress, kpi.dueDate);
              const days = kpi.dueDate ? daysUntil(kpi.dueDate) : null;
              const isUrgent = days !== null && days <= 7 && progress < 90;

              return (
                <Link
                  key={kpi.id}
                  href={`/vertraege/${kpi.contract.id}`}
                  className={`flex items-center gap-4 px-4 py-3 hover:bg-slate-100/50 transition-colors border-l-4 ${bgColor}`}
                  style={{ borderLeftColor: isUrgent ? undefined : 'transparent' }}
                >
                  {/* Ampel-Indikator */}
                  <div className="flex-shrink-0">
                    <div
                      className={`w-3 h-3 rounded-full ${color} shadow-sm`}
                    />
                  </div>

                  {/* KPI-Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-900 truncate">
                        {kpi.kpiType.name}
                      </span>
                      {isUrgent && (
                        <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-sm text-slate-500 truncate">
                      {kpi.contract.title} • {kpi.contract.partner}
                    </p>
                  </div>

                  {/* Fortschritt */}
                  <div className="flex-shrink-0 text-right">
                    <p className="text-sm font-medium text-slate-900">
                      {formatValue(kpi.currentValue, kpi.kpiType.dataType)} / {formatValue(kpi.targetValue, kpi.kpiType.dataType)}
                    </p>
                    <p className={`text-sm ${statusTextColor}`}>
                      {statusText}
                    </p>
                  </div>

                  {/* Fortschrittsbalken mini */}
                  <div className="flex-shrink-0 w-16">
                    <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${color} transition-all duration-500`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
                </Link>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

