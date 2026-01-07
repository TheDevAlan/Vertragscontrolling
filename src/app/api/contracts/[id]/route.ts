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

// Validierungs-Schema für Updates
const updateSchema = z.object({
  title: z.string().min(1).optional(),
  partner: z.string().min(1).optional(),
  description: z.string().optional(),
  typeId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  terminationDate: z.string().optional(),
  noticePeriodDays: z.number().min(0).optional(),
  value: z.number().optional(),
  currency: z.string().optional(),
  paymentInterval: z.string().optional(),
  status: z.enum(['ACTIVE', 'TERMINATED', 'EXPIRED', 'DRAFT']).optional(),
  autoRenewal: z.boolean().optional(),
  notes: z.string().optional(),
  reminderDays: z.number().min(0).optional(),
  deadlines: z.array(deadlineSchema).optional(),
  kpis: z.array(kpiSchema).optional(),
});

// GET: Einzelnen Vertrag abrufen
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const contract = await prisma.contract.findUnique({
      where: { id: params.id },
      include: {
        type: true,
        deadlines: {
          orderBy: { dueDate: 'asc' },
        },
        kpis: {
          include: {
            kpiType: true,
            history: {
              orderBy: { changedAt: 'desc' },
              take: 5,
            },
          },
        },
        createdBy: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (!contract) {
      return NextResponse.json(
        { success: false, error: 'Vertrag nicht gefunden' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: contract });
  } catch (error) {
    console.error('GET contract error:', error);
    return NextResponse.json(
      { success: false, error: 'Fehler beim Abrufen des Vertrags' },
      { status: 500 }
    );
  }
}

// PUT: Vertrag aktualisieren
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    // Prüfen, ob Vertrag existiert
    const existing = await prisma.contract.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Vertrag nicht gefunden' },
        { status: 404 }
      );
    }

    // Validierung
    const validationResult = updateSchema.safeParse(body);
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

    // Update-Daten vorbereiten
    const updateData: Record<string, unknown> = {};

    if (data.title !== undefined) updateData.title = data.title;
    if (data.partner !== undefined) updateData.partner = data.partner;
    if (data.description !== undefined) updateData.description = data.description || null;
    if (data.typeId !== undefined) updateData.typeId = data.typeId;
    if (data.startDate !== undefined) updateData.startDate = new Date(data.startDate);
    if (data.endDate !== undefined) updateData.endDate = data.endDate ? new Date(data.endDate) : null;
    if (data.terminationDate !== undefined) updateData.terminationDate = data.terminationDate ? new Date(data.terminationDate) : null;
    if (data.noticePeriodDays !== undefined) updateData.noticePeriodDays = data.noticePeriodDays;
    if (data.value !== undefined) updateData.value = data.value || null;
    if (data.currency !== undefined) updateData.currency = data.currency;
    if (data.paymentInterval !== undefined) updateData.paymentInterval = data.paymentInterval || null;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.autoRenewal !== undefined) updateData.autoRenewal = data.autoRenewal;
    if (data.notes !== undefined) updateData.notes = data.notes || null;
    if (data.reminderDays !== undefined) updateData.reminderDays = data.reminderDays;

    // Fristen verarbeiten (falls übergeben)
    if (body.deadlines !== undefined) {
      // Alle existierenden Fristen des Vertrags löschen
      await prisma.deadline.deleteMany({
        where: { contractId: params.id },
      });

      // Neue Fristen erstellen
      if (body.deadlines.length > 0) {
        await prisma.deadline.createMany({
          data: body.deadlines.map((deadline: z.infer<typeof deadlineSchema>) => ({
            contractId: params.id,
            type: deadline.type,
            customLabel: deadline.customLabel || null,
            dueDate: new Date(deadline.dueDate),
            reminderDays: deadline.reminderDays,
            notifyEmail: deadline.notifyEmail || null,
            isCompleted: deadline.isCompleted || false,
          })),
        });
      }
    }

    // Kennzahlen verarbeiten (falls übergeben)
    if (body.kpis !== undefined) {
      // Alle existierenden KPIs des Vertrags löschen (inkl. Historie durch Cascade)
      await prisma.contractKpi.deleteMany({
        where: { contractId: params.id },
      });

      // Neue KPIs erstellen
      if (body.kpis.length > 0) {
        await prisma.contractKpi.createMany({
          data: body.kpis.map((kpi: z.infer<typeof kpiSchema>) => ({
            contractId: params.id,
            kpiTypeId: kpi.kpiTypeId,
            targetValue: kpi.targetValue,
            currentValue: kpi.currentValue || 0,
            dueDate: kpi.dueDate ? new Date(kpi.dueDate) : null,
          })),
        });
      }
    }

    // Vertrag aktualisieren
    const contract = await prisma.contract.update({
      where: { id: params.id },
      data: updateData,
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

    return NextResponse.json({ success: true, data: contract });
  } catch (error) {
    console.error('PUT contract error:', error);
    return NextResponse.json(
      { success: false, error: 'Fehler beim Aktualisieren des Vertrags' },
      { status: 500 }
    );
  }
}

// DELETE: Vertrag löschen
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Prüfen, ob Vertrag existiert
    const existing = await prisma.contract.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Vertrag nicht gefunden' },
        { status: 404 }
      );
    }

    // Vertrag löschen
    await prisma.contract.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true, message: 'Vertrag gelöscht' });
  } catch (error) {
    console.error('DELETE contract error:', error);
    return NextResponse.json(
      { success: false, error: 'Fehler beim Löschen des Vertrags' },
      { status: 500 }
    );
  }
}

