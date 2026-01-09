'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Check,
  Save,
  Loader2,
  FileSpreadsheet,
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent } from '@/components/ui/Card';
import { CHECKLIST_CATEGORIES, generateDefaultChecklist } from '@/lib/checklistDefaults';
import type { ChecklistCategory, ChecklistItemFormData } from '@/types';

interface ChecklistItem {
  id: string;
  category: ChecklistCategory;
  label: string;
  assignee: string | null;
  remark: string | null;
  isCompleted: boolean;
}

interface Contract {
  id: string;
  title: string;
  contractNumber: string;
  checklistItems: ChecklistItem[];
}

export default function AbschlussPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [contract, setContract] = useState<Contract | null>(null);
  const [checklistItems, setChecklistItems] = useState<ChecklistItemFormData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Vertrag laden
  useEffect(() => {
    const fetchContract = async () => {
      try {
        const res = await fetch(`/api/contracts/${params.id}`);
        const data = await res.json();
        
        if (data.success && data.data) {
          setContract(data.data);
          
          // Wenn keine Checklisten-Items existieren, Standard-Items generieren
          if (data.data.checklistItems && data.data.checklistItems.length > 0) {
            setChecklistItems(data.data.checklistItems.map((item: ChecklistItem) => ({
              id: item.id,
              category: item.category,
              label: item.label,
              assignee: item.assignee || '',
              remark: item.remark || '',
              isCompleted: item.isCompleted,
            })));
          } else {
            // Generiere Standard-Checkliste für bestehende Verträge
            setChecklistItems(generateDefaultChecklist());
            setHasChanges(true); // Markiere als geändert, damit gespeichert wird
          }
        }
      } catch (error) {
        console.error('Error fetching contract:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContract();
  }, [params.id]);

  // Handler für Änderungen
  const handleChecklistChange = (
    index: number,
    field: keyof ChecklistItemFormData,
    value: string | boolean
  ) => {
    setChecklistItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
    setHasChanges(true);
  };

  // Speichern
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/contracts/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ checklistItems }),
      });

      if (res.ok) {
        setHasChanges(false);
        // Erfolgsmeldung könnte hier hinzugefügt werden
      }
    } catch (error) {
      console.error('Error saving checklist:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Excel Export
  const handleExport = async () => {
    setIsExporting(true);
    try {
      const res = await fetch(`/api/contracts/${params.id}/abschluss-export`);
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Abschluss-Checkliste_${contract?.contractNumber || params.id}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Error exporting checklist:', error);
    } finally {
      setIsExporting(false);
    }
  };

  // Fortschritt berechnen (ohne Nachhaltigkeit-Kategorie)
  const getProgress = () => {
    // Nachhaltigkeit-Items aus dem Gesamtfortschritt ausschließen
    const relevantItems = checklistItems.filter((item) => item.category !== 'NACHHALTIGKEIT');
    const completed = relevantItems.filter((item) => item.isCompleted).length;
    const total = relevantItems.length;
    return { completed, total, percent: total > 0 ? (completed / total) * 100 : 0 };
  };

  // Items nach Kategorie filtern
  const getItemsByCategory = (category: ChecklistCategory) => {
    return checklistItems
      .map((item, index) => ({ ...item, originalIndex: index }))
      .filter((item) => item.category === category);
  };

  // Kategorie-Fortschritt
  const getCategoryProgress = (category: ChecklistCategory) => {
    const items = checklistItems.filter((item) => item.category === category);
    const completed = items.filter((item) => item.isCompleted).length;
    return { completed, total: items.length };
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
          </div>
        </main>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center text-slate-500">Vertrag nicht gefunden</p>
        </main>
      </div>
    );
  }

  const progress = getProgress();

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={`/vertraege/${params.id}`}
            className="inline-flex items-center text-sm text-slate-600 hover:text-primary-600 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Zurück zum Vertrag
          </Link>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Abschluss-Checkliste
              </h1>
              <p className="text-slate-600 mt-1">
                {contract.title} ({contract.contractNumber})
              </p>
            </div>
            <div className="flex items-center gap-3">
              {hasChanges && (
                <span className="text-sm text-amber-600">Ungespeicherte Änderungen</span>
              )}
              <Button
                onClick={handleExport}
                variant="secondary"
                disabled={isExporting}
              >
                {isExporting ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <FileSpreadsheet className="w-4 h-4 mr-2" />
                )}
                Excel Export
              </Button>
              <Button
                onClick={handleSave}
                variant="success"
                disabled={!hasChanges || isSaving}
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Speichern
              </Button>
            </div>
          </div>
        </div>

        {/* Gesamtfortschritt */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-lg font-semibold text-slate-800">Gesamtfortschritt</span>
              <div className="flex items-center gap-3">
                <Badge 
                  variant={progress.completed === progress.total ? 'success' : progress.completed > 0 ? 'warning' : 'default'}
                  size="lg"
                >
                  {progress.completed} / {progress.total} erledigt
                </Badge>
                <span className="text-2xl font-bold text-primary-600">
                  {Math.round(progress.percent)}%
                </span>
              </div>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-4">
              <div
                className={`h-4 rounded-full transition-all duration-500 ${
                  progress.percent === 100 ? 'bg-green-500' : 'bg-primary-600'
                }`}
                style={{ width: `${progress.percent}%` }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Kategorien */}
        <div className="space-y-6">
          {CHECKLIST_CATEGORIES.map((category) => {
            const items = getItemsByCategory(category.id);
            const catProgress = getCategoryProgress(category.id);

            if (items.length === 0) return null;

            return (
              <Card key={category.id}>
                <CardContent className="p-0">
                  {/* Kategorie-Header */}
                  <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-semibold text-slate-800">
                        {category.label}
                      </h2>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-slate-500">
                          {catProgress.completed} / {catProgress.total}
                        </span>
                        <div className="w-24 bg-slate-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-300 ${
                              catProgress.completed === catProgress.total ? 'bg-green-500' : 'bg-primary-600'
                            }`}
                            style={{
                              width: catProgress.total > 0
                                ? `${(catProgress.completed / catProgress.total) * 100}%`
                                : '0%',
                            }}
                          />
                        </div>
                      </div>
                    </div>
                    {category.description && (
                      <p className="text-sm text-slate-600 mt-2">{category.description}</p>
                    )}
                  </div>

                  {/* Tabelle */}
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-slate-50/50">
                          <th className="px-4 py-3 text-center font-medium text-slate-700 w-16">
                            Status
                          </th>
                          <th className="px-4 py-3 text-left font-medium text-slate-700">
                            Aufgabe
                          </th>
                          {category.id !== 'NACHHALTIGKEIT' && (
                            <>
                              <th className="px-4 py-3 text-left font-medium text-slate-700 w-48">
                                Wer?
                              </th>
                              <th className="px-4 py-3 text-left font-medium text-slate-700 w-64">
                                Bemerkung
                              </th>
                            </>
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {items.map((item) => (
                          <tr
                            key={item.originalIndex}
                            className={`border-b border-slate-100 transition-colors ${
                              item.isCompleted ? 'bg-green-50/50' : 'hover:bg-slate-50/50'
                            }`}
                          >
                            <td className="px-4 py-4 text-center">
                              <button
                                type="button"
                                onClick={() =>
                                  handleChecklistChange(
                                    item.originalIndex,
                                    'isCompleted',
                                    !item.isCompleted
                                  )
                                }
                                className={`w-7 h-7 rounded-md border-2 flex items-center justify-center transition-all ${
                                  item.isCompleted
                                    ? 'bg-green-500 border-green-500 text-white'
                                    : 'border-slate-300 hover:border-primary-400 hover:bg-primary-50'
                                }`}
                              >
                                {item.isCompleted && <Check className="w-5 h-5" />}
                              </button>
                            </td>
                            <td className="px-4 py-4">
                              <span
                                className={`${
                                  item.isCompleted
                                    ? 'text-slate-500 line-through'
                                    : 'text-slate-800'
                                }`}
                              >
                                {item.label}
                              </span>
                            </td>
                            {category.id !== 'NACHHALTIGKEIT' && (
                              <>
                                <td className="px-4 py-4">
                                  <input
                                    type="text"
                                    value={item.assignee || ''}
                                    onChange={(e) =>
                                      handleChecklistChange(
                                        item.originalIndex,
                                        'assignee',
                                        e.target.value
                                      )
                                    }
                                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                                    placeholder="Wer?"
                                  />
                                </td>
                                <td className="px-4 py-4">
                                  <input
                                    type="text"
                                    value={item.remark || ''}
                                    onChange={(e) =>
                                      handleChecklistChange(
                                        item.originalIndex,
                                        'remark',
                                        e.target.value
                                      )
                                    }
                                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                                    placeholder="Bemerkung"
                                  />
                                </td>
                              </>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Footer mit Speichern-Button */}
        <div className="mt-8 flex justify-end">
          <Button
            onClick={handleSave}
            variant="success"
            size="lg"
            disabled={!hasChanges || isSaving}
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Änderungen speichern
          </Button>
        </div>
      </main>
    </div>
  );
}

