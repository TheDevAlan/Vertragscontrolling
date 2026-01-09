import Link from 'next/link';
import { Plus } from 'lucide-react';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { ContractTable } from '@/components/contracts/ContractTable';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { canViewAllContracts } from '@/lib/permissions';
import type { ContractWithType } from '@/types';

export const dynamic = 'force-dynamic';

const getContracts = async (userId: string, userRole: string): Promise<ContractWithType[]> => {
  // Filter: Projektleitung sieht nur eigene Verträge
  const where = canViewAllContracts(userRole) ? {} : { createdById: userId };

  const contracts = await prisma.contract.findMany({
    where,
    include: {
      type: true,
    },
    orderBy: [
      { status: 'asc' },
      { terminationDate: 'asc' },
      { endDate: 'asc' },
    ],
  });

  return contracts as ContractWithType[];
};

export default async function VertraegePage() {
  // Session prüfen
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect('/login');
  }

  const contracts = await getContracts(session.user.id, session.user.role);
  const isProjectLead = !canViewAllContracts(session.user.role);

  return (
    <div className="min-h-screen bg-slate-50">
      <Header
        title="Verträge"
        subtitle={isProjectLead ? `${contracts.length} eigene Verträge` : `${contracts.length} Verträge insgesamt`}
      />

      <div className="p-6 space-y-6">
        {/* Action Bar */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">
            Alle Verträge
          </h2>
          <Link href="/vertraege/neu">
            <Button variant="success" className="gap-2">
              <Plus className="w-4 h-4" />
              Neuer Vertrag
            </Button>
          </Link>
        </div>

        {/* Tabelle */}
        <ContractTable contracts={contracts} />
      </div>
    </div>
  );
}

