'use client';

import { useEffect, useState } from 'react';
import { Clock, User, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatValue, deserializeValue, FIELD_LABELS } from '@/lib/contractHistory';

interface ContractHistoryEntry {
  id: string;
  fieldName: string;
  fieldLabel: string;
  oldValue: string | null;
  newValue: string | null;
  changeType: string;
  changedAt: string;
  changedBy: {
    id: string;
    name: string | null;
    email: string;
  };
}

interface ContractHistoryProps {
  contractId: string;
}

export const ContractHistory = ({ contractId }: ContractHistoryProps) => {
  const [history, setHistory] = useState<ContractHistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/contracts/${contractId}/history`);
        const data = await response.json();

        if (data.success) {
          setHistory(data.data);
        } else {
          setError(data.error || 'Fehler beim Laden der Historie');
        }
      } catch (err) {
        setError('Fehler beim Laden der Historie');
        console.error('Error fetching history:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, [contractId]);

  // Gruppiere Historie nach Datum
  const groupedHistory = history.reduce((acc, entry) => {
    const date = new Date(entry.changedAt);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const entryDate = new Date(date);
    entryDate.setHours(0, 0, 0, 0);

    let groupKey: string;
    const diffDays = Math.floor((today.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      groupKey = 'Heute';
    } else if (diffDays === 1) {
      groupKey = 'Gestern';
    } else if (diffDays <= 7) {
      groupKey = 'Letzte Woche';
    } else if (diffDays <= 30) {
      groupKey = 'Letzter Monat';
    } else {
      groupKey = date.toLocaleDateString('de-DE', {
        year: 'numeric',
        month: 'long',
      });
    }

    if (!acc[groupKey]) {
      acc[groupKey] = [];
    }
    acc[groupKey].push(entry);
    return acc;
  }, {} as Record<string, ContractHistoryEntry[]>);

  const getChangeTypeColor = (changeType: string) => {
    switch (changeType) {
      case 'CREATE':
        return 'success';
      case 'DELETE':
        return 'danger';
      default:
        return 'default';
    }
  };

  const getChangeTypeText = (changeType: string) => {
    switch (changeType) {
      case 'CREATE':
        return 'Hinzugefügt';
      case 'DELETE':
        return 'Entfernt';
      default:
        return 'Geändert';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-slate-500">
          <Clock className="w-8 h-8 mx-auto mb-2 animate-spin" />
          <p>Lade Änderungsverlauf...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-red-600">
          <p>{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (history.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-slate-500">
          <Clock className="w-8 h-8 mx-auto mb-2 text-slate-400" />
          <p>Noch keine Änderungen vorhanden.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {Object.entries(groupedHistory).map(([groupKey, entries]) => (
        <div key={groupKey}>
          <h3 className="text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wide">
            {groupKey}
          </h3>
          <div className="space-y-3">
            {entries.map((entry) => {
              const oldValue = deserializeValue(entry.oldValue, entry.fieldName);
              const newValue = deserializeValue(entry.newValue, entry.fieldName);

              return (
                <Card key={entry.id} className="border-l-4 border-l-slate-300">
                  <CardContent className="py-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant={getChangeTypeColor(entry.changeType)} size="sm">
                            {getChangeTypeText(entry.changeType)}
                          </Badge>
                          <span className="font-medium text-slate-900">
                            {entry.fieldLabel || FIELD_LABELS[entry.fieldName] || entry.fieldName}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-slate-600 mt-2">
                          <div className="flex items-center gap-1.5">
                            <User className="w-4 h-4" />
                            <span>{entry.changedBy.name || entry.changedBy.email}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-4 h-4" />
                            <span>
                              {new Date(entry.changedAt).toLocaleString('de-DE', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Diff-Anzeige */}
                    <div className="mt-3 pt-3 border-t border-slate-200">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {entry.changeType !== 'CREATE' && (
                          <div className="space-y-1">
                            <p className="text-xs font-medium text-slate-500 uppercase">Alter Wert</p>
                            <p className="text-sm p-2 bg-red-50 border border-red-200 rounded text-red-900 line-through">
                              {formatValue(oldValue, entry.fieldName)}
                            </p>
                          </div>
                        )}
                        {entry.changeType !== 'DELETE' && (
                          <div className="space-y-1">
                            <p className="text-xs font-medium text-slate-500 uppercase">Neuer Wert</p>
                            <p className="text-sm p-2 bg-green-50 border border-green-200 rounded text-green-900 font-medium">
                              {formatValue(newValue, entry.fieldName)}
                            </p>
                          </div>
                        )}
                      </div>
                      {entry.changeType === 'UPDATE' && (
                        <div className="flex items-center justify-center mt-2 md:hidden">
                          <ArrowRight className="w-5 h-5 text-slate-400 rotate-90" />
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};
