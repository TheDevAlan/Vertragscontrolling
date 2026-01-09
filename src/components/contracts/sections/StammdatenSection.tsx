'use client';

import { Input } from '@/components/ui/Input';
import { DateInput } from '@/components/ui/DateInput';
import { Select } from '@/components/ui/Select';
import type { ContractFormData, ContractType } from '@/types';

interface StammdatenSectionProps {
  formData: ContractFormData;
  contractTypes: ContractType[];
  errors: Record<string, string>;
  mode: 'create' | 'edit';
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
}

export const StammdatenSection = ({
  formData,
  contractTypes,
  errors,
  mode,
  onChange,
}: StammdatenSectionProps) => {
  const typeOptions = contractTypes.map((type) => ({
    value: type.id,
    label: type.name,
  }));

  const statusOptions = [
    { value: 'ACTIVE', label: 'Aktiv' },
    { value: 'TERMINATED', label: 'Gekündigt' },
    { value: 'EXPIRED', label: 'Abgelaufen' },
    { value: 'DRAFT', label: 'Entwurf' },
  ];

  return (
    <div className="space-y-6">
      {/* 1.1 - 1.3: Projektbezeichnung, Vertragsnummer, ESF-Nummer */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input
          label="Projektbezeichnung *"
          name="title"
          value={formData.title}
          onChange={onChange}
          error={errors.title}
          placeholder="z.B. Förderprojekt XY"
        />
        <Input
          label="Abkürzung"
          name="titleShort"
          value={formData.titleShort || ''}
          onChange={onChange}
          placeholder="z.B. FP-XY"
        />
        <Input
          label="Vertragsnummer *"
          name="contractNumber"
          value={formData.contractNumber}
          onChange={onChange}
          error={errors.contractNumber}
          disabled={mode === 'edit'}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input
          label="ESF-Nummer"
          name="esfNumber"
          value={formData.esfNumber || ''}
          onChange={onChange}
          placeholder="z.B. ESF-2024-001"
        />
        <DateInput
          label="Laufzeit von *"
          name="startDate"
          value={formData.startDate}
          onChange={onChange}
          error={errors.startDate}
        />
        <DateInput
          label="Laufzeit bis"
          name="endDate"
          value={formData.endDate || ''}
          onChange={onChange}
        />
      </div>

      {/* 1.4 - 1.7: Auftraggeber, Vertragsart, Projektleitung, Gesellschaft */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Input
          label="Auftraggeber"
          name="client"
          value={formData.client || ''}
          onChange={onChange}
          placeholder="z.B. Bundesagentur für Arbeit"
        />
        <Select
          label="Vertragsart *"
          name="typeId"
          value={formData.typeId}
          onChange={onChange}
          options={typeOptions}
          placeholder="Bitte wählen..."
          error={errors.typeId}
        />
        <Input
          label="Projektleitung"
          name="projectLead"
          value={formData.projectLead || ''}
          onChange={onChange}
          placeholder="Name der Projektleitung"
        />
        <Input
          label="Gesellschaft"
          name="company"
          value={formData.company || ''}
          onChange={onChange}
          placeholder="z.B. GmbH"
        />
      </div>

      {/* 1.8 - 1.10: Kostenstelle, Grundlage, Vertragspartner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input
          label="Kostenstelle"
          name="costCenter"
          value={formData.costCenter || ''}
          onChange={onChange}
          placeholder="z.B. 4711"
        />
        <Input
          label="Grundlage (Angebot/Kalkulation)"
          name="basisDocument"
          value={formData.basisDocument || ''}
          onChange={onChange}
          placeholder="z.B. Angebot vom 01.01.2024"
        />
        <Input
          label="Vertragspartner *"
          name="partner"
          value={formData.partner}
          onChange={onChange}
          error={errors.partner}
          placeholder="z.B. Ministerium für Arbeit"
        />
      </div>

      {/* 1.11: Checkbox und Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-center gap-3 pt-6">
          <input
            type="checkbox"
            id="dataMatchesContract"
            name="dataMatchesContract"
            checked={formData.dataMatchesContract}
            onChange={onChange}
            className="w-4 h-4 text-primary-600 border-slate-300 rounded focus:ring-primary-500"
          />
          <label htmlFor="dataMatchesContract" className="text-sm text-slate-700">
            Daten entsprechen dem Vertrag/Zuwendungsbescheid
          </label>
        </div>
        <Select
          label="Status"
          name="status"
          value={formData.status}
          onChange={onChange}
          options={statusOptions}
        />
      </div>

      {/* Beschreibung */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          Beschreibung
        </label>
        <textarea
          name="description"
          value={formData.description || ''}
          onChange={onChange}
          rows={3}
          className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
          placeholder="Optionale Beschreibung zum Projekt..."
        />
      </div>
    </div>
  );
};



