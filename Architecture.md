# Architecture

KurzÃ¼berblick der Ordnerstruktur, damit Cursor Dateien schneller findet.

## Wurzel
- package.json / next.config.mjs / tsconfig.json / tailwind.config.ts: Build- und Tooling-Configs
- prisma/: Prisma-Schema und Seeds
- src/: App-Code (Next.js App Router)

## prisma/
- schema.prisma: PostgreSQL-Datenmodell (User, ContractType, Contract, NotificationLog)
- seed.ts: Demo-Daten (Admin, Vertragsarten, VertrÃ¤ge)

## src/app/ (App Router)
- layout.tsx, globals.css: Grundlayout und globale Styles
- page.tsx: Dashboard
- login/: Login-Seite (NextAuth Credentials)
- vertraege/: Vertragsliste, Detail, Neu, Bearbeiten
- einstellungen/: Vertragsarten- und System-Einstellungen
- api/: API-Routen
  - auth/[...nextauth]/: NextAuth Config
  - contracts/: CRUD fÃ¼r VertrÃ¤ge
  - contract-types/: CRUD fÃ¼r Vertragsarten
  - cron/check-deadlines/: Fristen-Reminder
- not-found.tsx: 404-Seite
- middleware.ts: Auth-Schutz fÃ¼r geschÃ¼tzte Routen

## src/components/
- layout/: Sidebar, Header
- ui/: Basiskomponenten (Button, Card, Input, Select, Table, Modal, Badge)
- dashboard/: StatsCard, UpcomingDeadlines, ContractTypeChart
- contracts/: ContractTable, ContractForm

## src/lib/
- prisma.ts: Prisma Client Singleton
- auth.ts: NextAuth Optionen
- email.ts: SendGrid Helfer
- utils.ts: Formatierung, Status-Helfer, Nummern-Generator

## src/types/
- index.ts: DomÃ¤nen-Typen (Contract, ContractType, etc.)
- next-auth.d.ts: Session/JWT-Erweiterungen

## Assets
- README.md: ProjektÃ¼bersicht und Setup
- CHANGELOG.md: Ã„nderungen je Version
- Architecture.md: Diese Ãœbersicht
