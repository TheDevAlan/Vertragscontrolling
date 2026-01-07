import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const kpiTypeSchema = z.object({
  name: z.string().min(1, 'Name erforderlich'),
  dataType: z.enum(['NUMBER', 'PERCENT', 'CURRENCY']),
  unit: z.string().optional(),
  description: z.string().optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Ungültiger Farbcode').default('#3b82f6'),
});

// GET: Alle Kennzahlen-Typen abrufen
export async function GET() {
  try {
    const types = await prisma.kpiType.findMany({
      include: {
        _count: {
          select: { contractKpis: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({ success: true, data: types });
  } catch (error) {
    console.error('GET kpi types error:', error);
    return NextResponse.json(
      { success: false, error: 'Fehler beim Abrufen der Kennzahlen-Typen' },
      { status: 500 }
    );
  }
}

// POST: Neuen Kennzahlen-Typ erstellen
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validierung
    const validationResult = kpiTypeSchema.safeParse(body);
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

    // Prüfen, ob Name bereits existiert
    const existing = await prisma.kpiType.findUnique({
      where: { name: data.name },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Kennzahl existiert bereits' },
        { status: 400 }
      );
    }

    // Kennzahl erstellen
    const type = await prisma.kpiType.create({
      data: {
        name: data.name,
        dataType: data.dataType,
        unit: data.unit || null,
        description: data.description || null,
        color: data.color,
      },
    });

    return NextResponse.json({ success: true, data: type }, { status: 201 });
  } catch (error) {
    console.error('POST kpi type error:', error);
    return NextResponse.json(
      { success: false, error: 'Fehler beim Erstellen des Kennzahlen-Typs' },
      { status: 500 }
    );
  }
}

// DELETE: Kennzahlen-Typ löschen
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID erforderlich' },
        { status: 400 }
      );
    }

    // Prüfen, ob Kennzahl verwendet wird
    const usage = await prisma.contractKpi.count({
      where: { kpiTypeId: id },
    });

    if (usage > 0) {
      return NextResponse.json(
        { success: false, error: `Kennzahl wird in ${usage} Verträgen verwendet` },
        { status: 400 }
      );
    }

    await prisma.kpiType.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Kennzahl gelöscht' });
  } catch (error) {
    console.error('DELETE kpi type error:', error);
    return NextResponse.json(
      { success: false, error: 'Fehler beim Löschen des Kennzahlen-Typs' },
      { status: 500 }
    );
  }
}


