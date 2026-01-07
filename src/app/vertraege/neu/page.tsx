import { Header } from '@/components/layout/Header';
import { ContractForm } from '@/components/contracts/ContractForm';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const getContractTypes = async () => {
  return await prisma.contractType.findMany({
    orderBy: { name: 'asc' },
  });
};

export default async function NeuerVertragPage() {
  const contractTypes = await getContractTypes();

  return (
    <div className="min-h-screen bg-slate-50">
      <Header
        title="Neuer Vertrag"
        subtitle="Erstellen Sie einen neuen Vertrag"
      />

      <div className="p-6 max-w-4xl">
        <ContractForm contractTypes={contractTypes} mode="create" />
      </div>
    </div>
  );
}

