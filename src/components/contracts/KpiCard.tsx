'use client';

import { useState } from 'react';
import { BarChart3, History, Pencil, Check, X, Clock, AlertTriangle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { formatDate, daysUntil } from '@/lib/utils';

interface KpiHistory {
  id: string;
  previousValue: number;
  newValue: number;
  changedAt: Date;
  changedBy: string | null;
  note: string | null;
}

interface KpiType {
  id: string;
  name: string;
  dataType: string;
  unit: string | null;
  color: string;
}

interface ContractKpi {
  id: string;
  kpiTypeId: string;
  kpiType: KpiType;
  targetValue: number;
  currentValue: number;
  dueDate: Date | null;
  updatedAt: Date;
  history: KpiHistory[];
}

interface KpiCardProps {
  kpis: ContractKpi[];
}

// Fortschritt berechnen (Prozent des Ziels erreicht)
const calculateProgress = (current: number, target: number): number => {
  if (target === 0) return current > 0 ? 100 : 0;
  return Math.min(Math.round((current / target) * 100), 100);
};

// Ampel-Status basierend auf Frist UND Fortschritt
const getKpiStatus = (progress: number, dueDate: Date | null): {
  color: string;
  bgColor: string;
  textColor: string;
  status: 'success' | 'warning' | 'danger' | 'critical';
  label: string;
} => {
  const days = dueDate ? daysUntil(dueDate) : null;
  
  // Ziel erreicht = immer grün
  if (progress >= 100) {
    return {
      color: 'bg-green-500',
      bgColor: 'bg-green-50 border-green-200',
      textColor: 'text-green-700',
      status: 'success',
      label: 'Ziel erreicht',
    };
  }
  
  // Kein Fristdatum = basierend auf Fortschritt
  if (days === null) {
    if (progress >= 75) return {
      color: 'bg-green-400',
      bgColor: 'bg-green-50 border-green-200',
      textColor: 'text-green-600',
      status: 'success',
      label: 'Auf Kurs',
    };
    if (progress >= 50) return {
      color: 'bg-amber-400',
      bgColor: 'bg-amber-50 border-amber-200',
      textColor: 'text-amber-600',
      status: 'warning',
      label: 'Im Verzug',
    };
    return {
      color: 'bg-red-400',
      bgColor: 'bg-red-50 border-red-200',
      textColor: 'text-red-600',
      status: 'danger',
      label: 'Kritisch',
    };
  }
  
  // Frist überschritten
  if (days < 0) {
    return {
      color: 'bg-red-600',
      bgColor: 'bg-red-50 border-red-300',
      textColor: 'text-red-700',
      status: 'critical',
      label: `${Math.abs(days)} Tage überfällig`,
    };
  }
  
  // Frist-basierte Ampel mit Fortschritts-Berücksichtigung
  // Erwarteter Fortschritt basierend auf Zeit (linear)
  const totalDays = 90; // Annahme: 90 Tage Planungszeitraum
  const expectedProgress = Math.max(0, 100 - (days / totalDays * 100));
  const progressDiff = progress - expectedProgress;
  
  if (days <= 7) {
    // Letzte Woche
    if (progress >= 90) return {
      color: 'bg-green-500',
      bgColor: 'bg-green-50 border-green-200',
      textColor: 'text-green-600',
      status: 'success',
      label: `Noch ${days} Tage`,
    };
    return {
      color: 'bg-red-500',
      bgColor: 'bg-red-50 border-red-200',
      textColor: 'text-red-600',
      status: 'critical',
      label: `Nur noch ${days} Tage!`,
    };
  }
  
  if (days <= 14) {
    if (progress >= 75) return {
      color: 'bg-amber-400',
      bgColor: 'bg-amber-50 border-amber-200',
      textColor: 'text-amber-600',
      status: 'warning',
      label: `Noch ${days} Tage`,
    };
    return {
      color: 'bg-orange-500',
      bgColor: 'bg-orange-50 border-orange-200',
      textColor: 'text-orange-600',
      status: 'danger',
      label: `Noch ${days} Tage`,
    };
  }
  
  if (days <= 30) {
    if (progress >= 50) return {
      color: 'bg-amber-400',
      bgColor: 'bg-amber-50 border-amber-200',
      textColor: 'text-amber-600',
      status: 'warning',
      label: `Noch ${days} Tage`,
    };
    return {
      color: 'bg-orange-400',
      bgColor: 'bg-orange-50 border-orange-200',
      textColor: 'text-orange-600',
      status: 'warning',
      label: `Noch ${days} Tage`,
    };
  }
  
  // Mehr als 30 Tage
  return {
    color: 'bg-green-400',
    bgColor: 'bg-green-50 border-green-200',
    textColor: 'text-green-600',
    status: 'success',
    label: `Noch ${days} Tage`,
  };
};

// Wert formatieren basierend auf Datentyp
const formatValue = (value: number, dataType: string): string => {
  switch (dataType) {
    case 'PERCENT':
      return `${value.toFixed(1)}%`;
    case 'CURRENCY':
      return new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: 'EUR',
      }).format(value);
    default:
      return value.toLocaleString('de-DE');
  }
};

export const KpiCard = ({ kpis }: KpiCardProps) => {
  const [editingKpi, setEditingKpi] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [editNote, setEditNote] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [localKpis, setLocalKpis] = useState(kpis);
  const [showHistory, setShowHistory] = useState<string | null>(null);

  const handleStartEdit = (kpi: ContractKpi) => {
    setEditingKpi(kpi.id);
    setEditValue(kpi.currentValue.toString());
    setEditNote('');
  };

  const handleCancelEdit = () => {
    setEditingKpi(null);
    setEditValue('');
    setEditNote('');
  };

  const handleSaveEdit = async (kpiId: string) => {
    const newValue = parseFloat(editValue);
    if (isNaN(newValue)) {
      alert('Bitte einen gültigen Wert eingeben');
      return;
    }

    setIsUpdating(true);
    try {
      const res = await fetch(`/api/contract-kpis/${kpiId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentValue: newValue,
          note: editNote || undefined,
        }),
      });

      const data = await res.json();
      if (data.success) {
        // Lokalen State aktualisieren
        setLocalKpis((prev) =>
          prev.map((k) =>
            k.id === kpiId
              ? { ...k, currentValue: newValue, history: data.data.history }
              : k
          )
        );
        handleCancelEdit();
      } else {
        alert(data.error || 'Fehler beim Speichern');
      }
    } catch (error) {
      console.error('Error updating KPI:', error);
      alert('Fehler beim Speichern der Kennzahl');
    } finally {
      setIsUpdating(false);
    }
  };

  if (localKpis.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-primary-600" />
          Steuerung von Kennzahlen
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {localKpis.map((kpi) => {
          const progress = calculateProgress(kpi.currentValue, kpi.targetValue);
          const status = getKpiStatus(progress, kpi.dueDate);
          const isEditing = editingKpi === kpi.id;
          const isShowingHistory = showHistory === kpi.id;
          const days = kpi.dueDate ? daysUntil(kpi.dueDate) : null;
          const isUrgent = days !== null && days <= 7 && progress < 90;

          return (
            <div
              key={kpi.id}
              className={`p-4 rounded-lg border ${status.bgColor} space-y-3`}
            >
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-3 h-3 rounded-full ${status.color}`}
                  />
                  <span className="font-medium text-slate-900">
                    {kpi.kpiType.name}
                  </span>
                  {isUrgent && (
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${status.bgColor} ${status.textColor}`}>
                    {status.label}
                  </span>
                  {kpi.history.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setShowHistory(isShowingHistory ? null : kpi.id)
                      }
                      className="text-slate-500 hover:text-slate-700"
                    >
                      <History className="w-4 h-4" />
                    </Button>
                  )}
                  {!isEditing && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleStartEdit(kpi)}
                      className="text-slate-500 hover:text-primary-600"
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Werte & Fortschritt */}
              {isEditing ? (
                <div className="space-y-3">
                  <div className="flex items-end gap-3">
                    <Input
                      label="Neuer Wert"
                      type="number"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      step={kpi.kpiType.dataType === 'PERCENT' ? '0.1' : '0.01'}
                      className="flex-1"
                    />
                    <Input
                      label="Notiz (optional)"
                      value={editNote}
                      onChange={(e) => setEditNote(e.target.value)}
                      placeholder="z.B. Q3-Update"
                      className="flex-1"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCancelEdit}
                      disabled={isUpdating}
                    >
                      <X className="w-4 h-4 mr-1" />
                      Abbrechen
                    </Button>
                    <Button
                      variant="success"
                      size="sm"
                      onClick={() => handleSaveEdit(kpi.id)}
                      isLoading={isUpdating}
                    >
                      <Check className="w-4 h-4 mr-1" />
                      Speichern
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-500">Aktuell</p>
                      <p className={`text-2xl font-bold ${status.textColor}`}>
                        {formatValue(kpi.currentValue, kpi.kpiType.dataType)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-500">Ziel</p>
                      <p className="text-lg font-medium text-slate-700">
                        {formatValue(kpi.targetValue, kpi.kpiType.dataType)}
                      </p>
                    </div>
                    {kpi.dueDate && (
                      <div className="text-right">
                        <p className="text-sm text-slate-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Frist
                        </p>
                        <p className={`text-sm font-medium ${status.textColor}`}>
                          {formatDate(kpi.dueDate)}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Fortschrittsbalken */}
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-slate-500">Fortschritt</span>
                      <span className={`font-medium ${status.textColor}`}>
                        {progress}%
                      </span>
                    </div>
                    <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${status.color} transition-all duration-500`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Historie */}
              {isShowingHistory && kpi.history.length > 0 && (
                <div className="pt-3 border-t border-slate-200/50">
                  <p className="text-xs font-medium text-slate-500 mb-2 flex items-center gap-1">
                    <History className="w-3 h-3" />
                    Änderungsverlauf
                  </p>
                  <div className="space-y-1">
                    {kpi.history.map((h) => (
                      <div
                        key={h.id}
                        className="flex items-center justify-between text-xs text-slate-600 bg-white/50 px-2 py-1 rounded"
                      >
                        <span>
                          {formatValue(h.previousValue, kpi.kpiType.dataType)} →{' '}
                          <span className="font-medium">
                            {formatValue(h.newValue, kpi.kpiType.dataType)}
                          </span>
                          {h.note && (
                            <span className="text-slate-400 ml-1">
                              ({h.note})
                            </span>
                          )}
                        </span>
                        <span className="text-slate-400">
                          {formatDate(h.changedAt)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

