import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendContractReminder } from '@/lib/email';

/**
 * Cron-Job: Prüft Vertragsfristen und sendet Erinnerungen
 * Sollte täglich ausgeführt werden (z.B. um 8:00 Uhr)
 * 
 * Aufruf: POST /api/cron/check-deadlines?secret=CRON_SECRET
 */
export async function POST(request: NextRequest) {
  // Sicherheitsprüfung
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');

  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Alle aktiven Verträge mit Fristen abrufen
    const contracts = await prisma.contract.findMany({
      where: {
        status: 'ACTIVE',
        reminderSent: false,
        OR: [
          { terminationDate: { not: null } },
          { endDate: { not: null } },
        ],
      },
      include: {
        createdBy: true,
      },
    });

    const reminders: Array<{ contractNumber: string; success: boolean }> = [];

    for (const contract of contracts) {
      // Relevantes Datum bestimmen (Kündigungsfrist hat Vorrang)
      const relevantDate = contract.terminationDate || contract.endDate;
      if (!relevantDate) continue;

      // Tage bis zur Frist berechnen
      const deadline = new Date(relevantDate);
      deadline.setHours(0, 0, 0, 0);
      const diffTime = deadline.getTime() - today.getTime();
      const daysUntil = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // Prüfen, ob Erinnerung gesendet werden soll
      if (daysUntil <= contract.reminderDays && daysUntil >= 0) {
        // E-Mail an Ersteller senden
        const email = contract.createdBy?.email;
        if (email) {
          const success = await sendContractReminder(
            email,
            contract.title,
            contract.contractNumber,
            daysUntil,
            contract.terminationDate ? 'termination' : 'expiry'
          );

          if (success) {
            // Erinnerung als gesendet markieren
            await prisma.contract.update({
              where: { id: contract.id },
              data: { reminderSent: true },
            });

            // Log erstellen
            await prisma.notificationLog.create({
              data: {
                contractId: contract.id,
                type: 'REMINDER',
                recipient: email,
                success: true,
              },
            });
          }

          reminders.push({
            contractNumber: contract.contractNumber,
            success,
          });
        }
      }
    }

    // Abgelaufene Verträge auf EXPIRED setzen
    await prisma.contract.updateMany({
      where: {
        status: 'ACTIVE',
        endDate: {
          lt: today,
        },
      },
      data: {
        status: 'EXPIRED',
      },
    });

    return NextResponse.json({
      success: true,
      message: `${reminders.length} Erinnerungen verarbeitet`,
      reminders,
    });
  } catch (error) {
    console.error('Cron check-deadlines error:', error);
    return NextResponse.json(
      { success: false, error: 'Fehler beim Prüfen der Fristen' },
      { status: 500 }
    );
  }
}

