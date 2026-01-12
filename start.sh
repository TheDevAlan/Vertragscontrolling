#!/bin/bash

# Prüfe, ob DATABASE_URL gesetzt ist
if [ -z "$DATABASE_URL" ]; then
  echo "WARNING: DATABASE_URL is not set"
  exit 1
fi

# Initialisiere Datenbank-Schema und Seed-Daten
echo "Initializing database schema..."
npx prisma db push --accept-data-loss

echo "Seeding database..."
npm run db:seed

# Starte den Next.js Server
echo "Starting Next.js server..."
exec npm start
