# Vertragscontrolling

Eine lokale Vertragsmanagement-Software für Unternehmen, entwickelt mit Next.js, Prisma und PostgreSQL.

![Dashboard Screenshot](docs/dashboard.png)

## ✨ Features

- **📊 Dashboard**: Übersicht über alle Verträge, ablaufende Fristen und Statistiken
- **📄 Vertragsverwaltung**: CRUD-Operationen für Verträge mit detaillierten Informationen
- **🔔 Fristenwarnung**: Automatische Hervorhebung von bald ablaufenden Verträgen
- **👥 Benutzerrollen**: Admin, Benutzer und Betrachter mit unterschiedlichen Berechtigungen
- **📧 E-Mail-Benachrichtigungen**: Automatische Erinnerungen vor Vertragsablauf (via SendGrid)
- **🏠 Lokale Installation**: Läuft auf Ihren eigenen Servern mit PostgreSQL-Datenbank (Docker)

## 🛠️ Tech-Stack

| Kategorie | Technologie |
|-----------|-------------|
| **Framework** | Next.js 14 (App Router) |
| **Sprache** | TypeScript |
| **Styling** | Tailwind CSS |
| **Charts** | Recharts |
| **Datenbank** | PostgreSQL (Docker) |
| **ORM** | Prisma |
| **Auth** | NextAuth.js |
| **E-Mail** | SendGrid |
| **Icons** | Lucide React |

## 🚀 Installation

### Voraussetzungen

- Node.js 18+ 
- npm oder yarn
- Docker Desktop (für PostgreSQL)

> ⚠️ **Wichtig für Windows**: Das Projekt sollte in einem Pfad **ohne Leerzeichen und Sonderzeichen** liegen (z.B. `C:\Projects\Vertragscontrolling`), um npm-Probleme zu vermeiden.

### Schnellstart

```bash
# 1. Abhängigkeiten installieren
npm install

# 2. PostgreSQL Docker-Container starten
docker run --name vertragscontrolling-db -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=vertragscontrolling -p 5432:5432 -d postgres:16-alpine

# 3. Umgebungsvariablen einrichten
copy .env.example .env.local     # Windows
# cp .env.example .env.local     # Mac/Linux

# Wichtig: DATABASE_URL in .env.local auf PostgreSQL setzen:
# DATABASE_URL="postgresql://postgres:postgres@localhost:5432/vertragscontrolling"

# 4. Datenbank initialisieren
npx prisma generate
npx prisma db push
npm run db:seed

# 5. Entwicklungsserver starten
npm run dev
```

Dann im Browser öffnen: **http://localhost:3000**

### Umgebungsvariablen (.env.local)

```env
# Datenbank (PostgreSQL)
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/vertragscontrolling"

# NextAuth (Geheimschlüssel ändern!)
NEXTAUTH_SECRET="ein-sehr-langer-geheimer-schluessel-32-zeichen"
NEXTAUTH_URL="http://localhost:3000"

# Optional: SendGrid für E-Mail-Benachrichtigungen
SENDGRID_API_KEY="SG.xxxxxxxxxxxx"
SENDGRID_FROM_EMAIL="noreply@ihre-domain.de"

# Cron-Job Authentifizierung
CRON_SECRET="cron-geheim-schluessel"

# Admin-Zugangsdaten (für Seed)
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="admin123"
```

## 🔑 Standard-Login

| Feld | Wert |
|------|------|
| **E-Mail** | admin@example.com |
| **Passwort** | admin123 |

> ⚠️ **Wichtig**: Ändern Sie das Passwort nach der ersten Anmeldung!

## 🏭 Produktions-Deployment

```bash
# Build erstellen
npm run build

# Server starten
npm start
```

### Windows-Server (mit PM2)

```bash
# PM2 global installieren
npm install -g pm2

# Anwendung starten
pm2 start npm --name "vertragscontrolling" -- start

# Autostart einrichten
pm2 save
pm2 startup
```

## ⏰ Cron-Job für E-Mail-Benachrichtigungen

Für automatische E-Mail-Benachrichtigungen einen täglichen Cron-Job einrichten:

### Windows (Task Scheduler)

PowerShell-Skript erstellen und täglich um 8:00 Uhr ausführen:

```powershell
Invoke-WebRequest -Uri "http://localhost:3000/api/cron/check-deadlines?secret=IHR_CRON_SECRET" -Method POST
```

### Linux/Mac

```bash
0 8 * * * curl -X POST http://localhost:3000/api/cron/check-deadlines?secret=IHR_CRON_SECRET
```

## 👥 Benutzerrollen

| Rolle | Dashboard | Verträge lesen | Verträge bearbeiten | Einstellungen |
|-------|-----------|----------------|---------------------|---------------|
| **Admin** | ✅ | ✅ | ✅ | ✅ |
| **User** | ✅ | ✅ | ✅ | ❌ |
| **Viewer** | ✅ | ✅ | ❌ | ❌ |

## 📁 Projektstruktur

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   │   ├── auth/          # NextAuth
│   │   ├── contracts/     # Vertrags-API
│   │   ├── contract-types/# Vertragsarten-API
│   │   └── cron/          # Cron-Jobs
│   ├── vertraege/         # Vertragsseiten
│   ├── einstellungen/     # Einstellungen
│   └── login/             # Login-Seite
├── components/            # React-Komponenten
│   ├── ui/               # UI-Basiskomponenten
│   ├── layout/           # Layout-Komponenten
│   ├── dashboard/        # Dashboard-Komponenten
│   └── contracts/        # Vertrags-Komponenten
├── lib/                   # Hilfsfunktionen
│   ├── prisma.ts         # Prisma Client
│   ├── auth.ts           # NextAuth Config
│   ├── email.ts          # SendGrid Integration
│   └── utils.ts          # Utility-Funktionen
└── types/                 # TypeScript-Typen

prisma/
├── schema.prisma         # Datenbankschema
└── seed.ts               # Demo-Daten
```

## 🎨 Design

- **Primärfarbe**: `#be004a` (Magenta)
- **Erfolg/CTA**: `#16a34a` (Grün)
- **Heller Hintergrund**: Weiß/Slate-50

## 📝 Lizenz

Proprietär - Nur für interne Verwendung.


