# Vertragscontrolling

Eine moderne, lokale Vertragsmanagement-Software für Unternehmen, entwickelt mit Next.js, Prisma und PostgreSQL.

![Version](https://img.shields.io/badge/version-0.8.1-blue)
![Next.js](https://img.shields.io/badge/Next.js-14.2.35-black)
![License](https://img.shields.io/badge/license-MIT-green)

## ✨ Features

- **📊 Dashboard**: Übersicht über alle Verträge, ablaufende Fristen, Kennzahlen und Statistiken
- **📄 Vertragsverwaltung**: Vollständige CRUD-Operationen für Verträge mit detaillierten Informationen
  - Stammdaten, Umsatzplanung, Berichtspflichten, Verwendungsnachweis
  - Kennzahlen-Management (KPIs) mit Fortschrittsverfolgung
  - Fristen-Management mit automatischen Warnungen
  - Abschluss-Checkliste mit 5 Kategorien
- **🔔 Fristenwarnung**: Automatische Hervorhebung von bald ablaufenden Verträgen mit Ampelsystem
- **👥 Benutzerrollen**: ADMIN, MANAGER, PROJEKTLEITUNG mit unterschiedlichen Berechtigungen
- **📧 E-Mail-Benachrichtigungen**: Automatische Erinnerungen vor Vertragsablauf (optional via SendGrid)
- **📈 Excel-Export**: Professioneller Export aller Vertragsdaten inklusive Checkliste
- **📝 Änderungshistorie**: Vollständige Nachverfolgung aller Änderungen an Verträgen
- **🏠 Lokale Installation**: Läuft auf Ihren eigenen Servern mit PostgreSQL-Datenbank (Docker)

## 🛠️ Tech-Stack

| Kategorie | Technologie | Version | Lizenz |
|-----------|-------------|---------|--------|
| **Framework** | Next.js (App Router) | 14.2.35 | MIT |
| **Sprache** | TypeScript | 5.4.5 | Apache 2.0 |
| **Styling** | Tailwind CSS | 3.4.3 | MIT |
| **Charts** | Recharts | 2.12.7 | MIT |
| **Datenbank** | PostgreSQL | 16 (Docker) | PostgreSQL License |
| **ORM** | Prisma | 5.14.0 | Apache 2.0 |
| **Auth** | NextAuth.js | 4.24.7 | Apache 2.0 |
| **E-Mail** | SendGrid | 8.1.3 | MIT |
| **Icons** | Lucide React | 0.378.0 | ISC |
| **Validierung** | Zod | 3.23.8 | MIT |
| **Excel** | ExcelJS | 4.4.0 | MIT |

> ✅ **Alle verwendeten Dependencies sind kostenfrei und Open Source**  
> 📄 Siehe [THIRD_PARTY_LICENSES.md](./THIRD_PARTY_LICENSES.md) für Details zu allen Lizenzen

## 🚀 Installation

### Voraussetzungen

- **Node.js**: Version 18.17 oder höher ([Download](https://nodejs.org/))
- **npm** oder **yarn**: Package Manager
- **Docker Desktop**: Für PostgreSQL-Container ([Download](https://www.docker.com/products/docker-desktop))

> ⚠️ **Wichtig für Windows**: Das Projekt sollte in einem Pfad **ohne Leerzeichen und Sonderzeichen** liegen (z.B. `C:\Projects\Vertragscontrolling`), um npm-Probleme zu vermeiden.

### Schnellstart

```bash
# 1. Repository klonen
git clone https://github.com/IhrBenutzername/Vertragscontrolling.git
cd Vertragscontrolling

# 2. Abhängigkeiten installieren
npm install

# 3. PostgreSQL Docker-Container starten
docker run --name vertragscontrolling-db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=vertragscontrolling \
  -p 5432:5432 \
  -d postgres:16-alpine

# Windows (PowerShell):
docker run --name vertragscontrolling-db -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=vertragscontrolling -p 5432:5432 -d postgres:16-alpine

# 4. Umgebungsvariablen einrichten
cp .env.example .env.local     # Mac/Linux
copy .env.example .env.local   # Windows

# 5. DATABASE_URL in .env.local auf PostgreSQL setzen:
# DATABASE_URL="postgresql://postgres:postgres@localhost:5432/vertragscontrolling"

# 6. Datenbank initialisieren
npx prisma generate
npx prisma db push
npm run db:seed

# 7. Entwicklungsserver starten
npm run dev
```

Dann im Browser öffnen: **http://localhost:3000**

### Umgebungsvariablen (.env.local)

Erstellen Sie eine `.env.local` Datei im Projektroot:

```env
# Datenbank (PostgreSQL)
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/vertragscontrolling"

# NextAuth (ERFORDERLICH! - Geheimschlüssel ändern!)
# Generieren Sie einen sicheren Secret:
# Windows (PowerShell): [Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
# Mac/Linux: openssl rand -base64 32
# Online: https://generate-secret.vercel.app/32
NEXTAUTH_SECRET="ein-sehr-langer-geheimer-schluessel-min-32-zeichen"
NEXTAUTH_URL="http://localhost:3000"

# Optional: SendGrid für E-Mail-Benachrichtigungen
# Kostenloses Tier: 100 E-Mails/Tag
SENDGRID_API_KEY="SG.xxxxxxxxxxxx"
SENDGRID_FROM_EMAIL="noreply@ihre-domain.de"

# Cron-Job Authentifizierung
CRON_SECRET="cron-geheim-schluessel"

# Admin-Zugangsdaten (für Seed)
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="admin123"
```

### Docker-Container verwalten

```bash
# Container starten
docker start vertragscontrolling-db

# Container stoppen
docker stop vertragscontrolling-db

# Container entfernen (Vorsicht: Löscht alle Daten!)
docker rm -f vertragscontrolling-db

# Logs anzeigen
docker logs vertragscontrolling-db
```

## 🔑 Standard-Login

Nach dem Seed stehen folgende Demo-Accounts zur Verfügung:

| Feld | Admin | Manager | Projektleitung |
|------|-------|---------|----------------|
| **E-Mail** | admin@example.com | manager@example.com | projektleitung@example.com |
| **Passwort** | demo123 | demo123 | demo123 |

> ⚠️ **Wichtig**: Ändern Sie die Passwörter nach der ersten Anmeldung!

### Rollen und Berechtigungen

| Rolle | Dashboard | Verträge lesen | Verträge bearbeiten | Einstellungen | Eigene Verträge |
|-------|-----------|----------------|---------------------|---------------|-----------------|
| **ADMIN** | ✅ | ✅ (alle) | ✅ (alle) | ✅ | ✅ |
| **MANAGER** | ✅ | ✅ (alle) | ✅ (alle) | ❌ | ✅ |
| **PROJEKTLEITUNG** | ✅ | ✅ (nur eigene) | ✅ (nur eigene) | ❌ | ✅ |

## 🏭 Produktions-Deployment

### Build erstellen

```bash
# Production Build
npm run build

# Server starten
npm start
```

### Railway Deployment

1. **Repository verbinden**: GitHub-Repository mit Railway verknüpfen
2. **PostgreSQL-Addon hinzufügen**:
   - Railway-Dashboard → Ihr Projekt → "+ New" → "Database" → "PostgreSQL"
   - Railway erstellt automatisch eine Datenbank und setzt die `DATABASE_URL` Umgebungsvariable
3. **Umgebungsvariablen setzen (WICHTIG!)**:
   - Railway-Dashboard → Ihr Projekt → "Variables" Tab
   - Fügen Sie folgende **erforderliche** Variablen hinzu:
   
   | Variable | Wert | Beschreibung |
   |----------|------|--------------|
   | `NEXTAUTH_SECRET` | Zufälliger String (min. 32 Zeichen) | **ERFORDERLICH!** Generieren Sie einen sicheren Secret:<br>• Windows (PowerShell): `[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))`<br>• Mac/Linux: `openssl rand -base64 32`<br>• Online: https://generate-secret.vercel.app/32 |
   | `NEXTAUTH_URL` | Ihre Railway-URL | Z.B. `https://ihr-projekt.railway.app` (Railway zeigt die URL nach dem ersten Deploy) |
   
   - **Optionale** Variablen (nur wenn benötigt):
     - `SENDGRID_API_KEY`: Für E-Mail-Benachrichtigungen
     - `SENDGRID_FROM_EMAIL`: Absender-E-Mail-Adresse
     - `CRON_SECRET`: Für Cron-Job-Authentifizierung
     - `ADMIN_EMAIL`: Admin-E-Mail für Seed (Standard: `admin@example.com`)
     - `ADMIN_PASSWORD`: Admin-Passwort für Seed (Standard: `admin123`)
   
   > ⚠️ **WICHTIG**: Ohne `NEXTAUTH_SECRET` wird der Healthcheck/Deploy fehlschlagen mit `MissingSecretError`!

4. **Schema initialisieren**:
   - Das Projekt enthält bereits ein `postdeploy` Script in `package.json`, das automatisch nach dem Deployment ausgeführt wird
   - Alternativ können Sie die Schema-Initialisierung manuell über die Railway-Deploy-Logs durchführen
5. **Automatisches Deployment**: Railway deployed automatisch bei jedem Push und führt das `postdeploy` Script aus (`npx prisma db push && npm run db:seed`)

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

### Docker Compose (Alternative)

Erstellen Sie eine `docker-compose.yml`:

```yaml
version: '3.8'
services:
  db:
    image: postgres:16-alpine
    container_name: vertragscontrolling-db
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: vertragscontrolling
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  app:
    build: .
    container_name: vertragscontrolling-app
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://postgres:postgres@db:5432/vertragscontrolling
      NEXTAUTH_SECRET: ${NEXTAUTH_SECRET}
      NEXTAUTH_URL: ${NEXTAUTH_URL}
    depends_on:
      - db

volumes:
  postgres_data:
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
# Crontab bearbeiten
crontab -e

# Eintrag hinzufügen (täglich um 8:00 Uhr)
0 8 * * * curl -X POST http://localhost:3000/api/cron/check-deadlines?secret=IHR_CRON_SECRET
```

### Railway / Cloud

Verwenden Sie einen externen Cron-Service wie:
- [cron-job.org](https://cron-job.org/) (kostenlos)
- [EasyCron](https://www.easycron.com/) (kostenlos bis 100 Jobs)

## 📁 Projektstruktur

```
src/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   │   ├── auth/                 # NextAuth Konfiguration
│   │   ├── contracts/            # Vertrags-API (CRUD, Export, Historie)
│   │   ├── contract-types/       # Vertragsarten-API
│   │   ├── kpi-types/            # Kennzahlen-Typen-API
│   │   └── cron/                 # Cron-Jobs (Deadline-Checks)
│   ├── vertraege/                # Vertragsseiten
│   │   ├── [id]/                 # Vertragsdetails
│   │   │   ├── abschluss/        # Abschluss-Checkliste
│   │   │   └── bearbeiten/       # Vertrag bearbeiten
│   │   └── neu/                  # Neuer Vertrag
│   ├── einstellungen/            # Einstellungen
│   ├── login/                    # Login-Seite
│   └── page.tsx                  # Dashboard
├── components/                   # React-Komponenten
│   ├── ui/                       # UI-Basiskomponenten (Button, Card, Input, etc.)
│   ├── layout/                   # Layout-Komponenten (Header, Sidebar)
│   ├── dashboard/                # Dashboard-Komponenten
│   └── contracts/                # Vertrags-Komponenten (Form, Table, History, etc.)
├── lib/                          # Hilfsfunktionen
│   ├── prisma.ts                 # Prisma Client
│   ├── auth.ts                   # NextAuth Config
│   ├── email.ts                  # SendGrid Integration
│   ├── permissions.ts            # Berechtigungslogik
│   ├── contractHistory.ts        # Änderungshistorie-Tracking
│   └── utils.ts                  # Utility-Funktionen
└── types/                        # TypeScript-Typen

prisma/
├── schema.prisma                 # Datenbankschema
└── seed.ts                       # Demo-Daten (Users, Contract Types, etc.)
```

## 🎨 Design

- **Primärfarbe**: `#be004a` (Magenta)
- **Erfolg/CTA**: `#16a34a` (Grün)
- **Hintergrund**: Weiß/Slate-50
- **Design-System**: Tailwind CSS mit Custom-Utilities

## 📝 Verfügbare Scripts

```bash
# Entwicklungsserver
npm run dev

# Production Build
npm run build

# Production Server
npm start

# Linting
npm run lint

# Datenbank
npm run db:generate    # Prisma Client generieren
npm run db:push        # Schema zur Datenbank pushen
npm run db:seed        # Demo-Daten einfügen
```

## 🔒 Sicherheit

- ✅ Next.js 14.2.35 mit aktuellen Security-Fixes
- ✅ Authentifizierung via NextAuth.js
- ✅ Passwort-Hashing mit bcryptjs
- ✅ Rollenbasierte Zugriffskontrolle
- ✅ Input-Validierung mit Zod
- ✅ SQL-Injection-Schutz durch Prisma ORM

## 📄 Lizenz

Dieses Projekt steht unter der **MIT License**. Siehe [LICENSE](./LICENSE) für Details.

### Third-Party Lizenzen

Alle verwendeten Dependencies sind Open Source und kostenfrei. Siehe [THIRD_PARTY_LICENSES.md](./THIRD_PARTY_LICENSES.md) für eine vollständige Auflistung aller Lizenzen.

## 🤝 Beitragen

1. Fork das Repository
2. Erstelle einen Feature-Branch (`git checkout -b feature/AmazingFeature`)
3. Committe deine Änderungen (`git commit -m 'Add some AmazingFeature'`)
4. Push zum Branch (`git push origin feature/AmazingFeature`)
5. Öffne einen Pull Request

## 📞 Support

Bei Fragen oder Problemen:
- Erstelle ein [Issue](https://github.com/IhrBenutzername/Vertragscontrolling/issues)
- Oder kontaktiere den Projekt-Maintainer

## 📚 Dokumentation

- [Architektur-Dokumentation](./Architecture.md)
- [Changelog](./CHANGELOG.md)
- [Requirements](./requirements.txt)

---

**Version**: 0.8.1  
**Letztes Update**: 2026-01-09