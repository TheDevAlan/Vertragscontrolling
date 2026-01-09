import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { canViewContract } from '@/lib/permissions';

// GET: Änderungsverlauf eines Vertrags abrufen
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Session prüfen
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Nicht authentifiziert' },
        { status: 401 }
      );
    }

    // Prüfen, ob Vertrag existiert
    const contract = await prisma.contract.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        createdById: true,
      },
    });

    if (!contract) {
      return NextResponse.json(
        { success: false, error: 'Vertrag nicht gefunden' },
        { status: 404 }
      );
    }

    // Berechtigungsprüfung: Darf der Benutzer diesen Vertrag sehen?
    if (!canViewContract(session.user.role, session.user.id, contract.createdById)) {
      return NextResponse.json(
        { success: false, error: 'Keine Berechtigung für diesen Vertrag' },
        { status: 403 }
      );
    }

    // Historie-Einträge abrufen (letzte 100 Einträge)
    const history = await prisma.contractHistory.findMany({
      where: {
        contractId: params.id,
      },
      include: {
        changedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        changedAt: 'desc',
      },
      take: 100,
    });

    return NextResponse.json({ success: true, data: history });
  } catch (error) {
    console.error('GET contract history error:', error);
    return NextResponse.json(
      { success: false, error: 'Fehler beim Abrufen des Änderungsverlaufs' },
      { status: 500 }
    );
  }
}
