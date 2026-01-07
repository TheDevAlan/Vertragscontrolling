import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Calendar,
  Building,
  Euro,
  FileText,
  Clock,
  CheckCircle2,
  BarChart3,
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
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
            take: 5,
          },
        },
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

export default async function VertragDetailPage({ params }: PageProps) {
  const contract = await getContract(params.id);

  if (!contract) {
    notFound();
  }

  const daysToTermination = daysUntil(contract.terminationDate);
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

  return (
    <div className="min-h-screen bg-slate-50">
      <Header title={contract.title} subtitle={contract.contractNumber} />

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
          // Finde die nächste kritische oder bald fällige Frist
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Hauptinformationen */}
          <div className="lg:col-span-2 space-y-6">
            {/* Übersicht */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary-600" />
                    Vertragsdetails
                  </CardTitle>
                  <Badge variant={getStatusBadgeVariant(contract.status)}>
                    {getStatusText(contract.status)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-slate-500">Vertragsnummer</p>
                  <p className="font-mono font-medium">{contract.contractNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Vertragsart</p>
                  <p className="font-medium flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: contract.type.color }}
                    />
                    {contract.type.name}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-slate-500">Bezeichnung</p>
                  <p className="font-medium text-lg">{contract.title}</p>
                </div>
                {contract.description && (
                  <div className="col-span-2">
                    <p className="text-sm text-slate-500">Beschreibung</p>
                    <p className="text-slate-700">{contract.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Vertragspartner */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="w-5 h-5 text-primary-600" />
                  Vertragspartner
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-medium text-lg">{contract.partner}</p>
              </CardContent>
            </Card>

            {/* Laufzeiten */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary-600" />
                  Laufzeiten
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm text-slate-500">Vertragsbeginn</p>
                  <p className="font-medium">{formatDate(contract.startDate)}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Vertragsende</p>
                  <p className="font-medium">{formatDate(contract.endDate)}</p>
                  {daysToEnd !== null && daysToEnd > 0 && (
                    <p className="text-sm text-slate-500">
                      (noch {daysToEnd} Tage)
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-slate-500">Kündigungsfrist bis</p>
                  <p
                    className={
                      daysToTermination !== null && daysToTermination <= 30
                        ? 'font-medium text-amber-600'
                        : 'font-medium'
                    }
                  >
                    {formatDate(contract.terminationDate)}
                  </p>
                  {daysToTermination !== null && daysToTermination >= 0 && (
                    <p
                      className={
                        daysToTermination <= 30
                          ? 'text-sm text-amber-600 font-medium'
                          : 'text-sm text-slate-500'
                      }
                    >
                      (noch {daysToTermination} Tage)
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-slate-500">Kündigungsfrist</p>
                  <p className="font-medium">{contract.noticePeriodDays} Tage</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Auto. Verlängerung</p>
                  <p className="font-medium">
                    {contract.autoRenewal ? 'Ja' : 'Nein'}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Kennzahlen */}
            {contract.kpis && contract.kpis.length > 0 && (
              <KpiCard kpis={contract.kpis} />
            )}

            {/* Notizen */}
            {contract.notes && (
              <Card>
                <CardHeader>
                  <CardTitle>Notizen</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-700 whitespace-pre-wrap">
                    {contract.notes}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Seitenleiste */}
          <div className="space-y-6">
            {/* Finanzen */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Euro className="w-5 h-5 text-primary-600" />
                  Finanzen
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-slate-500">Vertragswert</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {formatCurrency(contract.value, contract.currency)}
                  </p>
                  {contract.paymentInterval && (
                    <p className="text-sm text-slate-500">
                      {contract.paymentInterval}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Fristen */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary-600" />
                  Fristen
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {contract.deadlines && contract.deadlines.length > 0 ? (
                  contract.deadlines.map((deadline) => {
                    const { status, daysUntil: daysLeft } = getDeadlineStatus(
                      deadline.dueDate,
                      deadline.isCompleted
                    );
                    return (
                      <div
                        key={deadline.id}
                        className="p-3 rounded-lg border border-slate-200 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm">
                            {deadline.customLabel || getDeadlineTypeText(deadline.type)}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-medium ${getDeadlineStatusColor(status)}`}
                          >
                            {getDeadlineStatusText(status)}
                          </span>
                        </div>
                        <div className="text-sm text-slate-600">
                          <p>Fällig: {formatDate(deadline.dueDate)}</p>
                          {status !== 'ERLEDIGT' && status !== 'VERPASST' && daysLeft !== null && (
                            <p className={status === 'KRITISCH' ? 'text-amber-600 font-medium' : ''}>
                              Noch {daysLeft} {daysLeft === 1 ? 'Tag' : 'Tage'}
                            </p>
                          )}
                          {status === 'VERPASST' && daysLeft !== null && (
                            <p className="text-red-600 font-medium">
                              {Math.abs(daysLeft)} {Math.abs(daysLeft) === 1 ? 'Tag' : 'Tage'} überfällig
                            </p>
                          )}
                          {status === 'ERLEDIGT' && (
                            <p className="text-green-600 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Erledigt
                            </p>
                          )}
                        </div>
                        {deadline.notifyEmail && (
                          <p className="text-xs text-slate-500">
                            Benachrichtigung an: {deadline.notifyEmail}
                          </p>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <p className="text-sm text-slate-500 text-center py-2">
                    Keine Fristen hinterlegt
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Metadaten */}
            <Card>
              <CardHeader>
                <CardTitle>Metadaten</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div>
                  <p className="text-slate-500">Erstellt von</p>
                  <p className="font-medium">
                    {contract.createdBy?.name || contract.createdBy?.email}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500">Erstellt am</p>
                  <p className="font-medium">{formatDate(contract.createdAt)}</p>
                </div>
                <div>
                  <p className="text-slate-500">Zuletzt geändert</p>
                  <p className="font-medium">{formatDate(contract.updatedAt)}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

