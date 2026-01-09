import { NextResponse } from 'next/server';

/**
 * Healthcheck-Endpoint für Railway/Monitoring
 * Wird nicht durch Middleware geschützt (via matcher)
 */
export async function GET() {
  try {
    // Einfacher Healthcheck - keine Datenbank-Prüfung, da das bei Fehlern zu Problemen führen kann
    return NextResponse.json(
      {
        status: 'ok',
        timestamp: new Date().toISOString(),
        service: 'vertragscontrolling',
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        timestamp: new Date().toISOString(),
        error: 'Healthcheck failed',
      },
      { status: 500 }
    );
  }
}
