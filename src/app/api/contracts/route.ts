import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { canViewAllContracts } from '@/lib/permissions';
import { z } from 'zod';

// Validierungs-Schema für Fristen
const deadlineSchema = z.object({
  id: z.string().optional(),
  type: z.enum(['KUENDIGUNG', 'VERLAENGERUNG', 'PRUEFUNG', 'RECHNUNG', 'SONSTIGES']),
  customLabel: z.string().optional(),
  dueDate: z.string().min(1, 'Fristdatum erforderlich'),
  reminderDays: z.number().min(0).default(30),
  notifyEmail: z.string().email().optional().or(z.literal('')),
  isCompleted: z.boolean().optional().default(false),
});

// Validierungs-Schema für Kennzahlen
const kpiSchema = z.object({
  id: z.string().optional(),
  kpiTypeId: z.string().min(1, 'Kennzahl erforderlich'),
  targetValue: z.number(),
  currentValue: z.number().optional().default(0),
  dueDate: z.string().optional(),
});

// Validierungs-Schema für Umsatzplanung
const revenuePlanSchema = z.object({
  id: z.string().optional(),
  label: z.string(),
  year2024: z.number().default(0),
  year2025: z.number().default(0),
  year2026: z.number().default(0),
  year2027: z.number().default(0),
  year2028: z.number().default(0),
  year2029: z.number().default(0),
});

// Validierungs-Schema für Berichtspflichten
const reportDutySchema = z.object({
  id: z.string().optional(),
  reportType: z.string(),
  year2024: z.string().optional(),
  year2025: z.string().optional(),
  year2026: z.string().optional(),
  year2027: z.string().optional(),
  year2028: z.string().optional(),
  year2029: z.string().optional(),
  remarks: z.string().optional(),
});

// Validierungs-Schema für Verwendungsnachweis
const proofOfUseSchema = z.object({
  id: z.string().optional(),
  sequenceNumber: z.number(),
  dueDate: z.string(),
  proofType: z.string(),
  auditorRequired: z.boolean().default(false),
});

// Validierungs-Schema für Checkliste (Sektion 7: Abschluss)
const checklistItemSchema = z.object({
  id: z.string().optional(),
  category: z.enum(['MANAGEMENT', 'CONTROLLING', 'IT', 'QUALITAET', 'NACHHALTIGKEIT']),
  label: z.string(),
  assignee: z.string().optional(),
  remark: z.string().optional(),
  isCompleted: z.boolean().optional().default(false),
});

// Validierungs-Schema für Verträge
const contractSchema = z.object({
  // Sektion 1: Stammdaten
  contractNumber: z.string().min(1, 'Vertragsnummer erforderlich'),
  title: z.string().min(1, 'Bezeichnung erforderlich'),
  titleShort: z.string().optional(),
  partner: z.string().min(1, 'Vertragspartner erforderlich'),
  description: z.string().optional(),
  esfNumber: z.string().optional(),
  client: z.string().optional(),
  projectLead: z.string().optional(),
  company: z.string().optional(),
  costCenter: z.string().optional(),
  basisDocument: z.string().optional(),
  dataMatchesContract: z.boolean().default(true),
  typeId: z.string().min(1, 'Vertragsart erforderlich'),
  startDate: z.string().min(1, 'Startdatum erforderlich'),
  endDate: z.string().optional(),
  
  // Legacy
  terminationDate: z.string().optional(),
  noticePeriodDays: z.number().min(0).default(30),
  value: z.number().optional(),
  currency: z.string().default('EUR'),
  paymentInterval: z.string().optional(),
  status: z.enum(['ACTIVE', 'TERMINATED', 'EXPIRED', 'DRAFT']).default('ACTIVE'),
  autoRenewal: z.boolean().default(false),
  
  // Sektion 2: Umsatzplanung
  revenueNet: z.number().optional(),
  revenueTax: z.number().optional(),
  revenueGross: z.number().optional(),
  paymentMethod: z.string().optional(),
  revenuePlan: z.array(revenuePlanSchema).optional().default([]),
  
  // Sektion 3: Berichtspflichten
  reportsLinkedToPayment: z.boolean().default(false),
  additionalObligations: z.string().optional(),
  refundDeadline: z.string().optional(),
  reportDuties: z.array(reportDutySchema).optional().default([]),
  
  // Sektion 4: Verwendungsnachweis
  proofOfUseRequired: z.boolean().default(false),
  proofOfUseRemarks: z.string().optional(),
  proofOfUseItems: z.array(proofOfUseSchema).optional().default([]),
  
  // Sonstige
  notes: z.string().optional(),
  reminderDays: z.number().min(0).default(30),
  
  // Sektion 5 & 6
  deadlines: z.array(deadlineSchema).optional().default([]),
  kpis: z.array(kpiSchema).optional().default([]),
  
  // Sektion 7: Abschluss-Checkliste
  checklistItems: z.array(checklistItemSchema).optional().default([]),
});

// GET: Alle Verträge abrufen (gefiltert nach Rolle)
export async function GET(request: NextRequest) {
  try {
    // Session prüfen
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Nicht authentifiziert' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const typeId = searchParams.get('typeId');

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (typeId) where.typeId = typeId;

    // Rollenbasierte Filterung: Projektleitung sieht nur eigene Verträge
    if (!canViewAllContracts(session.user.role)) {
      where.createdById = session.user.id;
    }

    const contracts = await prisma.contract.findMany({
      where,
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
      orderBy: [
        { status: 'asc' },
        { terminationDate: 'asc' },
      ],
    });

    return NextResponse.json({ success: true, data: contracts });
  } catch (error) {
    console.error('GET contracts error:', error);
    return NextResponse.json(
      { success: false, error: 'Fehler beim Abrufen der Verträge' },
      { status: 500 }
    );
  }
}

// POST: Neuen Vertrag erstellen
export async function POST(request: NextRequest) {
  try {
    // Session prüfen
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Nicht authentifiziert' },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validierung
    const validationResult = contractSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validierungsfehler',
          details: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Prüfen, ob Vertragsnummer bereits existiert
    const existing = await prisma.contract.findUnique({
      where: { contractNumber: data.contractNumber },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Vertragsnummer bereits vergeben' },
        { status: 400 }
      );
    }

    // Ersteller ist der aktuelle Benutzer
    const creatorId = session.user.id;

    // Automatische Rückzahlungsfrist-Deadline erstellen
    const deadlines = [...data.deadlines];
    if (data.refundDeadline) {
      deadlines.push({
        type: 'SONSTIGES' as const,
        customLabel: 'Rückzahlung Mittel',
        dueDate: data.refundDeadline,
        reminderDays: 30,
        notifyEmail: '',
        isCompleted: false,
      });
    }

    // Vertrag erstellen mit allen Relationen
    const contract = await prisma.contract.create({
      data: {
        // Sektion 1: Stammdaten
        contractNumber: data.contractNumber,
        title: data.title,
        titleShort: data.titleShort || null,
        partner: data.partner,
        description: data.description || null,
        esfNumber: data.esfNumber || null,
        client: data.client || null,
        projectLead: data.projectLead || null,
        company: data.company || null,
        costCenter: data.costCenter || null,
        basisDocument: data.basisDocument || null,
        dataMatchesContract: data.dataMatchesContract,
        typeId: data.typeId,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : null,
        
        // Legacy
        terminationDate: data.terminationDate ? new Date(data.terminationDate) : null,
        noticePeriodDays: data.noticePeriodDays,
        value: data.value || null,
        currency: data.currency,
        paymentInterval: data.paymentInterval || null,
        status: data.status,
        autoRenewal: data.autoRenewal,
        
        // Sektion 2: Umsatzplanung
        revenueNet: data.revenueNet || null,
        revenueTax: data.revenueNet ? data.revenueNet * 0.19 : null,
        revenueGross: data.revenueNet ? data.revenueNet * 1.19 : null,
        paymentMethod: data.paymentMethod || null,
        
        // Sektion 3: Berichtspflichten
        reportsLinkedToPayment: data.reportsLinkedToPayment,
        additionalObligations: data.additionalObligations || null,
        refundDeadline: data.refundDeadline ? new Date(data.refundDeadline) : null,
        
        // Sektion 4: Verwendungsnachweis
        proofOfUseRequired: data.proofOfUseRequired,
        proofOfUseRemarks: data.proofOfUseRemarks || null,
        
        // Sonstige
        notes: data.notes || null,
        reminderDays: data.reminderDays,
        createdById: creatorId,
        
        // Relationen
        deadlines: {
          create: deadlines.map((deadline) => ({
            type: deadline.type,
            customLabel: deadline.customLabel || null,
            dueDate: new Date(deadline.dueDate),
            reminderDays: deadline.reminderDays,
            notifyEmail: deadline.notifyEmail || null,
            isCompleted: deadline.isCompleted || false,
          })),
        },
        kpis: {
          create: data.kpis.map((kpi) => ({
            kpiTypeId: kpi.kpiTypeId,
            targetValue: kpi.targetValue,
            currentValue: kpi.currentValue || 0,
            dueDate: kpi.dueDate ? new Date(kpi.dueDate) : null,
          })),
        },
        revenuePlan: {
          create: data.revenuePlan.map((entry, index) => ({
            label: entry.label,
            year2024: entry.year2024,
            year2025: entry.year2025,
            year2026: entry.year2026,
            year2027: entry.year2027,
            year2028: entry.year2028,
            year2029: entry.year2029,
            sortOrder: index,
          })),
        },
        reportDuties: {
          create: data.reportDuties.map((duty, index) => ({
            reportType: duty.reportType,
            year2024: duty.year2024 || null,
            year2025: duty.year2025 || null,
            year2026: duty.year2026 || null,
            year2027: duty.year2027 || null,
            year2028: duty.year2028 || null,
            year2029: duty.year2029 || null,
            remarks: duty.remarks || null,
            sortOrder: index,
          })),
        },
        proofOfUseItems: {
          create: data.proofOfUseItems.map((item, index) => ({
            sequenceNumber: item.sequenceNumber,
            dueDate: new Date(item.dueDate),
            proofType: item.proofType,
            auditorRequired: item.auditorRequired,
            sortOrder: index,
          })),
        },
        checklistItems: {
          create: data.checklistItems.map((item, index) => ({
            category: item.category,
            label: item.label,
            assignee: item.assignee || null,
            remark: item.remark || null,
            isCompleted: item.isCompleted || false,
            sortOrder: index,
          })),
        },
      },
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

    return NextResponse.json({ success: true, data: contract }, { status: 201 });
  } catch (error) {
    console.error('POST contract error:', error);
    return NextResponse.json(
      { success: false, error: 'Fehler beim Erstellen des Vertrags' },
      { status: 500 }
    );
  }
}
