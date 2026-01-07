import { FileText, TrendingUp, AlertCircle, Euro } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { UpcomingDeadlines } from '@/components/dashboard/UpcomingDeadlines';
import { ContractTypeChart } from '@/components/dashboard/ContractTypeChart';
import { prisma } from '@/lib/prisma';
import { formatCurrency } from '@/lib/utils';
import type { ContractTypeDistribution } from '@/types';

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

  // Aktive Fristen (nicht erledigt, in den nächsten 90 Tagen oder überfällig)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const in90Days = new Date();
  in90Days.setDate(today.getDate() + 90);

  const upcomingDeadlines = await prisma.deadline.findMany({
    where: {
      isCompleted: false,
      dueDate: {
        lte: in90Days,
      },
      contract: {
        status: 'ACTIVE',
      },
    },
    include: {
      contract: {
        include: {
          type: true,
        },
      },
    },
    orderBy: {
      dueDate: 'asc',
    },
    take: 10,
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
      expiringCount: upcomingDeadlines.length,
      totalValue: totalValue._sum.value || 0,
    },
    upcomingDeadlines,
    typeDistribution,
  };
};

export default async function DashboardPage() {
  const { stats, upcomingDeadlines, typeDistribution } = await getDashboardData();

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
          <UpcomingDeadlines deadlines={upcomingDeadlines} />
          <ContractTypeChart data={typeDistribution} />
        </div>
      </div>
    </div>
  );
}

