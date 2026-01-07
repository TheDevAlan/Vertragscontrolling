'use client';

import { useMemo } from 'react';
import { Plus, Trash2, AlertTriangle } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import type { ContractFormData, RevenuePlanFormData } from '@/types';

interface UmsatzplanungSectionProps {
  formData: ContractFormData;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  onRevenuePlanChange: (index: number, field: keyof RevenuePlanFormData, value: string | number) => void;
  onAddRevenuePlan: () => void;
  onRemoveRevenuePlan: (index: number) => void;
}

const YEARS = ['2024', '2025', '2026', '2027', '2028', '2029'] as const;

export const UmsatzplanungSection = ({
  formData,
  onChange,
  onRevenuePlanChange,
  onAddRevenuePlan,
  onRemoveRevenuePlan,
}: UmsatzplanungSectionProps) => {
  // Automatische MwSt und Brutto Berechnung
  const calculatedTax = formData.revenueNet ? formData.revenueNet * 0.19 : 0;
  const calculatedGross = formData.revenueNet ? formData.revenueNet * 1.19 : 0;

  // Summen pro Jahr und Gesamt berechnen
  const yearSums = useMemo(() => {
    const sums: Record<string, number> = {};
    YEARS.forEach((year) => {
      sums[year] = formData.revenuePlan.reduce(
        (sum, entry) => sum + (entry[`year${year}` as keyof RevenuePlanFormData] as number || 0),
        0
      );
    });
    return sums;
  }, [formData.revenuePlan]);

  const totalSum = useMemo(() => {
    return YEARS.reduce((sum, year) => sum + (yearSums[year] || 0), 0);
  }, [yearSums]);

  // Warnung wenn Summe nicht mit Umsatz Netto übereinstimmt
  const hasMismatch = formData.revenueNet && Math.abs(totalSum - formData.revenueNet) > 0.01;

  // Zeilen-Summe berechnen
  const getRowTotal = (entry: RevenuePlanFormData) => {
    return YEARS.reduce(
      (sum, year) => sum + (entry[`year${year}` as keyof RevenuePlanFormData] as number || 0),
      0
    );
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
    }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* 2.1 Umsatz: Netto, MwSt, Brutto */}
      <div>
        <h4 className="text-sm font-medium text-slate-700 mb-3">2.1 Umsatz</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="Netto (€)"
            name="revenueNet"
            type="number"
            value={formData.revenueNet ?? ''}
            onChange={onChange}
            min={0}
            step={0.01}
            placeholder="0.00"
          />
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              MwSt 19% (€)
            </label>
            <div className="px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-700">
              {formatCurrency(calculatedTax)}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Brutto (€)
            </label>
            <div className="px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 font-medium">
              {formatCurrency(calculatedGross)}
            </div>
          </div>
        </div>
      </div>

      {/* 2.2 Zahlungsart */}
      <div>
        <h4 className="text-sm font-medium text-slate-700 mb-3">2.2 Zahlungsart</h4>
        <Input
          name="paymentMethod"
          value={formData.paymentMethod || ''}
          onChange={onChange}
          placeholder="z.B. Abschlagszahlungen, Schlusszahlung nach Verwendungsnachweis"
        />
      </div>

      {/* 2.3 Tabellarische Planung */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium text-slate-700">2.3 Umsatzplanung nach Jahren</h4>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onAddRevenuePlan}
            className="gap-1"
          >
            <Plus className="w-4 h-4" />
            Zeile hinzufügen
          </Button>
        </div>

        {/* Warnung bei Abweichung */}
        {hasMismatch && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm">
              <strong>Achtung:</strong> Die Summe der Jahresplanung ({formatCurrency(totalSum)}) 
              stimmt nicht mit dem Umsatz Netto ({formatCurrency(formData.revenueNet || 0)}) überein!
            </span>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50">
                <th className="px-3 py-2 text-left font-medium text-slate-700 min-w-[150px]">
                  Bezeichnung
                </th>
                {YEARS.map((year) => (
                  <th key={year} className="px-3 py-2 text-right font-medium text-slate-700 min-w-[100px]">
                    {year}
                  </th>
                ))}
                <th className="px-3 py-2 text-right font-medium text-slate-700 min-w-[100px]">
                  Gesamt
                </th>
                <th className="px-3 py-2 w-10"></th>
              </tr>
            </thead>
            <tbody>
              {formData.revenuePlan.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-3 py-8 text-center text-slate-500">
                    Noch keine Zeilen hinzugefügt. Klicken Sie auf &quot;Zeile hinzufügen&quot;.
                  </td>
                </tr>
              ) : (
                formData.revenuePlan.map((entry, index) => (
                  <tr key={index} className="border-b border-slate-100">
                    <td className="px-2 py-2">
                      <input
                        type="text"
                        value={entry.label}
                        onChange={(e) => onRevenuePlanChange(index, 'label', e.target.value)}
                        className="w-full px-2 py-1 rounded border border-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                        placeholder="z.B. Eigenleistung"
                      />
                    </td>
                    {YEARS.map((year) => (
                      <td key={year} className="px-2 py-2">
                        <input
                          type="number"
                          value={entry[`year${year}` as keyof RevenuePlanFormData] || ''}
                          onChange={(e) =>
                            onRevenuePlanChange(
                              index,
                              `year${year}` as keyof RevenuePlanFormData,
                              parseFloat(e.target.value) || 0
                            )
                          }
                          className="w-full px-2 py-1 rounded border border-slate-200 text-sm text-right focus:outline-none focus:ring-1 focus:ring-primary-500"
                          min={0}
                          step={0.01}
                        />
                      </td>
                    ))}
                    <td className="px-3 py-2 text-right font-medium text-slate-700">
                      {formatCurrency(getRowTotal(entry))}
                    </td>
                    <td className="px-2 py-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => onRemoveRevenuePlan(index)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
              {/* Summenzeile */}
              {formData.revenuePlan.length > 0 && (
                <tr className="bg-slate-50 font-medium">
                  <td className="px-3 py-2 text-slate-700">Summe</td>
                  {YEARS.map((year) => (
                    <td key={year} className="px-3 py-2 text-right text-slate-700">
                      {formatCurrency(yearSums[year] || 0)}
                    </td>
                  ))}
                  <td className={`px-3 py-2 text-right ${hasMismatch ? 'text-red-600' : 'text-slate-900'}`}>
                    {formatCurrency(totalSum)}
                  </td>
                  <td></td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

