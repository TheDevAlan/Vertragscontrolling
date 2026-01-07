import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const contractTypeSchema = z.object({
  name: z.string().min(1, 'Name erforderlich'),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Ungültiger Farbcode'),
});

// GET: Alle Vertragsarten abrufen
export async function GET() {
  try {
    const types = await prisma.contractType.findMany({
      include: {
        _count: {
          select: { contracts: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({ success: true, data: types });
  } catch (error) {
    console.error('GET contract types error:', error);
    return NextResponse.json(
      { success: false, error: 'Fehler beim Abrufen der Vertragsarten' },
      { status: 500 }
    );
  }
}

// POST: Neue Vertragsart erstellen
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validierung
    const validationResult = contractTypeSchema.safeParse(body);
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
    const existing = await prisma.contractType.findUnique({
      where: { name: data.name },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Vertragsart existiert bereits' },
        { status: 400 }
      );
    }

    // Vertragsart erstellen
    const type = await prisma.contractType.create({
      data: {
        name: data.name,
        color: data.color,
      },
    });

    return NextResponse.json({ success: true, data: type }, { status: 201 });
  } catch (error) {
    console.error('POST contract type error:', error);
    return NextResponse.json(
      { success: false, error: 'Fehler beim Erstellen der Vertragsart' },
      { status: 500 }
    );
  }
}

