'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, X, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { DateInput } from '@/components/ui/DateInput';
import { Select } from '@/components/ui/Select';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import type { Contract, ContractType, ContractFormData, DeadlineFormData, ContractWithDeadlines } from '@/types';
import { generateContractNumber, DEADLINE_TYPE_OPTIONS, REMINDER_PRESETS } from '@/lib/utils';

interface ContractFormProps {
  contract?: ContractWithDeadlines;
  contractTypes: ContractType[];
  mode: 'create' | 'edit';
}

export const ContractForm = ({ contract, contractTypes, mode }: ContractFormProps) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Existierende Fristen in FormData konvertieren
  const existingDeadlines: DeadlineFormData[] = contract?.deadlines?.map((d) => ({
    id: d.id,
    type: d.type as DeadlineFormData['type'],
    customLabel: d.customLabel || undefined,
    dueDate: new Date(d.dueDate).toISOString().split('T')[0],
    reminderDays: d.reminderDays,
    notifyEmail: d.notifyEmail || undefined,
    isCompleted: d.isCompleted,
  })) || [];

  const [formData, setFormData] = useState<ContractFormData>({
    contractNumber: contract?.contractNumber || generateContractNumber(),
    title: contract?.title || '',
    partner: contract?.partner || '',
    description: contract?.description || '',
    typeId: contract?.typeId || '',
    startDate: contract?.startDate
      ? new Date(contract.startDate).toISOString().split('T')[0]
      : '',
    endDate: contract?.endDate
      ? new Date(contract.endDate).toISOString().split('T')[0]
      : '',
    terminationDate: contract?.terminationDate
      ? new Date(contract.terminationDate).toISOString().split('T')[0]
      : '',
    noticePeriodDays: contract?.noticePeriodDays || 30,
    value: contract?.value || undefined,
    currency: contract?.currency || 'EUR',
    paymentInterval: contract?.paymentInterval || '',
    status: contract?.status || 'ACTIVE',
    autoRenewal: contract?.autoRenewal || false,
    notes: contract?.notes || '',
    reminderDays: contract?.reminderDays || 30,
    deadlines: existingDeadlines,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === 'checkbox'
          ? (e.target as HTMLInputElement).checked
          : type === 'number'
          ? value === '' ? undefined : Number(value)
          : value,
    }));
    // Fehler entfernen bei Eingabe
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) newErrors.title = 'Bezeichnung ist erforderlich';
    if (!formData.partner.trim()) newErrors.partner = 'Vertragspartner ist erforderlich';
    if (!formData.typeId) newErrors.typeId = 'Vertragsart ist erforderlich';
    if (!formData.startDate) newErrors.startDate = 'Startdatum ist erforderlich';

    // Fristen validieren
    formData.deadlines.forEach((deadline, index) => {
      if (!deadline.dueDate) {
        newErrors[`deadline_${index}_dueDate`] = 'Fristdatum ist erforderlich';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Neue Frist hinzufügen
  const handleAddDeadline = () => {
    setFormData((prev) => ({
      ...prev,
      deadlines: [
        ...prev.deadlines,
        {
          type: 'KUENDIGUNG',
          dueDate: '',
          reminderDays: 30,
          notifyEmail: '',
        },
      ],
    }));
  };

  // Frist entfernen
  const handleRemoveDeadline = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      deadlines: prev.deadlines.filter((_, i) => i !== index),
    }));
  };

  // Frist aktualisieren
  const handleDeadlineChange = (
    index: number,
    field: keyof DeadlineFormData,
    value: string | number | boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      deadlines: prev.deadlines.map((deadline, i) =>
        i === index ? { ...deadline, [field]: value } : deadline
      ),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setIsLoading(true);

    try {
      const url = mode === 'create' ? '/api/contracts' : `/api/contracts/${contract?.id}`;
      const method = mode === 'create' ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        router.push('/vertraege');
        router.refresh();
      } else {
        const data = await response.json();
        alert(data.error || 'Fehler beim Speichern');
      }
    } catch (error) {
      console.error('Submit error:', error);
      alert('Fehler beim Speichern des Vertrags');
    } finally {
      setIsLoading(false);
    }
  };

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

  const paymentOptions = [
    { value: '', label: 'Keine Angabe' },
    { value: 'monatlich', label: 'Monatlich' },
    { value: 'vierteljährlich', label: 'Vierteljährlich' },
    { value: 'halbjährlich', label: 'Halbjährlich' },
    { value: 'jährlich', label: 'Jährlich' },
    { value: 'einmalig', label: 'Einmalig' },
  ];

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-6">
        {/* Grunddaten */}
        <Card>
          <CardHeader>
            <CardTitle>Grunddaten</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Vertragsnummer"
              name="contractNumber"
              value={formData.contractNumber}
              onChange={handleChange}
              disabled={mode === 'edit'}
            />
            <Select
              label="Vertragsart"
              name="typeId"
              value={formData.typeId}
              onChange={handleChange}
              options={typeOptions}
              placeholder="Bitte wählen..."
              error={errors.typeId}
            />
            <Input
              label="Bezeichnung"
              name="title"
              value={formData.title}
              onChange={handleChange}
              error={errors.title}
              placeholder="z.B. Büroräume Hauptgebäude"
            />
            <Input
              label="Vertragspartner"
              name="partner"
              value={formData.partner}
              onChange={handleChange}
              error={errors.partner}
              placeholder="z.B. Immobilien GmbH"
            />
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Beschreibung
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                placeholder="Optionale Beschreibung..."
              />
            </div>
          </CardContent>
        </Card>

        {/* Laufzeiten */}
        <Card>
          <CardHeader>
            <CardTitle>Laufzeiten</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <DateInput
              label="Startdatum"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              error={errors.startDate}
            />
            <DateInput
              label="Enddatum"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
            />
            <DateInput
              label="Kündigungsfrist bis"
              name="terminationDate"
              value={formData.terminationDate}
              onChange={handleChange}
              helperText="Datum, bis zu dem gekündigt werden muss"
            />
            <Input
              label="Kündigungsfrist (Tage)"
              name="noticePeriodDays"
              type="number"
              value={formData.noticePeriodDays}
              onChange={handleChange}
              min={0}
            />
            <div className="flex items-center gap-3 pt-6">
              <input
                type="checkbox"
                id="autoRenewal"
                name="autoRenewal"
                checked={formData.autoRenewal}
                onChange={handleChange}
                className="w-4 h-4 text-primary-600 border-slate-300 rounded focus:ring-primary-500"
              />
              <label htmlFor="autoRenewal" className="text-sm text-slate-700">
                Automatische Verlängerung
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Finanzen */}
        <Card>
          <CardHeader>
            <CardTitle>Finanzen</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Input
              label="Vertragswert"
              name="value"
              type="number"
              value={formData.value ?? ''}
              onChange={handleChange}
              min={0}
              step={0.01}
              placeholder="0.00"
            />
            <Select
              label="Währung"
              name="currency"
              value={formData.currency}
              onChange={handleChange}
              options={[
                { value: 'EUR', label: 'Euro (€)' },
                { value: 'USD', label: 'US-Dollar ($)' },
                { value: 'CHF', label: 'Schweizer Franken (CHF)' },
              ]}
            />
            <Select
              label="Zahlungsintervall"
              name="paymentInterval"
              value={formData.paymentInterval || ''}
              onChange={handleChange}
              options={paymentOptions}
            />
          </CardContent>
        </Card>

        {/* Fristen */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Fristen</CardTitle>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleAddDeadline}
                className="gap-1"
              >
                <Plus className="w-4 h-4" />
                Frist hinzufügen
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {formData.deadlines.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-4">
                Noch keine Fristen hinzugefügt. Klicken Sie auf &quot;Frist hinzufügen&quot;.
              </p>
            ) : (
              formData.deadlines.map((deadline, index) => (
                <div
                  key={index}
                  className="p-4 border border-slate-200 rounded-lg space-y-4 bg-slate-50/50"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-700">
                      Frist #{index + 1}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveDeadline(index)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Definition */}
                    <Select
                      label="Definition"
                      value={deadline.type}
                      onChange={(e) =>
                        handleDeadlineChange(index, 'type', e.target.value)
                      }
                      options={DEADLINE_TYPE_OPTIONS.map((opt) => ({
                        value: opt.value,
                        label: opt.label,
                      }))}
                    />
                    {/* Fristdatum */}
                    <DateInput
                      label="Fristdatum"
                      name={`deadline_${index}_dueDate`}
                      value={deadline.dueDate}
                      onChange={(e) =>
                        handleDeadlineChange(index, 'dueDate', e.target.value)
                      }
                      error={errors[`deadline_${index}_dueDate`]}
                    />
                    {/* Benachrichtigung */}
                    <Select
                      label="Benachrichtigung"
                      value={deadline.reminderDays.toString()}
                      onChange={(e) =>
                        handleDeadlineChange(index, 'reminderDays', parseInt(e.target.value))
                      }
                      options={REMINDER_PRESETS.map((opt) => ({
                        value: opt.value.toString(),
                        label: opt.label,
                      }))}
                    />
                    {/* E-Mail */}
                    <Input
                      label="Benachrichtigen an"
                      type="email"
                      value={deadline.notifyEmail || ''}
                      onChange={(e) =>
                        handleDeadlineChange(index, 'notifyEmail', e.target.value)
                      }
                      placeholder="email@beispiel.de"
                    />
                  </div>
                  {/* Optionale benutzerdefinierte Bezeichnung bei Sonstiges */}
                  {deadline.type === 'SONSTIGES' && (
                    <Input
                      label="Benutzerdefinierte Bezeichnung"
                      value={deadline.customLabel || ''}
                      onChange={(e) =>
                        handleDeadlineChange(index, 'customLabel', e.target.value)
                      }
                      placeholder="z.B. Vertragsprüfung Q3"
                    />
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Status & Notizen */}
        <Card>
          <CardHeader>
            <CardTitle>Status & Notizen</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Select
              label="Status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              options={statusOptions}
            />
            <div />
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Notizen
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={4}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                placeholder="Interne Notizen zum Vertrag..."
              />
            </div>
          </CardContent>
        </Card>

        {/* Aktionen */}
        <div className="flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.back()}
          >
            <X className="w-4 h-4 mr-2" />
            Abbrechen
          </Button>
          <Button type="submit" variant="success" isLoading={isLoading}>
            <Save className="w-4 h-4 mr-2" />
            {mode === 'create' ? 'Vertrag erstellen' : 'Änderungen speichern'}
          </Button>
        </div>
      </div>
    </form>
  );
};

