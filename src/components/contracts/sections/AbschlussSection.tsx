'use client';

import { Check } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import type { ContractFormData, ChecklistItemFormData, ChecklistCategory } from '@/types';
import { CHECKLIST_CATEGORIES, getCategoryLabel } from '@/lib/checklistDefaults';

interface AbschlussSectionProps {
  formData: ContractFormData;
  onChecklistChange: (index: number, field: keyof ChecklistItemFormData, value: string | boolean) => void;
}

export const AbschlussSection = ({
  formData,
  onChecklistChange,
}: AbschlussSectionProps) => {
  // Gruppiere Items nach Kategorie
  const getItemsByCategory = (category: ChecklistCategory) => {
    return formData.checklistItems
      .map((item, index) => ({ ...item, originalIndex: index }))
      .filter((item) => item.category === category);
  };

  // Berechne Fortschritt pro Kategorie
  const getCategoryProgress = (category: ChecklistCategory) => {
    const items = formData.checklistItems.filter((item) => item.category === category);
    const completed = items.filter((item) => item.isCompleted).length;
    return { completed, total: items.length };
  };

  // Gesamtfortschritt
  const totalProgress = {
    completed: formData.checklistItems.filter((item) => item.isCompleted).length,
    total: formData.checklistItems.length,
  };

  return (
    <div className="space-y-8">
      {/* Fortschrittsanzeige */}
      <div className="bg-slate-50 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-slate-700">Gesamtfortschritt</span>
          <span className="text-sm font-bold text-primary-600">
            {totalProgress.completed} / {totalProgress.total} erledigt
          </span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-2.5">
          <div
            className="bg-primary-600 h-2.5 rounded-full transition-all duration-300"
            style={{
              width: totalProgress.total > 0
                ? `${(totalProgress.completed / totalProgress.total) * 100}%`
                : '0%',
            }}
          />
        </div>
      </div>

      {/* Kategorien */}
      {CHECKLIST_CATEGORIES.map((category) => {
        const items = getItemsByCategory(category.id);
        const progress = getCategoryProgress(category.id);
        
        if (items.length === 0) return null;

        return (
          <div key={category.id} className="space-y-4">
            {/* Kategorie-Header */}
            <div className="border-b border-slate-200 pb-2">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-slate-800">{category.label}</h4>
                <span className="text-sm text-slate-500">
                  {progress.completed} / {progress.total}
                </span>
              </div>
              {category.description && (
                <p className="text-sm text-slate-600 mt-1">{category.description}</p>
              )}
            </div>

            {/* Tabelle */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="px-3 py-2 text-center font-medium text-slate-700 w-12">
                      ✓
                    </th>
                    <th className="px-3 py-2 text-left font-medium text-slate-700 min-w-[300px]">
                      Aufgabe
                    </th>
                    {category.id !== 'NACHHALTIGKEIT' && (
                      <>
                        <th className="px-3 py-2 text-left font-medium text-slate-700 w-40">
                          Wer?
                        </th>
                        <th className="px-3 py-2 text-left font-medium text-slate-700 min-w-[200px]">
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
                      className={`border-b border-slate-100 ${
                        item.isCompleted ? 'bg-green-50/50' : ''
                      }`}
                    >
                      <td className="px-3 py-3 text-center">
                        <button
                          type="button"
                          onClick={() =>
                            onChecklistChange(item.originalIndex, 'isCompleted', !item.isCompleted)
                          }
                          className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                            item.isCompleted
                              ? 'bg-green-500 border-green-500 text-white'
                              : 'border-slate-300 hover:border-primary-400'
                          }`}
                        >
                          {item.isCompleted && <Check className="w-4 h-4" />}
                        </button>
                      </td>
                      <td className="px-3 py-3">
                        <span
                          className={
                            item.isCompleted ? 'text-slate-500 line-through' : 'text-slate-700'
                          }
                        >
                          {item.label}
                        </span>
                      </td>
                      {category.id !== 'NACHHALTIGKEIT' && (
                        <>
                          <td className="px-2 py-2">
                            <input
                              type="text"
                              value={item.assignee || ''}
                              onChange={(e) =>
                                onChecklistChange(item.originalIndex, 'assignee', e.target.value)
                              }
                              className="w-full px-2 py-1.5 rounded border border-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                              placeholder="Wer?"
                            />
                          </td>
                          <td className="px-2 py-2">
                            <input
                              type="text"
                              value={item.remark || ''}
                              onChange={(e) =>
                                onChecklistChange(item.originalIndex, 'remark', e.target.value)
                              }
                              className="w-full px-2 py-1.5 rounded border border-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
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
          </div>
        );
      })}
    </div>
  );
};


