'use client';

import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { DateInput } from '@/components/ui/DateInput';
import type { ContractFormData, ReportDutyFormData } from '@/types';

interface BerichtspflichtenSectionProps {
  formData: ContractFormData;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  onReportDutyChange: (index: number, field: keyof ReportDutyFormData, value: string) => void;
  onAddReportDuty: () => void;
  onRemoveReportDuty: (index: number) => void;
}

const YEARS = ['2024', '2025', '2026', '2027', '2028', '2029'] as const;

export const BerichtspflichtenSection = ({
  formData,
  onChange,
  onReportDutyChange,
  onAddReportDuty,
  onRemoveReportDuty,
}: BerichtspflichtenSectionProps) => {
  return (
    <div className="space-y-6">
      {/* 3.1 Tabellarische Aufstellung */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium text-slate-700">3.1 Berichtspflichten Matrix</h4>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onAddReportDuty}
            className="gap-1"
          >
            <Plus className="w-4 h-4" />
            Zeile hinzufügen
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50">
                <th className="px-3 py-2 text-left font-medium text-slate-700 min-w-[150px]">
                  Berichtsart
                </th>
                {YEARS.map((year) => (
                  <th key={year} className="px-3 py-2 text-center font-medium text-slate-700 min-w-[80px]">
                    {year}
                  </th>
                ))}
                <th className="px-3 py-2 text-left font-medium text-slate-700 min-w-[150px]">
                  Bemerkungen
                </th>
                <th className="px-3 py-2 w-10"></th>
              </tr>
            </thead>
            <tbody>
              {formData.reportDuties.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-3 py-8 text-center text-slate-500">
                    Noch keine Berichtspflichten hinzugefügt.
                  </td>
                </tr>
              ) : (
                formData.reportDuties.map((duty, index) => (
                  <tr key={index} className="border-b border-slate-100">
                    <td className="px-2 py-2">
                      <input
                        type="text"
                        value={duty.reportType}
                        onChange={(e) => onReportDutyChange(index, 'reportType', e.target.value)}
                        className="w-full px-2 py-1 rounded border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                        placeholder="z.B. Zwischenbericht"
                      />
                    </td>
                    {YEARS.map((year) => (
                      <td key={year} className="px-2 py-2">
                        <input
                          type="text"
                          value={duty[`year${year}` as keyof ReportDutyFormData] || ''}
                          onChange={(e) =>
                            onReportDutyChange(index, `year${year}` as keyof ReportDutyFormData, e.target.value)
                          }
                          className="w-full px-2 py-1 rounded border border-slate-200 bg-white text-slate-900 text-sm text-center focus:outline-none focus:ring-1 focus:ring-primary-500"
                          placeholder="X / Datum"
                        />
                      </td>
                    ))}
                    <td className="px-2 py-2">
                      <input
                        type="text"
                        value={duty.remarks || ''}
                        onChange={(e) => onReportDutyChange(index, 'remarks', e.target.value)}
                        className="w-full px-2 py-1 rounded border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                        placeholder="Bemerkungen"
                      />
                    </td>
                    <td className="px-2 py-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => onRemoveReportDuty(index)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3.2 & 3.3: Radio-Buttons und Textfeld */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-3">
            3.2 Sind Berichtspflichten mit der Auszahlung gekoppelt?
          </label>
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="reportsLinkedToPayment"
                value="true"
                checked={formData.reportsLinkedToPayment === true}
                onChange={() => {
                  const event = {
                    target: {
                      name: 'reportsLinkedToPayment',
                      value: 'true',
                      type: 'radio',
                    },
                  } as React.ChangeEvent<HTMLInputElement>;
                  onChange(event);
                }}
                className="w-4 h-4 text-primary-600 border-slate-300 focus:ring-primary-500"
              />
              <span className="text-sm text-slate-700">Ja</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="reportsLinkedToPayment"
                value="false"
                checked={formData.reportsLinkedToPayment === false}
                onChange={() => {
                  const event = {
                    target: {
                      name: 'reportsLinkedToPayment',
                      value: 'false',
                      type: 'radio',
                    },
                  } as React.ChangeEvent<HTMLInputElement>;
                  onChange(event);
                }}
                className="w-4 h-4 text-primary-600 border-slate-300 focus:ring-primary-500"
              />
              <span className="text-sm text-slate-700">Nein</span>
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            3.4 Mittel sind zurückzuzahlen bis
          </label>
          <DateInput
            name="refundDeadline"
            value={formData.refundDeadline || ''}
            onChange={onChange}
            helperText="Wird automatisch als Frist angelegt"
          />
        </div>
      </div>

      {/* 3.3 Weitere Pflichten */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          3.3 Weitere Pflichten
        </label>
        <textarea
          name="additionalObligations"
          value={formData.additionalObligations || ''}
          onChange={onChange}
          rows={4}
          className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
          placeholder="Weitere Berichtspflichten oder Anforderungen..."
        />
      </div>
    </div>
  );
};



