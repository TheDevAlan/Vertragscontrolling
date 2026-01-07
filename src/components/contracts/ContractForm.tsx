'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Save,
  X,
  Plus,
  Trash2,
  FileText,
  Euro,
  ClipboardList,
  FileCheck,
  BarChart3,
  Clock,
  CheckSquare,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { DateInput } from '@/components/ui/DateInput';
import { Select } from '@/components/ui/Select';
import { Accordion, AccordionGroup } from '@/components/ui/Accordion';
import { Badge } from '@/components/ui/Badge';
import { StammdatenSection } from './sections/StammdatenSection';
import { UmsatzplanungSection } from './sections/UmsatzplanungSection';
import { BerichtspflichtenSection } from './sections/BerichtspflichtenSection';
import { VerwendungsnachweisSection } from './sections/VerwendungsnachweisSection';
import { AbschlussSection } from './sections/AbschlussSection';
import type {
  ContractType,
  ContractFormData,
  DeadlineFormData,
  KpiFormData,
  KpiType,
  ContractFull,
  RevenuePlanFormData,
  ReportDutyFormData,
  ProofOfUseFormData,
  ChecklistItemFormData,
} from '@/types';
import { generateContractNumber, DEADLINE_TYPE_OPTIONS, REMINDER_PRESETS } from '@/lib/utils';
import { generateDefaultChecklist } from '@/lib/checklistDefaults';

interface ContractFormProps {
  contract?: ContractFull;
  contractTypes: ContractType[];
  kpiTypes: KpiType[];
  mode: 'create' | 'edit';
}

export const ContractForm = ({ contract, contractTypes, kpiTypes, mode }: ContractFormProps) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Existierende Daten konvertieren
  const existingDeadlines: DeadlineFormData[] = contract?.deadlines?.map((d) => ({
    id: d.id,
    type: d.type as DeadlineFormData['type'],
    customLabel: d.customLabel || undefined,
    dueDate: new Date(d.dueDate).toISOString().split('T')[0],
    reminderDays: d.reminderDays,
    notifyEmail: d.notifyEmail || undefined,
    isCompleted: d.isCompleted,
  })) || [];

  const existingKpis: KpiFormData[] = contract?.kpis?.map((k) => ({
    id: k.id,
    kpiTypeId: k.kpiTypeId,
    targetValue: k.targetValue,
    currentValue: k.currentValue,
    dueDate: k.dueDate ? new Date(k.dueDate).toISOString().split('T')[0] : undefined,
  })) || [];

  const existingRevenuePlan: RevenuePlanFormData[] = contract?.revenuePlan?.map((r) => ({
    id: r.id,
    label: r.label,
    year2024: r.year2024,
    year2025: r.year2025,
    year2026: r.year2026,
    year2027: r.year2027,
    year2028: r.year2028,
    year2029: r.year2029,
  })) || [];

  const existingReportDuties: ReportDutyFormData[] = contract?.reportDuties?.map((r) => ({
    id: r.id,
    reportType: r.reportType,
    year2024: r.year2024 || undefined,
    year2025: r.year2025 || undefined,
    year2026: r.year2026 || undefined,
    year2027: r.year2027 || undefined,
    year2028: r.year2028 || undefined,
    year2029: r.year2029 || undefined,
    remarks: r.remarks || undefined,
  })) || [];

  const existingProofOfUse: ProofOfUseFormData[] = contract?.proofOfUseItems?.map((p) => ({
    id: p.id,
    sequenceNumber: p.sequenceNumber,
    dueDate: new Date(p.dueDate).toISOString().split('T')[0],
    proofType: p.proofType,
    auditorRequired: p.auditorRequired,
  })) || [];

  // Checkliste: Existierende Daten oder Standard-Items generieren
  const existingChecklistItems: ChecklistItemFormData[] = contract?.checklistItems?.map((c) => ({
    id: c.id,
    category: c.category,
    label: c.label,
    assignee: c.assignee || '',
    remark: c.remark || '',
    isCompleted: c.isCompleted,
  })) || generateDefaultChecklist();

  const [formData, setFormData] = useState<ContractFormData>({
    // Sektion 1: Stammdaten
    contractNumber: contract?.contractNumber || generateContractNumber(),
    title: contract?.title || '',
    titleShort: contract?.titleShort || '',
    partner: contract?.partner || '',
    description: contract?.description || '',
    esfNumber: contract?.esfNumber || '',
    client: contract?.client || '',
    projectLead: contract?.projectLead || '',
    company: contract?.company || '',
    costCenter: contract?.costCenter || '',
    basisDocument: contract?.basisDocument || '',
    dataMatchesContract: contract?.dataMatchesContract ?? true,
    typeId: contract?.typeId || '',
    startDate: contract?.startDate ? new Date(contract.startDate).toISOString().split('T')[0] : '',
    endDate: contract?.endDate ? new Date(contract.endDate).toISOString().split('T')[0] : '',
    status: contract?.status || 'ACTIVE',
    
    // Legacy
    terminationDate: contract?.terminationDate ? new Date(contract.terminationDate).toISOString().split('T')[0] : '',
    noticePeriodDays: contract?.noticePeriodDays || 30,
    value: contract?.value || undefined,
    currency: contract?.currency || 'EUR',
    paymentInterval: contract?.paymentInterval || '',
    autoRenewal: contract?.autoRenewal || false,
    
    // Sektion 2: Umsatzplanung
    revenueNet: contract?.revenueNet || undefined,
    revenueTax: contract?.revenueTax || undefined,
    revenueGross: contract?.revenueGross || undefined,
    paymentMethod: contract?.paymentMethod || '',
    revenuePlan: existingRevenuePlan,
    
    // Sektion 3: Berichtspflichten
    reportsLinkedToPayment: contract?.reportsLinkedToPayment || false,
    additionalObligations: contract?.additionalObligations || '',
    refundDeadline: contract?.refundDeadline ? new Date(contract.refundDeadline).toISOString().split('T')[0] : '',
    reportDuties: existingReportDuties,
    
    // Sektion 4: Verwendungsnachweis
    proofOfUseRequired: contract?.proofOfUseRequired || false,
    proofOfUseRemarks: contract?.proofOfUseRemarks || '',
    proofOfUseItems: existingProofOfUse,
    
    // Sonstige
    notes: contract?.notes || '',
    reminderDays: contract?.reminderDays || 30,
    
    // Sektion 5 & 6
    deadlines: existingDeadlines,
    kpis: existingKpis,
    
    // Sektion 7: Abschluss-Checkliste
    checklistItems: existingChecklistItems,
  });

  // === HANDLER FUNKTIONEN ===

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    
    // Spezielle Behandlung für Radio-Buttons
    if (type === 'radio') {
      setFormData((prev) => ({
        ...prev,
        [name]: value === 'true',
      }));
      return;
    }
    
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === 'checkbox'
          ? (e.target as HTMLInputElement).checked
          : type === 'number'
          ? value === '' ? undefined : Number(value)
          : value,
    }));
    
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  // Revenue Plan Handler
  const handleRevenuePlanChange = (
    index: number,
    field: keyof RevenuePlanFormData,
    value: string | number
  ) => {
    setFormData((prev) => ({
      ...prev,
      revenuePlan: prev.revenuePlan.map((entry, i) =>
        i === index ? { ...entry, [field]: value } : entry
      ),
    }));
  };

  const handleAddRevenuePlan = () => {
    setFormData((prev) => ({
      ...prev,
      revenuePlan: [
        ...prev.revenuePlan,
        { label: '', year2024: 0, year2025: 0, year2026: 0, year2027: 0, year2028: 0, year2029: 0 },
      ],
    }));
  };

  const handleRemoveRevenuePlan = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      revenuePlan: prev.revenuePlan.filter((_, i) => i !== index),
    }));
  };

  // Report Duty Handler
  const handleReportDutyChange = (
    index: number,
    field: keyof ReportDutyFormData,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      reportDuties: prev.reportDuties.map((entry, i) =>
        i === index ? { ...entry, [field]: value } : entry
      ),
    }));
  };

  const handleAddReportDuty = () => {
    setFormData((prev) => ({
      ...prev,
      reportDuties: [
        ...prev.reportDuties,
        { reportType: '' },
      ],
    }));
  };

  const handleRemoveReportDuty = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      reportDuties: prev.reportDuties.filter((_, i) => i !== index),
    }));
  };

  // Proof of Use Handler
  const handleProofOfUseChange = (
    index: number,
    field: keyof ProofOfUseFormData,
    value: string | number | boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      proofOfUseItems: prev.proofOfUseItems.map((entry, i) =>
        i === index ? { ...entry, [field]: value } : entry
      ),
    }));
  };

  const handleAddProofOfUse = () => {
    const nextSeqNum = formData.proofOfUseItems.length + 1;
    setFormData((prev) => ({
      ...prev,
      proofOfUseItems: [
        ...prev.proofOfUseItems,
        { sequenceNumber: nextSeqNum, dueDate: '', proofType: '', auditorRequired: false },
      ],
    }));
  };

  const handleRemoveProofOfUse = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      proofOfUseItems: prev.proofOfUseItems.filter((_, i) => i !== index),
    }));
  };

  // Deadline Handler
  const handleAddDeadline = () => {
    setFormData((prev) => ({
      ...prev,
      deadlines: [
        ...prev.deadlines,
        { type: 'KUENDIGUNG', dueDate: '', reminderDays: 30, notifyEmail: '' },
      ],
    }));
  };

  const handleRemoveDeadline = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      deadlines: prev.deadlines.filter((_, i) => i !== index),
    }));
  };

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

  // KPI Handler
  const handleAddKpi = () => {
    const usedKpiTypeIds = formData.kpis.map((k) => k.kpiTypeId);
    const availableKpiType = kpiTypes.find((t) => !usedKpiTypeIds.includes(t.id));
    
    if (!availableKpiType) {
      alert('Alle verfügbaren Kennzahlen wurden bereits hinzugefügt.');
      return;
    }

    setFormData((prev) => ({
      ...prev,
      kpis: [
        ...prev.kpis,
        { kpiTypeId: availableKpiType.id, targetValue: 0, currentValue: 0, dueDate: '' },
      ],
    }));
  };

  const handleRemoveKpi = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      kpis: prev.kpis.filter((_, i) => i !== index),
    }));
  };

  const handleKpiChange = (
    index: number,
    field: keyof KpiFormData,
    value: string | number
  ) => {
    setFormData((prev) => ({
      ...prev,
      kpis: prev.kpis.map((kpi, i) =>
        i === index ? { ...kpi, [field]: value } : kpi
      ),
    }));
  };

  // Checklist Handler
  const handleChecklistChange = (
    index: number,
    field: keyof ChecklistItemFormData,
    value: string | boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      checklistItems: prev.checklistItems.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const getAvailableKpiOptions = (currentKpiTypeId: string) => {
    const usedKpiTypeIds = formData.kpis
      .map((k) => k.kpiTypeId)
      .filter((id) => id !== currentKpiTypeId);
    
    return kpiTypes
      .filter((t) => !usedKpiTypeIds.includes(t.id))
      .map((t) => ({ value: t.id, label: t.name }));
  };

  const getKpiType = (kpiTypeId: string) => {
    return kpiTypes.find((t) => t.id === kpiTypeId);
  };

  // Validierung
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) newErrors.title = 'Projektbezeichnung ist erforderlich';
    if (!formData.contractNumber.trim()) newErrors.contractNumber = 'Vertragsnummer ist erforderlich';
    if (!formData.partner.trim()) newErrors.partner = 'Vertragspartner ist erforderlich';
    if (!formData.typeId) newErrors.typeId = 'Vertragsart ist erforderlich';
    if (!formData.startDate) newErrors.startDate = 'Laufzeit von ist erforderlich';

    formData.deadlines.forEach((deadline, index) => {
      if (!deadline.dueDate) {
        newErrors[`deadline_${index}_dueDate`] = 'Fristdatum ist erforderlich';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit
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

  return (
    <form onSubmit={handleSubmit}>
      <AccordionGroup className="space-y-4">
        {/* Sektion 1: Stammdaten */}
        <Accordion
          title="1. Stammdaten"
          icon={<FileText className="w-5 h-5" />}
          defaultOpen={true}
          badge={
            formData.contractNumber && formData.title ? (
              <Badge variant="success" size="sm">Ausgefüllt</Badge>
            ) : (
              <Badge variant="warning" size="sm">Pflichtfelder</Badge>
            )
          }
        >
          <StammdatenSection
            formData={formData}
            contractTypes={contractTypes}
            errors={errors}
            mode={mode}
            onChange={handleChange}
          />
        </Accordion>

        {/* Sektion 2: Umsatzplanung & Finanzen */}
        <Accordion
          title="2. Umsatzplanung & Finanzen"
          icon={<Euro className="w-5 h-5" />}
          badge={
            formData.revenueNet ? (
              <Badge variant="success" size="sm">
                {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(formData.revenueNet)}
              </Badge>
            ) : undefined
          }
        >
          <UmsatzplanungSection
            formData={formData}
            onChange={handleChange}
            onRevenuePlanChange={handleRevenuePlanChange}
            onAddRevenuePlan={handleAddRevenuePlan}
            onRemoveRevenuePlan={handleRemoveRevenuePlan}
          />
        </Accordion>

        {/* Sektion 3: Berichtspflichten */}
        <Accordion
          title="3. Berichtspflichten"
          icon={<ClipboardList className="w-5 h-5" />}
          badge={
            formData.reportDuties.length > 0 ? (
              <Badge variant="info" size="sm">{formData.reportDuties.length} Einträge</Badge>
            ) : undefined
          }
        >
          <BerichtspflichtenSection
            formData={formData}
            onChange={handleChange}
            onReportDutyChange={handleReportDutyChange}
            onAddReportDuty={handleAddReportDuty}
            onRemoveReportDuty={handleRemoveReportDuty}
          />
        </Accordion>

        {/* Sektion 4: Verwendungsnachweis */}
        <Accordion
          title="4. Verwendungsnachweis"
          icon={<FileCheck className="w-5 h-5" />}
          badge={
            formData.proofOfUseRequired ? (
              <Badge variant="warning" size="sm">Erforderlich</Badge>
            ) : (
              <Badge variant="default" size="sm">Nicht erforderlich</Badge>
            )
          }
        >
          <VerwendungsnachweisSection
            formData={formData}
            onChange={handleChange}
            onProofOfUseChange={handleProofOfUseChange}
            onAddProofOfUse={handleAddProofOfUse}
            onRemoveProofOfUse={handleRemoveProofOfUse}
          />
        </Accordion>

        {/* Sektion 5: Kennzahlen */}
        {kpiTypes.length > 0 && (
          <Accordion
            title="5. Steuerung von Kennzahlen"
            icon={<BarChart3 className="w-5 h-5" />}
            badge={
              formData.kpis.length > 0 ? (
                <Badge variant="info" size="sm">{formData.kpis.length} KPIs</Badge>
              ) : undefined
            }
          >
            <div className="space-y-4">
              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={handleAddKpi}
                  disabled={formData.kpis.length >= kpiTypes.length}
                  className="gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Kennzahl hinzufügen
                </Button>
              </div>

              {formData.kpis.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-4">
                  Noch keine Kennzahlen hinzugefügt.
                </p>
              ) : (
                <div className="space-y-3">
                  {formData.kpis.map((kpi, index) => {
                    const kpiType = getKpiType(kpi.kpiTypeId);
                    const unitLabel = kpiType?.dataType === 'PERCENT' ? '%' : 
                                      kpiType?.dataType === 'CURRENCY' ? '€' : '';
                    return (
                      <div
                        key={index}
                        className="p-4 border border-slate-200 rounded-lg bg-slate-50/50 space-y-4"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-slate-700">
                            Kennzahl #{index + 1}
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveKpi(index)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          <Select
                            label="Kennzahl"
                            value={kpi.kpiTypeId}
                            onChange={(e) => handleKpiChange(index, 'kpiTypeId', e.target.value)}
                            options={getAvailableKpiOptions(kpi.kpiTypeId)}
                          />
                          <Input
                            label={`Zielwert ${unitLabel}`}
                            type="number"
                            value={kpi.targetValue}
                            onChange={(e) => handleKpiChange(index, 'targetValue', parseFloat(e.target.value) || 0)}
                            min={0}
                            step={kpiType?.dataType === 'PERCENT' ? 1 : 0.01}
                          />
                          <DateInput
                            label="Fristdatum"
                            name={`kpi_${index}_dueDate`}
                            value={kpi.dueDate || ''}
                            onChange={(e) => handleKpiChange(index, 'dueDate', e.target.value)}
                          />
                          {mode === 'edit' && (
                            <Input
                              label={`Aktueller Wert ${unitLabel}`}
                              type="number"
                              value={kpi.currentValue || 0}
                              onChange={(e) => handleKpiChange(index, 'currentValue', parseFloat(e.target.value) || 0)}
                              min={0}
                              step={kpiType?.dataType === 'PERCENT' ? 1 : 0.01}
                            />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </Accordion>
        )}

        {/* Sektion 6: Fristen */}
        <Accordion
          title="6. Fristen"
          icon={<Clock className="w-5 h-5" />}
          badge={
            formData.deadlines.length > 0 ? (
              <Badge variant="info" size="sm">{formData.deadlines.length} Fristen</Badge>
            ) : undefined
          }
        >
          <div className="space-y-4">
            <div className="flex justify-end">
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

            {formData.deadlines.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-4">
                Noch keine Fristen hinzugefügt.
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
                    <Select
                      label="Definition"
                      value={deadline.type}
                      onChange={(e) => handleDeadlineChange(index, 'type', e.target.value)}
                      options={DEADLINE_TYPE_OPTIONS.map((opt) => ({
                        value: opt.value,
                        label: opt.label,
                      }))}
                    />
                    <DateInput
                      label="Fristdatum"
                      name={`deadline_${index}_dueDate`}
                      value={deadline.dueDate}
                      onChange={(e) => handleDeadlineChange(index, 'dueDate', e.target.value)}
                      error={errors[`deadline_${index}_dueDate`]}
                    />
                    <Select
                      label="Benachrichtigung"
                      value={deadline.reminderDays.toString()}
                      onChange={(e) => handleDeadlineChange(index, 'reminderDays', parseInt(e.target.value))}
                      options={REMINDER_PRESETS.map((opt) => ({
                        value: opt.value.toString(),
                        label: opt.label,
                      }))}
                    />
                    <Input
                      label="Benachrichtigen an"
                      type="email"
                      value={deadline.notifyEmail || ''}
                      onChange={(e) => handleDeadlineChange(index, 'notifyEmail', e.target.value)}
                      placeholder="email@beispiel.de"
                    />
                  </div>
                  {deadline.type === 'SONSTIGES' && (
                    <Input
                      label="Benutzerdefinierte Bezeichnung"
                      value={deadline.customLabel || ''}
                      onChange={(e) => handleDeadlineChange(index, 'customLabel', e.target.value)}
                      placeholder="z.B. Vertragsprüfung Q3"
                    />
                  )}
                </div>
              ))
            )}
          </div>
        </Accordion>

        {/* Sektion 7: Abschluss-Checkliste */}
        <Accordion
          title="7. Abschluss"
          icon={<CheckSquare className="w-5 h-5" />}
          badge={(() => {
            const completed = formData.checklistItems.filter((item) => item.isCompleted).length;
            const total = formData.checklistItems.length;
            if (total === 0) return undefined;
            return (
              <Badge 
                variant={completed === total ? 'success' : completed > 0 ? 'warning' : 'default'} 
                size="sm"
              >
                {completed} / {total}
              </Badge>
            );
          })()}
        >
          <AbschlussSection
            formData={formData}
            onChecklistChange={handleChecklistChange}
          />
        </Accordion>

        {/* Notizen */}
        <Accordion title="Notizen" defaultOpen={false}>
          <textarea
            name="notes"
            value={formData.notes || ''}
            onChange={handleChange}
            rows={4}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
            placeholder="Interne Notizen zum Vertrag..."
          />
        </Accordion>
      </AccordionGroup>

      {/* Aktionen */}
      <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-slate-200">
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
    </form>
  );
};
