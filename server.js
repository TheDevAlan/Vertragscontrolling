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
if (!process.env.PORT) {
  console.warn('WARNING: PORT environment variable is not set. Defaulting to 3000.');
  process.env.PORT = '3000';
}

console.log(`Starting Next.js standalone server on ${process.env.HOSTNAME || process.env.HOST}:${process.env.PORT}`);

// Starte den Next.js Standalone Server
// Der standalone Server sollte automatisch process.env.PORT verwenden
require('./.next/standalone/server.js');
