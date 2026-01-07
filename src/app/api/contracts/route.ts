import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
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

// Validierungs-Schema für Verträge
const contractSchema = z.object({
  contractNumber: z.string().min(1, 'Vertragsnummer erforderlich'),
  title: z.string().min(1, 'Bezeichnung erforderlich'),
  partner: z.string().min(1, 'Vertragspartner erforderlich'),
  description: z.string().optional(),
  typeId: z.string().min(1, 'Vertragsart erforderlich'),
  startDate: z.string().min(1, 'Startdatum erforderlich'),
  endDate: z.string().optional(),
  terminationDate: z.string().optional(),
  noticePeriodDays: z.number().min(0).default(30),
  value: z.number().optional(),
  currency: z.string().default('EUR'),
  paymentInterval: z.string().optional(),
  status: z.enum(['ACTIVE', 'TERMINATED', 'EXPIRED', 'DRAFT']).default('ACTIVE'),
  autoRenewal: z.boolean().default(false),
  notes: z.string().optional(),
  reminderDays: z.number().min(0).default(30),
  deadlines: z.array(deadlineSchema).optional().default([]),
  kpis: z.array(kpiSchema).optional().default([]),
});

// GET: Alle Verträge abrufen
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const typeId = searchParams.get('typeId');

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (typeId) where.typeId = typeId;

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

    // Ersteller abrufen (für Demo: ersten Admin verwenden)
    const admin = await prisma.user.findFirst({
      where: { role: 'ADMIN' },
    });

    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Kein Admin-Benutzer gefunden' },
        { status: 500 }
      );
    }

    // Vertrag erstellen mit Fristen und Kennzahlen
    const contract = await prisma.contract.create({
      data: {
        contractNumber: data.contractNumber,
        title: data.title,
        partner: data.partner,
        description: data.description || null,
        typeId: data.typeId,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : null,
        terminationDate: data.terminationDate ? new Date(data.terminationDate) : null,
        noticePeriodDays: data.noticePeriodDays,
        value: data.value || null,
        currency: data.currency,
        paymentInterval: data.paymentInterval || null,
        status: data.status,
        autoRenewal: data.autoRenewal,
        notes: data.notes || null,
        reminderDays: data.reminderDays,
        createdById: admin.id,
        deadlines: {
          create: data.deadlines.map((deadline) => ({
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

