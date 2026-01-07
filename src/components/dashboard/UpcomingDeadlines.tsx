'use client';

import Link from 'next/link';
import { Calendar, ChevronRight, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import {
  formatDate,
  daysUntil,
  getDeadlineTypeText,
  getDeadlineStatus,
} from '@/lib/utils';

// Typ für Deadline mit Contract
interface DeadlineWithContract {
  id: string;
  type: string;
  customLabel: string | null;
  dueDate: Date;
  reminderDays: number;
  notifyEmail: string | null;
  isCompleted: boolean;
  contract: {
    id: string;
    title: string;
    contractNumber: string;
    partner: string;
    type: {
      name: string;
      color: string;
    };
  };
}

interface UpcomingDeadlinesProps {
  deadlines: DeadlineWithContract[];
}

export const UpcomingDeadlines = ({ deadlines }: UpcomingDeadlinesProps) => {
  // Ampel-Farben basierend auf Dringlichkeit
  const getTrafficLightColor = (days: number | null, isCompleted: boolean) => {
    if (isCompleted) return 'bg-green-500'; // Grün - Erledigt
    if (days === null) return 'bg-slate-400';
    if (days < 0) return 'bg-red-600'; // Dunkelrot - Überfällig
    if (days <= 7) return 'bg-red-500'; // Rot - Sehr dringend
    if (days <= 14) return 'bg-orange-500'; // Orange - Dringend
    if (days <= 30) return 'bg-amber-400'; // Gelb - Bald fällig
    return 'bg-green-500'; // Grün - Noch Zeit
  };

  const getUrgencyBgColor = (days: number | null, isCompleted: boolean) => {
    if (isCompleted) return 'bg-green-50 border-green-200';
    if (days === null) return 'bg-slate-50 border-slate-200';
    if (days < 0) return 'bg-red-50 border-red-300'; // Überfällig
    if (days <= 7) return 'bg-red-50 border-red-200'; // Sehr dringend
    if (days <= 14) return 'bg-orange-50 border-orange-200'; // Dringend
    if (days <= 30) return 'bg-amber-50 border-amber-200'; // Bald fällig
    return 'bg-green-50 border-green-200'; // Noch Zeit
  };

  const getUrgencyText = (days: number | null, isCompleted: boolean) => {
    if (isCompleted) return 'Erledigt';
    if (days === null) return '-';
    if (days < 0) return `${Math.abs(days)} ${Math.abs(days) === 1 ? 'Tag' : 'Tage'} überfällig`;
    if (days === 0) return 'Heute fällig!';
    if (days === 1) return 'Morgen fällig';
    return `Noch ${days} Tage`;
  };

  const getUrgencyTextColor = (days: number | null, isCompleted: boolean) => {
    if (isCompleted) return 'text-green-700';
    if (days === null) return 'text-slate-600';
    if (days < 0) return 'text-red-700 font-semibold';
    if (days <= 7) return 'text-red-600 font-semibold';
    if (days <= 14) return 'text-orange-600 font-medium';
    if (days <= 30) return 'text-amber-600';
    return 'text-green-600';
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary-600" />
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
        {deadlines.length === 0 ? (
          <div className="px-6 py-8 text-center text-slate-500">
            <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-green-400" />
            <p className="font-medium text-green-600">Keine anstehenden Fristen</p>
            <p className="text-sm text-slate-400 mt-1">Alles im grünen Bereich!</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {deadlines.map((deadline) => {
              const days = daysUntil(deadline.dueDate);
              const trafficLightColor = getTrafficLightColor(days, deadline.isCompleted);
              const bgColor = getUrgencyBgColor(days, deadline.isCompleted);
              const urgencyText = getUrgencyText(days, deadline.isCompleted);
              const textColor = getUrgencyTextColor(days, deadline.isCompleted);
              const isUrgent = days !== null && days <= 7 && !deadline.isCompleted;
              const deadlineLabel = deadline.customLabel || getDeadlineTypeText(deadline.type);

              return (
                <Link
                  key={deadline.id}
                  href={`/vertraege/${deadline.contract.id}`}
                  className={`flex items-center gap-4 px-4 py-3 hover:bg-slate-100/50 transition-colors border-l-4 ${bgColor}`}
                  style={{ borderLeftColor: isUrgent ? undefined : 'transparent' }}
                >
                  {/* Ampel-Indikator */}
                  <div className="flex-shrink-0">
                    <div
                      className={`w-3 h-3 rounded-full ${trafficLightColor} shadow-sm`}
                      title={urgencyText}
                    />
                  </div>

                  {/* Frist-Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-900 truncate">
                        {deadlineLabel}
                      </span>
                      {isUrgent && (
                        <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-sm text-slate-500 truncate">
                      {deadline.contract.title} • {deadline.contract.partner}
                    </p>
                  </div>

                  {/* Datum & Countdown */}
                  <div className="flex-shrink-0 text-right">
                    <p className="text-sm text-slate-500">
                      {formatDate(deadline.dueDate)}
                    </p>
                    <p className={`text-sm ${textColor}`}>
                      {urgencyText}
                    </p>
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
