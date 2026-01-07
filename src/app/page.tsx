import { FileText, TrendingUp, AlertCircle, Euro } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { UpcomingDeadlines } from '@/components/dashboard/UpcomingDeadlines';
import { ContractTypeChart } from '@/components/dashboard/ContractTypeChart';
import { prisma } from '@/lib/prisma';
import { formatCurrency } from '@/lib/utils';
import type { ContractWithType, ContractTypeDistribution } from '@/types';

// Diese Seite wird bei jedem Request neu gerendert
export const dynamic = 'force-dynamic';

const getDashboardData = async () => {
  // Statistiken abrufen
  const [totalContracts, activeContracts, contractTypes] = await Promise.all([
    prisma.contract.count(),
    prisma.contract.count({ where: { status: 'ACTIVE' } }),
    prisma.contractType.findMany({
      include: {
        _count: {
          select: { contracts: true },
        },
      },
    }),
  ]);

  // Gesamtwert aller aktiven Verträge
  const totalValue = await prisma.contract.aggregate({
    where: { status: 'ACTIVE' },
    _sum: { value: true },
  });

  // Verträge mit bald ablaufenden Fristen (nächste 90 Tage)
  const today = new Date();
  const in90Days = new Date();
  in90Days.setDate(today.getDate() + 90);

  const expiringContracts = await prisma.contract.findMany({
    where: {
      status: 'ACTIVE',
      OR: [
        {
          terminationDate: {
            gte: today,
            lte: in90Days,
          },
        },
        {
          endDate: {
            gte: today,
            lte: in90Days,
          },
        },
      ],
    },
    include: {
      type: true,
    },
    orderBy: [
      { terminationDate: 'asc' },
      { endDate: 'asc' },
    ],
    take: 5,
  });

  // Verteilung nach Vertragsart
  const typeDistribution: ContractTypeDistribution[] = contractTypes.map((type) => ({
    name: type.name,
    value: type._count.contracts,
    color: type.color,
  }));

  return {
    stats: {
      totalContracts,
      activeContracts,
      expiringCount: expiringContracts.length,
      totalValue: totalValue._sum.value || 0,
    },
    expiringContracts: expiringContracts as ContractWithType[],
    typeDistribution,
  };
};

export default async function DashboardPage() {
  const { stats, expiringContracts, typeDistribution } = await getDashboardData();

  return (
    <div className="min-h-screen bg-slate-50">
      <Header
        title="Dashboard"
        subtitle="Willkommen bei Vertragscontrolling"
      />

      <div className="p-6 space-y-6">
        {/* Statistik-Karten */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Gesamt Verträge"
            value={stats.totalContracts}
            icon={FileText}
            variant="primary"
          />
          <StatsCard
            title="Aktive Verträge"
            value={stats.activeContracts}
            icon={TrendingUp}
            variant="success"
          />
          <StatsCard
            title="Fristen (90 Tage)"
            value={stats.expiringCount}
            subtitle="Handlungsbedarf"
            icon={AlertCircle}
            variant={stats.expiringCount > 0 ? 'warning' : 'default'}
          />
          <StatsCard
            title="Gesamtwert (aktiv)"
            value={formatCurrency(stats.totalValue)}
            icon={Euro}
            variant="default"
          />
        </div>

        {/* Charts und Listen */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <UpcomingDeadlines contracts={expiringContracts} />
          <ContractTypeChart data={typeDistribution} />
        </div>
      </div>
    </div>
  );
}

