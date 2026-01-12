#!/usr/bin/env node

/**
 * Wrapper-Script für Next.js Standalone Server auf Railway
 * 
 * Railway injiziert eine PORT Environment Variable, die der Server verwenden muss.
 * Der Server muss auf 0.0.0.0 hören, damit Railway Healthchecks funktionieren.
 */

// Stelle sicher, dass der Server auf allen Interfaces hört
// Next.js verwendet HOSTNAME oder HOST für die Bindung
process.env.HOSTNAME = process.env.HOSTNAME || '0.0.0.0';
process.env.HOST = process.env.HOST || '0.0.0.0';

// Stelle sicher, dass PORT gesetzt ist (Railway setzt dies automatisch)
// Next.js standalone Server verwendet automatisch process.env.PORT
if (!process.env.PORT) {
  console.warn('WARNING: PORT environment variable is not set. Defaulting to 3000.');
  process.env.PORT = '3000';
}

// Stelle sicher, dass der Port als String vorliegt (Next.js erwartet String)
process.env.PORT = String(process.env.PORT);

console.log(`Starting Next.js standalone server on ${process.env.HOSTNAME || process.env.HOST}:${process.env.PORT}`);
console.log(`Environment: NODE_ENV=${process.env.NODE_ENV || 'not set'}`);

// Starte den Next.js Standalone Server
// Der standalone Server verwendet automatisch process.env.PORT und process.env.HOSTNAME/HOST
require('./.next/standalone/server.js');
