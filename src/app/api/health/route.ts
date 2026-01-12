import { NextResponse } from 'next/server';

/**
 * Healthcheck-Endpoint für Railway/Monitoring
 * Wird nicht durch Middleware geschützt (via matcher)
 * 
 * Railway verwendet healthcheck.railway.app als Hostname
 * Dieser Endpoint muss schnell antworten und einen 200 Status Code zurückgeben
 */
export async function GET() {
  try {
    // Einfacher Healthcheck - keine Datenbank-Prüfung, da das bei Fehlern zu Problemen führen kann
    // Keine Abhängigkeiten, die beim Start fehlschlagen könnten
    const response = NextResponse.json(
      {
        status: 'ok',
        timestamp: new Date().toISOString(),
        service: 'vertragscontrolling',
        uptime: process.uptime(),
      },
      { status: 200 }
    );
    
    // CORS-Header für Railway Healthcheck (falls benötigt)
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET');
    
    return response;
  } catch (error) {
    // Bei Fehlern 500 zurückgeben - Railway markiert dann den Healthcheck als fehlgeschlagen
    // Dies ist korrekt, da die App dann nicht bereit ist
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
