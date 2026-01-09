import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const updateKpiSchema = z.object({
  currentValue: z.number(),
  note: z.string().optional(),
  changedBy: z.string().optional(),
});

// PUT: Kennzahlen-Wert aktualisieren
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    // Validierung
    const validationResult = updateKpiSchema.safeParse(body);
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

    // Aktuelle KPI laden
    const existingKpi = await prisma.contractKpi.findUnique({
      where: { id: params.id },
    });

    if (!existingKpi) {
      return NextResponse.json(
        { success: false, error: 'Kennzahl nicht gefunden' },
        { status: 404 }
      );
    }

    // Historie-Eintrag erstellen und KPI aktualisieren
    const [, updatedKpi] = await prisma.$transaction([
      // Historie-Eintrag
      prisma.kpiHistory.create({
        data: {
          contractKpiId: params.id,
          previousValue: existingKpi.currentValue,
          newValue: data.currentValue,
          changedBy: data.changedBy || null,
          note: data.note || null,
        },
      }),
      // KPI aktualisieren
      prisma.contractKpi.update({
        where: { id: params.id },
        data: {
          currentValue: data.currentValue,
        },
        include: {
          kpiType: true,
          history: {
            orderBy: { changedAt: 'desc' },
            take: 10,
          },
        },
      }),
    ]);

    return NextResponse.json({ success: true, data: updatedKpi });
  } catch (error) {
    console.error('PUT contract kpi error:', error);
    return NextResponse.json(
      { success: false, error: 'Fehler beim Aktualisieren der Kennzahl' },
      { status: 500 }
    );
  }
}

// GET: Einzelne KPI mit Historie
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const kpi = await prisma.contractKpi.findUnique({
      where: { id: params.id },
      include: {
        kpiType: true,
        history: {
          orderBy: { changedAt: 'desc' },
        },
      },
    });

    if (!kpi) {
      return NextResponse.json(
        { success: false, error: 'Kennzahl nicht gefunden' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: kpi });
  } catch (error) {
    console.error('GET contract kpi error:', error);
    return NextResponse.json(
      { success: false, error: 'Fehler beim Abrufen der Kennzahl' },
      { status: 500 }
    );
  }
}



