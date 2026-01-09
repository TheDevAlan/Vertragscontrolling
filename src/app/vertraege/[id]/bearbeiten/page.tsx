import { notFound } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { ContractForm } from '@/components/contracts/ContractForm';
import { prisma } from '@/lib/prisma';
import type { ContractFull, KpiType } from '@/types';
import { convertDeadline, convertKpiType, convertChecklistItem } from '@/lib/prismaTypes';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: { id: string };
}

const getContract = async (id: string): Promise<ContractFull | null> => {
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
    },
  });

  if (!contract || !contract.type) return null;

  // Konvertiere Prisma-Typen zu TypeScript-Typen
  return {
    ...contract,
    type: contract.type,
    deadlines: contract.deadlines.map(convertDeadline),
    kpis: contract.kpis.map((kpi) => ({
      ...kpi,
      kpiType: convertKpiType(kpi.kpiType),
    })),
    checklistItems: contract.checklistItems.map(convertChecklistItem),
  } as ContractFull;
};

const getContractTypes = async () => {
  return await prisma.contractType.findMany({
    orderBy: { name: 'asc' },
  });
};

const getKpiTypes = async (): Promise<KpiType[]> => {
  const kpiTypes = await prisma.kpiType.findMany({
    orderBy: { name: 'asc' },
  });
  
  // Konvertiere Prisma-Typen zu TypeScript-Typen
  return kpiTypes.map(convertKpiType);
};

export default async function BearbeitenPage({ params }: PageProps) {
  const [contract, contractTypes, kpiTypes] = await Promise.all([
    getContract(params.id),
    getContractTypes(),
    getKpiTypes(),
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
          kpiTypes={kpiTypes}
          mode="edit"
        />
      </div>
    </div>
  );
}

