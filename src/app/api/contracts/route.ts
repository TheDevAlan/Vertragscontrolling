import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

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

    // Vertrag erstellen
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
      },
      include: {
        type: true,
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

