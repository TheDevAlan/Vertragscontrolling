import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Clock,
  CheckCircle2,
  ClipboardList,
  FileCheck,
  BarChart3,
  Check,
  X,
  FileText,
  Euro,
  CheckSquare,
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent } from '@/components/ui/Card';
import { Accordion, AccordionGroup } from '@/components/ui/Accordion';
import { prisma } from '@/lib/prisma';
import {
  formatDate,
  formatCurrency,
  getStatusText,
  daysUntil,
  getDeadlineTypeText,
  getDeadlineStatus,
  getDeadlineStatusColor,
  getDeadlineStatusText,
} from '@/lib/utils';
import { KpiCard } from '@/components/contracts/KpiCard';
import { ExportButton } from '@/components/contracts/ExportButton';
import { ContractDetailTabs } from '@/components/contracts/ContractDetailTabs';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: { id: string };
}

const getContract = async (id: string) => {
  const contract = await prisma.contract.findUnique({
    where: { id },
    include: {
      type: true,
      deadlines: {
        orderBy: { dueDate: 'asc' },
      },
      kpis: {
        include: {
          kpiType: true,
          history: {
            orderBy: { changedAt: 'desc' },
            take: 10,
          },
        },
      },
      revenuePlan: {
        orderBy: { sortOrder: 'asc' },
      },
      reportDuties: {
        orderBy: { sortOrder: 'asc' },
      },
      proofOfUseItems: {
        orderBy: { sequenceNumber: 'asc' },
      },
      checklistItems: {
        orderBy: { sortOrder: 'asc' },
      },
      createdBy: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });

  return contract;
};

interface PageProps {
  params: { id: string };
  searchParams?: { tab?: string };
}

export default async function VertragDetailPage({ params, searchParams }: PageProps) {
  const contract = await getContract(params.id);

  if (!contract) {
    notFound();
  }

  const daysToEnd = daysUntil(contract.endDate);

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'success';
      case 'TERMINATED':
        return 'warning';
      case 'EXPIRED':
        return 'danger';
      default:
        return 'default';
    }
  };

  // Summen für Umsatzplanung berechnen
  const revenuePlanTotals = {
    year2024: contract.revenuePlan?.reduce((sum, r) => sum + r.year2024, 0) || 0,
    year2025: contract.revenuePlan?.reduce((sum, r) => sum + r.year2025, 0) || 0,
    year2026: contract.revenuePlan?.reduce((sum, r) => sum + r.year2026, 0) || 0,
    year2027: contract.revenuePlan?.reduce((sum, r) => sum + r.year2027, 0) || 0,
    year2028: contract.revenuePlan?.reduce((sum, r) => sum + r.year2028, 0) || 0,
    year2029: contract.revenuePlan?.reduce((sum, r) => sum + r.year2029, 0) || 0,
    total: 0,
  };
  revenuePlanTotals.total = Object.values(revenuePlanTotals).reduce((a, b) => a + b, 0);

  const years = ['2024', '2025', '2026', '2027', '2028', '2029'] as const;

  return (
    <div className="min-h-screen bg-slate-50">
      <Header title={contract.title} subtitle={`${contract.contractNumber}${contract.titleShort ? ` (${contract.titleShort})` : ''}`} />

      <div className="p-6 space-y-6">
        {/* Aktionsleiste */}
        <div className="flex items-center justify-between">
          <Link href="/vertraege">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Zurück zur Übersicht
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <ExportButton 
              contractId={contract.id} 
              contractNumber={contract.contractNumber} 
            />
            <Link href={`/vertraege/${contract.id}/bearbeiten`}>
              <Button variant="secondary" className="gap-2">
                <Pencil className="w-4 h-4" />
                Bearbeiten
              </Button>
            </Link>
            <Button variant="danger" className="gap-2">
              <Trash2 className="w-4 h-4" />
              Löschen
            </Button>
          </div>
        </div>

        {/* Status-Banner bei dringenden Fristen */}
        {contract.status === 'ACTIVE' && contract.deadlines && (() => {
          const criticalDeadline = contract.deadlines.find((d) => {
            if (d.isCompleted) return false;
            const days = daysUntil(d.dueDate);
            return days !== null && days >= 0 && days <= 30;
          });
          
          if (!criticalDeadline) return null;
          
          const daysLeft = daysUntil(criticalDeadline.dueDate) ?? 0;
          const deadlineLabel = criticalDeadline.customLabel || getDeadlineTypeText(criticalDeadline.type);
          
          return (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
              <Clock className="w-5 h-5 text-amber-600" />
              <div>
                <p className="font-medium text-amber-800">
                  {deadlineLabel} in {daysLeft} {daysLeft === 1 ? 'Tag' : 'Tagen'}!
                </p>
                <p className="text-sm text-amber-700">
                  Bitte prüfen Sie die anstehende Frist und ergreifen Sie ggf. Maßnahmen.
                </p>
              </div>
            </div>
          );
        })()}

        {/* Status-Badge und Quick Info */}
        <Card>
          <CardContent className="py-4">
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-500">Status:</span>
                <Badge variant={getStatusBadgeVariant(contract.status)}>
                  {getStatusText(contract.status)}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-500">Vertragsart:</span>
                <span className="flex items-center gap-1.5 font-medium">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: contract.type.color }} />
                  {contract.type.name}
                </span>
              </div>
              {contract.revenueGross && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-500">Volumen:</span>
                  <span className="font-medium text-primary-600">
                    {formatCurrency(contract.revenueGross, 'EUR')}
                  </span>
                </div>
              )}
              {contract.endDate && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-500">Laufzeit:</span>
                  <span className="font-medium">
                    {formatDate(contract.startDate)} – {formatDate(contract.endDate)}
                    {daysToEnd !== null && daysToEnd > 0 && (
                      <span className="text-slate-500 text-sm ml-1">
                        ({daysToEnd} Tage)
                      </span>
                    )}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <ContractDetailTabs
          contractId={contract.id}
          initialTab={searchParams?.tab === 'history' ? 'history' : 'overview'}
          overviewContent={
            <AccordionGroup>
          {/* Sektion 1: Stammdaten */}
          <Accordion
            title="1. Stammdaten"
            icon={<FileText className="w-5 h-5" />}
            defaultOpen={true}
          >
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              <div>
                <p className="text-sm text-slate-500">Projektbezeichnung</p>
                <p className="font-medium">{contract.title}</p>
              </div>
              {contract.titleShort && (
                <div>
                  <p className="text-sm text-slate-500">Abkürzung</p>
                  <p className="font-medium">{contract.titleShort}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-slate-500">Vertragsnummer</p>
                <p className="font-mono font-medium">{contract.contractNumber}</p>
              </div>
              {contract.esfNumber && (
                <div>
                  <p className="text-sm text-slate-500">ESF-Nummer</p>
                  <p className="font-mono font-medium">{contract.esfNumber}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-slate-500">Laufzeit</p>
                <p className="font-medium">
                  {formatDate(contract.startDate)} – {formatDate(contract.endDate) || '–'}
                </p>
              </div>
              {contract.client && (
                <div>
                  <p className="text-sm text-slate-500">Auftraggeber</p>
                  <p className="font-medium">{contract.client}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-slate-500">Vertragspartner</p>
                <p className="font-medium">{contract.partner}</p>
              </div>
              {contract.projectLead && (
                <div>
                  <p className="text-sm text-slate-500">Projektleitung</p>
                  <p className="font-medium">{contract.projectLead}</p>
                </div>
              )}
              {contract.company && (
                <div>
                  <p className="text-sm text-slate-500">Gesellschaft</p>
                  <p className="font-medium">{contract.company}</p>
                </div>
              )}
              {contract.costCenter && (
                <div>
                  <p className="text-sm text-slate-500">Kostenstelle</p>
                  <p className="font-medium">{contract.costCenter}</p>
                </div>
              )}
              {contract.basisDocument && (
                <div>
                  <p className="text-sm text-slate-500">Grundlage</p>
                  <p className="font-medium">{contract.basisDocument}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-slate-500">Daten entsprechen Vertrag</p>
                <p className="font-medium flex items-center gap-1">
                  {contract.dataMatchesContract ? (
                    <><Check className="w-4 h-4 text-green-600" /> Ja</>
                  ) : (
                    <><X className="w-4 h-4 text-red-600" /> Nein</>
                  )}
                </p>
              </div>
              {contract.description && (
                <div className="col-span-full">
                  <p className="text-sm text-slate-500">Beschreibung</p>
                  <p className="text-slate-700 whitespace-pre-wrap">{contract.description}</p>
                </div>
              )}
            </div>
          </Accordion>

          {/* Sektion 2: Umsatzplanung & Finanzen */}
          <Accordion
            title="2. Umsatzplanung & Finanzen"
            icon={<Euro className="w-5 h-5" />}
            badge={contract.revenueGross ? <Badge variant="success">{formatCurrency(contract.revenueGross, 'EUR')}</Badge> : undefined}
          >
            <div className="space-y-6">
              {/* 2.1 Umsatz */}
              <div>
                <h4 className="text-sm font-medium text-slate-700 mb-3">2.1 Umsatz</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <p className="text-sm text-slate-500">Netto</p>
                    <p className="text-xl font-bold">{formatCurrency(contract.revenueNet, 'EUR')}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <p className="text-sm text-slate-500">MwSt (19%)</p>
                    <p className="text-xl font-bold">{formatCurrency(contract.revenueTax, 'EUR')}</p>
                  </div>
                  <div className="p-4 bg-primary-50 rounded-lg">
                    <p className="text-sm text-primary-600">Brutto</p>
                    <p className="text-xl font-bold text-primary-700">{formatCurrency(contract.revenueGross, 'EUR')}</p>
                  </div>
                </div>
              </div>

              {/* 2.2 Zahlungsart */}
              {contract.paymentMethod && (
                <div>
                  <h4 className="text-sm font-medium text-slate-700 mb-2">2.2 Zahlungsart</h4>
                  <p className="text-slate-700">{contract.paymentMethod}</p>
                </div>
              )}

              {/* 2.3 Umsatzplanung */}
              {contract.revenuePlan && contract.revenuePlan.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-slate-700 mb-3">2.3 Umsatzplanung nach Jahren</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-slate-50">
                          <th className="px-3 py-2 text-left font-medium text-slate-700">Bezeichnung</th>
                          {years.map((year) => (
                            <th key={year} className="px-3 py-2 text-right font-medium text-slate-700">{year}</th>
                          ))}
                          <th className="px-3 py-2 text-right font-medium text-slate-700">Gesamt</th>
                        </tr>
                      </thead>
                      <tbody>
                        {contract.revenuePlan.map((entry) => {
                          const rowTotal = entry.year2024 + entry.year2025 + entry.year2026 + entry.year2027 + entry.year2028 + entry.year2029;
                          return (
                            <tr key={entry.id} className="border-b border-slate-100">
                              <td className="px-3 py-2">{entry.label}</td>
                              {years.map((year) => (
                                <td key={year} className="px-3 py-2 text-right">
                                  {formatCurrency(entry[`year${year}` as keyof typeof entry] as number, 'EUR')}
                                </td>
                              ))}
                              <td className="px-3 py-2 text-right font-medium">{formatCurrency(rowTotal, 'EUR')}</td>
                            </tr>
                          );
                        })}
                        <tr className="bg-slate-50 font-medium">
                          <td className="px-3 py-2">Summe</td>
                          {years.map((year) => (
                            <td key={year} className="px-3 py-2 text-right">
                              {formatCurrency(revenuePlanTotals[`year${year}` as keyof typeof revenuePlanTotals], 'EUR')}
                            </td>
                          ))}
                          <td className="px-3 py-2 text-right">{formatCurrency(revenuePlanTotals.total / 2, 'EUR')}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </Accordion>

          {/* Sektion 3: Berichtspflichten */}
          <Accordion
            title="3. Berichtspflichten"
            icon={<ClipboardList className="w-5 h-5" />}
            badge={contract.reportDuties && contract.reportDuties.length > 0 ? <Badge variant="info">{contract.reportDuties.length} Einträge</Badge> : undefined}
          >
            <div className="space-y-6">
              {/* 3.1 Berichtspflichten Matrix */}
              {contract.reportDuties && contract.reportDuties.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-slate-700 mb-3">3.1 Berichtspflichten</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-slate-50">
                          <th className="px-3 py-2 text-left font-medium text-slate-700">Berichtsart</th>
                          {years.map((year) => (
                            <th key={year} className="px-3 py-2 text-center font-medium text-slate-700">{year}</th>
                          ))}
                          <th className="px-3 py-2 text-left font-medium text-slate-700">Bemerkungen</th>
                        </tr>
                      </thead>
                      <tbody>
                        {contract.reportDuties.map((duty) => (
                          <tr key={duty.id} className="border-b border-slate-100">
                            <td className="px-3 py-2 font-medium">{duty.reportType}</td>
                            {years.map((year) => (
                              <td key={year} className="px-3 py-2 text-center">
                                {duty[`year${year}` as keyof typeof duty] || '–'}
                              </td>
                            ))}
                            <td className="px-3 py-2 text-slate-600">{duty.remarks || '–'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* 3.2 & 3.3 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-slate-700 mb-2">3.2 Berichtspflichten mit Auszahlung gekoppelt</h4>
                  <p className="font-medium flex items-center gap-1">
                    {contract.reportsLinkedToPayment ? (
                      <><Check className="w-4 h-4 text-green-600" /> Ja</>
                    ) : (
                      <><X className="w-4 h-4 text-slate-400" /> Nein</>
                    )}
                  </p>
                </div>
                {contract.refundDeadline && (
                  <div>
                    <h4 className="text-sm font-medium text-slate-700 mb-2">3.4 Mittel sind zurückzuzahlen bis</h4>
                    <p className="font-medium text-amber-600">{formatDate(contract.refundDeadline)}</p>
                  </div>
                )}
              </div>

              {contract.additionalObligations && (
                <div>
                  <h4 className="text-sm font-medium text-slate-700 mb-2">3.3 Weitere Pflichten</h4>
                  <p className="text-slate-700 whitespace-pre-wrap bg-slate-50 p-3 rounded-lg">{contract.additionalObligations}</p>
                </div>
              )}
            </div>
          </Accordion>

          {/* Sektion 4: Verwendungsnachweis */}
          <Accordion
            title="4. Verwendungsnachweis"
            icon={<FileCheck className="w-5 h-5" />}
            badge={contract.proofOfUseRequired ? <Badge variant="warning">Erforderlich</Badge> : <Badge variant="default">Nicht erforderlich</Badge>}
          >
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-medium text-slate-700 mb-2">4.1 Verwendungsnachweis erforderlich</h4>
                <p className="font-medium flex items-center gap-1">
                  {contract.proofOfUseRequired ? (
                    <><Check className="w-4 h-4 text-amber-600" /> Ja</>
                  ) : (
                    <><X className="w-4 h-4 text-slate-400" /> Nein</>
                  )}
                </p>
              </div>

              {contract.proofOfUseRequired && contract.proofOfUseItems && contract.proofOfUseItems.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-slate-700 mb-3">4.2 Verwendungsnachweise</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-slate-50">
                          <th className="px-3 py-2 text-center font-medium text-slate-700">Lfd.-Nr.</th>
                          <th className="px-3 py-2 text-left font-medium text-slate-700">Termin</th>
                          <th className="px-3 py-2 text-left font-medium text-slate-700">Art des VN/Abrechnung</th>
                          <th className="px-3 py-2 text-center font-medium text-slate-700">WP-Testat</th>
                        </tr>
                      </thead>
                      <tbody>
                        {contract.proofOfUseItems.map((item) => (
                          <tr key={item.id} className="border-b border-slate-100">
                            <td className="px-3 py-2 text-center">{item.sequenceNumber}</td>
                            <td className="px-3 py-2">{formatDate(item.dueDate)}</td>
                            <td className="px-3 py-2">{item.proofType}</td>
                            <td className="px-3 py-2 text-center">
                              {item.auditorRequired ? (
                                <Check className="w-4 h-4 text-green-600 mx-auto" />
                              ) : (
                                <X className="w-4 h-4 text-slate-300 mx-auto" />
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {contract.proofOfUseRemarks && (
                <div>
                  <h4 className="text-sm font-medium text-slate-700 mb-2">4.3 Bemerkungen zum Verwendungsnachweis</h4>
                  <p className="text-slate-700 whitespace-pre-wrap bg-slate-50 p-3 rounded-lg">{contract.proofOfUseRemarks}</p>
                </div>
              )}
            </div>
          </Accordion>

          {/* Sektion 5: Kennzahlen */}
          {contract.kpis && contract.kpis.length > 0 && (
            <Accordion
              title="5. Steuerung von Kennzahlen"
              icon={<BarChart3 className="w-5 h-5" />}
              badge={<Badge variant="info">{contract.kpis.length} KPIs</Badge>}
              defaultOpen={true}
            >
              <KpiCard kpis={contract.kpis} />
            </Accordion>
          )}

          {/* Sektion 6: Fristen */}
          <Accordion
            title="6. Fristen"
            icon={<Clock className="w-5 h-5" />}
            badge={contract.deadlines && contract.deadlines.length > 0 ? <Badge variant="info">{contract.deadlines.length} Fristen</Badge> : undefined}
            defaultOpen={true}
          >
            <div className="space-y-3">
              {contract.deadlines && contract.deadlines.length > 0 ? (
                contract.deadlines.map((deadline) => {
                  const { status, daysUntil: daysLeft } = getDeadlineStatus(
                    deadline.dueDate,
                    deadline.isCompleted
                  );
                  return (
                    <div
                      key={deadline.id}
                      className="p-4 rounded-lg border border-slate-200 bg-white space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">
                          {deadline.customLabel || getDeadlineTypeText(deadline.type)}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${getDeadlineStatusColor(status)}`}
                        >
                          {getDeadlineStatusText(status)}
                        </span>
                      </div>
                      <div className="text-sm text-slate-600 grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-slate-500 text-xs">Fällig am</p>
                          <p className="font-medium">{formatDate(deadline.dueDate)}</p>
                        </div>
                        <div>
                          <p className="text-slate-500 text-xs">Countdown</p>
                          {status !== 'ERLEDIGT' && status !== 'VERPASST' && daysLeft !== null && (
                            <p className={status === 'KRITISCH' ? 'text-amber-600 font-medium' : 'font-medium'}>
                              Noch {daysLeft} {daysLeft === 1 ? 'Tag' : 'Tage'}
                            </p>
                          )}
                          {status === 'VERPASST' && daysLeft !== null && (
                            <p className="text-red-600 font-medium">
                              {Math.abs(daysLeft)} {Math.abs(daysLeft) === 1 ? 'Tag' : 'Tage'} überfällig
                            </p>
                          )}
                          {status === 'ERLEDIGT' && (
                            <p className="text-green-600 font-medium flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Erledigt
                            </p>
                          )}
                        </div>
                        <div>
                          <p className="text-slate-500 text-xs">Erinnerung</p>
                          <p className="font-medium">{deadline.reminderDays} Tage vorher</p>
                        </div>
                        {deadline.notifyEmail && (
                          <div>
                            <p className="text-slate-500 text-xs">Benachrichtigung an</p>
                            <p className="font-medium truncate">{deadline.notifyEmail}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-slate-500 text-center py-4">
                  Keine Fristen hinterlegt
                </p>
              )}
            </div>
          </Accordion>

          {/* Notizen */}
          {contract.notes && (
            <Accordion title="Notizen">
              <p className="text-slate-700 whitespace-pre-wrap">{contract.notes}</p>
            </Accordion>
          )}

          {/* Metadaten */}
          <Accordion title="Metadaten" defaultOpen={false}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-slate-500">Erstellt von</p>
                <p className="font-medium">{contract.createdBy?.name || contract.createdBy?.email}</p>
              </div>
              <div>
                <p className="text-slate-500">Erstellt am</p>
                <p className="font-medium">{formatDate(contract.createdAt)}</p>
              </div>
              <div>
                <p className="text-slate-500">Zuletzt geändert</p>
                <p className="font-medium">{formatDate(contract.updatedAt)}</p>
              </div>
              <div>
                <p className="text-slate-500">ID</p>
                <p className="font-mono text-xs">{contract.id}</p>
              </div>
            </div>
          </Accordion>
        </AccordionGroup>
          }
        />
      </div>
    </div>
  );
}
