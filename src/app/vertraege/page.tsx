import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { ContractTable } from '@/components/contracts/ContractTable';
import { prisma } from '@/lib/prisma';
import type { ContractWithType } from '@/types';

export const dynamic = 'force-dynamic';

const getContracts = async (): Promise<ContractWithType[]> => {
  const contracts = await prisma.contract.findMany({
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
  const contracts = await getContracts();

  return (
    <div className="min-h-screen bg-slate-50">
      <Header
        title="Verträge"
        subtitle={`${contracts.length} Verträge insgesamt`}
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

