'use client';

import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { DateInput } from '@/components/ui/DateInput';
import type { ContractFormData, ProofOfUseFormData } from '@/types';

interface VerwendungsnachweisSectionProps {
  formData: ContractFormData;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  onProofOfUseChange: (index: number, field: keyof ProofOfUseFormData, value: string | number | boolean) => void;
  onAddProofOfUse: () => void;
  onRemoveProofOfUse: (index: number) => void;
}

export const VerwendungsnachweisSection = ({
  formData,
  onChange,
  onProofOfUseChange,
  onAddProofOfUse,
  onRemoveProofOfUse,
}: VerwendungsnachweisSectionProps) => {
  return (
    <div className="space-y-6">
      {/* 4.1 Konditionale Anzeige */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-3">
          4.1 Verwendungsnachweis erforderlich?
        </label>
        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="proofOfUseRequired"
              value="true"
              checked={formData.proofOfUseRequired === true}
              onChange={() => {
                const event = {
                  target: {
                    name: 'proofOfUseRequired',
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
              name="proofOfUseRequired"
              value="false"
              checked={formData.proofOfUseRequired === false}
              onChange={() => {
                const event = {
                  target: {
                    name: 'proofOfUseRequired',
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

      {/* 4.2 Tabelle - nur anzeigen wenn erforderlich */}
      {formData.proofOfUseRequired && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-slate-700">4.2 Verwendungsnachweise</h4>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={onAddProofOfUse}
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
                  <th className="px-3 py-2 text-center font-medium text-slate-700 w-20">
                    Lfd.-Nr.
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-slate-700 min-w-[120px]">
                    Termin
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-slate-700 min-w-[200px]">
                    Art des VN/Abrechnung
                  </th>
                  <th className="px-3 py-2 text-center font-medium text-slate-700 min-w-[180px]">
                    WP-Testat notwendig
                  </th>
                  <th className="px-3 py-2 w-10"></th>
                </tr>
              </thead>
              <tbody>
                {formData.proofOfUseItems.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-3 py-8 text-center text-slate-500">
                      Noch keine Verwendungsnachweise hinzugefügt.
                    </td>
                  </tr>
                ) : (
                  formData.proofOfUseItems.map((item, index) => (
                    <tr key={index} className="border-b border-slate-100">
                      <td className="px-2 py-2">
                        <input
                          type="number"
                          value={item.sequenceNumber}
                          onChange={(e) =>
                            onProofOfUseChange(index, 'sequenceNumber', parseInt(e.target.value) || 0)
                          }
                          className="w-full px-2 py-1 rounded border border-slate-200 text-sm text-center focus:outline-none focus:ring-1 focus:ring-primary-500"
                          min={1}
                        />
                      </td>
                      <td className="px-2 py-2">
                        <DateInput
                          name={`proofOfUse_${index}_dueDate`}
                          value={item.dueDate}
                          onChange={(e) => onProofOfUseChange(index, 'dueDate', e.target.value)}
                        />
                      </td>
                      <td className="px-2 py-2">
                        <input
                          type="text"
                          value={item.proofType}
                          onChange={(e) => onProofOfUseChange(index, 'proofType', e.target.value)}
                          className="w-full px-2 py-1 rounded border border-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                          placeholder="z.B. Zwischenverwendungsnachweis"
                        />
                      </td>
                      <td className="px-2 py-2 text-center">
                        <input
                          type="checkbox"
                          checked={item.auditorRequired}
                          onChange={(e) =>
                            onProofOfUseChange(index, 'auditorRequired', e.target.checked)
                          }
                          className="w-4 h-4 text-primary-600 border-slate-300 rounded focus:ring-primary-500"
                        />
                      </td>
                      <td className="px-2 py-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => onRemoveProofOfUse(index)}
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
      )}

      {/* 4.3 Weitere Bemerkungen */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          4.3 Weitere besondere Anforderungen bzw. Bemerkungen zum Verwendungsnachweis
        </label>
        <textarea
          name="proofOfUseRemarks"
          value={formData.proofOfUseRemarks || ''}
          onChange={onChange}
          rows={4}
          className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
          placeholder="Besondere Anforderungen an den Verwendungsnachweis..."
        />
      </div>
    </div>
  );
};

