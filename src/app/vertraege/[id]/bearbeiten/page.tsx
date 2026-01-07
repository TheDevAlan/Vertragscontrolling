import { notFound } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { ContractForm } from '@/components/contracts/ContractForm';
import { prisma } from '@/lib/prisma';

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
    },
  });
  return contract;
};

const getContractTypes = async () => {
  return await prisma.contractType.findMany({
    orderBy: { name: 'asc' },
  });
};

export default async function BearbeitenPage({ params }: PageProps) {
  const [contract, contractTypes] = await Promise.all([
    getContract(params.id),
    getContractTypes(),
  ]);

  if (!contract) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header
        title="Vertrag bearbeiten"
        subtitle={contract.contractNumber}
      />

      <div className="p-6 max-w-4xl">
        <ContractForm
          contract={contract}
          contractTypes={contractTypes}
          mode="edit"
        />
      </div>
    </div>
  );
}

