import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starte Seed...');

  // Standard-Passwort für alle Demo-Benutzer
  const defaultPassword = 'demo123';
  const hashedPassword = await bcrypt.hash(defaultPassword, 12);

  // === BENUTZER ERSTELLEN ===

  // 1. Admin-Benutzer erstellen
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: { role: 'ADMIN' },
    create: {
      email: 'admin@example.com',
      name: 'Admin User',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });
  console.log(`✅ Admin erstellt: ${admin.email} (Passwort: ${defaultPassword})`);

  // 2. Manager-Benutzer erstellen
  const manager = await prisma.user.upsert({
    where: { email: 'manager@example.com' },
    update: { role: 'MANAGER' },
    create: {
      email: 'manager@example.com',
      name: 'Manager User',
      password: hashedPassword,
      role: 'MANAGER',
    },
  });
  console.log(`✅ Manager erstellt: ${manager.email} (Passwort: ${defaultPassword})`);

  // 3. Projektleitung-Benutzer erstellen
  const projektleitung = await prisma.user.upsert({
    where: { email: 'projektleitung@example.com' },
    update: { role: 'PROJEKTLEITUNG' },
    create: {
      email: 'projektleitung@example.com',
      name: 'Projekt Leiter',
      password: hashedPassword,
      role: 'PROJEKTLEITUNG',
    },
  });
  console.log(`✅ Projektleitung erstellt: ${projektleitung.email} (Passwort: ${defaultPassword})`);

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

  // === KENNZAHLEN-TYPEN ERSTELLEN ===
  const kpiTypes = [
    { name: 'Bindung', dataType: 'PERCENT', unit: '%', description: 'Bindungsquote der Mittel', color: '#22c55e' },      // Grün
    { name: 'Bewilligung', dataType: 'PERCENT', unit: '%', description: 'Bewilligungsquote', color: '#3b82f6' },         // Blau
    { name: 'Zahlung', dataType: 'CURRENCY', unit: '€', description: 'Erhaltene Zahlungen', color: '#f59e0b' },          // Orange
  ];

  const createdKpiTypes: Record<string, string> = {};
  for (const kpiType of kpiTypes) {
    const created = await prisma.kpiType.upsert({
      where: { name: kpiType.name },
      update: { color: kpiType.color, dataType: kpiType.dataType, unit: kpiType.unit },
      create: kpiType,
    });
    createdKpiTypes[kpiType.name] = created.id;
    console.log(`✅ Kennzahl-Typ erstellt: ${kpiType.name}`);
  }

  // Demo-Verträge erstellen
  const mietvertrag = await prisma.contractType.findUnique({ where: { name: 'Mietvertrag' } });
  const leasing = await prisma.contractType.findUnique({ where: { name: 'Leasing' } });
  const instrumenten = await prisma.contractType.findUnique({ where: { name: 'Instrumentenvertrag' } });

  if (mietvertrag && leasing && instrumenten) {
    const demoContracts = [
      // Verträge vom Admin
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
      // Vertrag vom Manager
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
        createdById: manager.id,
      },
      // Verträge von der Projektleitung (nur diese sieht die Projektleitung)
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
        createdById: projektleitung.id,
        description: 'Lagerfläche 500m² - Erstellt von Projektleitung',
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
        createdById: projektleitung.id,
        description: 'Erstellt von Projektleitung',
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

    // === FRISTEN UND KENNZAHLEN HINZUFÜGEN ===
    const today = new Date();
    
    // Verträge abrufen für Fristen/Kennzahlen
    const bueroVertrag = await prisma.contract.findUnique({ where: { contractNumber: 'MV-2024-001' } });
    const bmwVertrag = await prisma.contract.findUnique({ where: { contractNumber: 'LS-2024-001' } });
    const itVertrag = await prisma.contract.findUnique({ where: { contractNumber: 'LS-2023-001' } });

    if (bueroVertrag && bmwVertrag && itVertrag) {
      // Fristen erstellen (mit verschiedener Dringlichkeit)
      const deadlines = [
        // Frist 1: KRITISCH - in 7 Tagen (Büroräume)
        {
          contractId: bueroVertrag.id,
          type: 'KUENDIGUNG',
          customLabel: null,
          dueDate: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000),
          reminderDays: 14,
          notifyEmail: 'admin@example.com',
          isCompleted: false,
        },
        // Frist 2: BALD - in 21 Tagen (BMW)
        {
          contractId: bmwVertrag.id,
          type: 'VERLAENGERUNG',
          customLabel: null,
          dueDate: new Date(today.getTime() + 21 * 24 * 60 * 60 * 1000),
          reminderDays: 30,
          notifyEmail: 'admin@example.com',
          isCompleted: false,
        },
        // Frist 3: NORMAL - in 45 Tagen (IT-Equipment)
        {
          contractId: itVertrag.id,
          type: 'PRUEFUNG',
          customLabel: 'Jährliche Inventur',
          dueDate: new Date(today.getTime() + 45 * 24 * 60 * 60 * 1000),
          reminderDays: 14,
          notifyEmail: 'projektleitung@example.com',
          isCompleted: false,
        },
      ];

      // Alte Fristen für diese Verträge löschen
      await prisma.deadline.deleteMany({
        where: { contractId: { in: [bueroVertrag.id, bmwVertrag.id, itVertrag.id] } },
      });

      for (const deadline of deadlines) {
        await prisma.deadline.create({ data: deadline });
      }
      console.log(`✅ 3 Fristen erstellt (verschiedene Dringlichkeiten)`);

      // Kennzahlen erstellen (mit verschiedenem Fortschritt)
      const kpis = [
        // KPI 1: Bindung für Büroräume - 75% erreicht, Frist in 14 Tagen (KRITISCH)
        {
          contractId: bueroVertrag.id,
          kpiTypeId: createdKpiTypes['Bindung'],
          targetValue: 100,
          currentValue: 75,
          dueDate: new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000),
        },
        // KPI 2: Bewilligung für BMW - 50% erreicht, Frist in 30 Tagen (NORMAL)
        {
          contractId: bmwVertrag.id,
          kpiTypeId: createdKpiTypes['Bewilligung'],
          targetValue: 100,
          currentValue: 50,
          dueDate: new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000),
        },
        // KPI 3: Zahlung für IT-Equipment - 8000 von 15000€, Frist in 60 Tagen
        {
          contractId: itVertrag.id,
          kpiTypeId: createdKpiTypes['Zahlung'],
          targetValue: 15000,
          currentValue: 8000,
          dueDate: new Date(today.getTime() + 60 * 24 * 60 * 60 * 1000),
        },
      ];

      // Alte KPIs für diese Verträge löschen
      await prisma.contractKpi.deleteMany({
        where: { contractId: { in: [bueroVertrag.id, bmwVertrag.id, itVertrag.id] } },
      });

      for (const kpi of kpis) {
        await prisma.contractKpi.create({ data: kpi });
      }
      console.log(`✅ 3 Kennzahlen erstellt (verschiedener Fortschritt)`);
    }
  }

  console.log('');
  console.log('🎉 Seed abgeschlossen!');
  console.log('');
  console.log('📋 Demo-Zugangsdaten:');
  console.log('┌─────────────────────────────────────────────────────────────┐');
  console.log('│ Rolle          │ E-Mail                    │ Passwort      │');
  console.log('├─────────────────────────────────────────────────────────────┤');
  console.log('│ ADMIN          │ admin@example.com         │ demo123       │');
  console.log('│ MANAGER        │ manager@example.com       │ demo123       │');
  console.log('│ PROJEKTLEITUNG │ projektleitung@example.com│ demo123       │');
  console.log('└─────────────────────────────────────────────────────────────┘');
  console.log('');
  console.log('📊 Berechtigungen:');
  console.log('  • ADMIN + MANAGER: Sehen alle Verträge');
  console.log('  • PROJEKTLEITUNG: Sieht nur eigene Verträge (2 Demo-Verträge)');
}

main()
  .catch((e) => {
    console.error('❌ Seed fehlgeschlagen:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

