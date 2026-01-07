import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starte Seed...');

  // Admin-Benutzer erstellen
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
  const hashedPassword = await bcrypt.hash(adminPassword, 12);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: 'Administrator',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });
  console.log(`✅ Admin erstellt: ${admin.email}`);

  // Vertragsarten erstellen
  const contractTypes = [
    { name: 'Mietvertrag', color: '#3b82f6' },      // Blau
    { name: 'Instrumentenvertrag', color: '#8b5cf6' }, // Lila
    { name: 'Leasing', color: '#f59e0b' },          // Orange
  ];

  for (const type of contractTypes) {
    await prisma.contractType.upsert({
      where: { name: type.name },
      update: { color: type.color },
      create: type,
    });
    console.log(`✅ Vertragsart erstellt: ${type.name}`);
  }

  // Demo-Verträge erstellen
  const mietvertrag = await prisma.contractType.findUnique({ where: { name: 'Mietvertrag' } });
  const leasing = await prisma.contractType.findUnique({ where: { name: 'Leasing' } });
  const instrumenten = await prisma.contractType.findUnique({ where: { name: 'Instrumentenvertrag' } });

  if (mietvertrag && leasing && instrumenten) {
    const demoContracts = [
      {
        contractNumber: 'MV-2024-001',
        title: 'Büroräume Hauptgebäude',
        partner: 'Immobilien GmbH',
        typeId: mietvertrag.id,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2026-12-31'),
        terminationDate: new Date('2026-09-30'),
        value: 24000,
        paymentInterval: 'monatlich',
        status: 'ACTIVE',
        noticePeriodDays: 90,
        reminderDays: 90,
        createdById: admin.id,
        notes: 'Vertrag verlängert sich automatisch um 1 Jahr',
        autoRenewal: true,
      },
      {
        contractNumber: 'LS-2024-001',
        title: 'Firmenfahrzeug BMW 320d',
        partner: 'AutoLeasing AG',
        typeId: leasing.id,
        startDate: new Date('2024-03-01'),
        endDate: new Date('2027-02-28'),
        terminationDate: new Date('2026-11-30'),
        value: 450,
        paymentInterval: 'monatlich',
        status: 'ACTIVE',
        noticePeriodDays: 90,
        reminderDays: 60,
        createdById: admin.id,
      },
      {
        contractNumber: 'IV-2024-001',
        title: 'Wartungsvertrag Laborgeräte',
        partner: 'TechService GmbH',
        typeId: instrumenten.id,
        startDate: new Date('2024-06-01'),
        endDate: new Date('2025-05-31'),
        terminationDate: new Date('2025-02-28'),
        value: 5000,
        paymentInterval: 'jährlich',
        status: 'ACTIVE',
        noticePeriodDays: 90,
        reminderDays: 30,
        createdById: admin.id,
      },
      {
        contractNumber: 'MV-2023-002',
        title: 'Lagerhalle Nord',
        partner: 'Logistik Immobilien KG',
        typeId: mietvertrag.id,
        startDate: new Date('2023-01-01'),
        endDate: new Date('2025-12-31'),
        terminationDate: new Date('2025-06-30'),
        value: 36000,
        paymentInterval: 'monatlich',
        status: 'ACTIVE',
        noticePeriodDays: 180,
        reminderDays: 90,
        createdById: admin.id,
        description: 'Lagerfläche 500m²',
      },
      {
        contractNumber: 'LS-2023-001',
        title: 'IT-Equipment Leasing',
        partner: 'TechLease GmbH',
        typeId: leasing.id,
        startDate: new Date('2023-06-01'),
        endDate: new Date('2026-05-31'),
        value: 1200,
        paymentInterval: 'monatlich',
        status: 'ACTIVE',
        noticePeriodDays: 30,
        reminderDays: 30,
        createdById: admin.id,
      },
    ];

    for (const contract of demoContracts) {
      const existing = await prisma.contract.findUnique({
        where: { contractNumber: contract.contractNumber },
      });

      if (!existing) {
        await prisma.contract.create({ data: contract });
        console.log(`✅ Vertrag erstellt: ${contract.contractNumber}`);
      }
    }
  }

  console.log('🎉 Seed abgeschlossen!');
}

main()
  .catch((e) => {
    console.error('❌ Seed fehlgeschlagen:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

