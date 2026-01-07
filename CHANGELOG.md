# Changelog

## [0.2.0] - 2026-01-07

### Neu: Erweitertes Fristen-Management
- **Mehrere Fristen pro Vertrag**: Jeder Vertrag kann nun beliebig viele Fristen haben
- **Frist-Typen**: Kündigungsfrist, Verlängerungs-Deadline, Prüfungsintervall, Rechnungslegung, Sonstiges
- **Individuelle Benachrichtigungen**: Pro Frist einstellbar (7, 14, 30, 90 Tage vorher)
- **E-Mail-Empfänger**: Separate E-Mail-Adresse pro Frist konfigurierbar

### Dashboard-Verbesserungen
- **Ampelsystem für Fristen**: Farbige Anzeige der Dringlichkeit
  - 🟢 Grün: Noch Zeit (>30 Tage)
  - 🟡 Gelb: Bald fällig (≤30 Tage)
  - 🟠 Orange: Dringend (≤14 Tage)
  - 🔴 Rot: Sehr dringend (≤7 Tage) / Überfällig
- **Countdown-Anzeige**: "Noch X Tage" bzw. "X Tage überfällig"
- **Direkte Verlinkung**: Klick auf Frist führt zum zugehörigen Vertrag

### Vertragsdetails
- **Fristen-Übersicht**: Alle Fristen mit Status-Badge (Zukunft, Kritisch, Erledigt, Verpasst)
- **Kritische Fristen-Banner**: Warnung bei Fristen ≤30 Tage

### UI-Verbesserungen
- **Europäisches Datumsformat**: Neue DateInput-Komponente mit TT.MM.JJJJ Format
- **Kalender-Picker**: Icon-Button zum Öffnen des nativen Datumswählers
- **Flexible Eingabe**: Akzeptiert auch Kurzformate (1.5.25 → 01.05.2025)

### Technische Änderungen
- Neues Prisma-Modell `Deadline` mit Relation zu `Contract`
- Erweiterte API-Routen für Fristen-CRUD
- TypeScript-Typen für Fristen (DeadlineType, DeadlineStatus, DeadlineFormData)
- Neue Utility-Funktionen für Frist-Status-Berechnung

---

## [0.1.0] - 2026-01-07
- Erste lauffähige Version von Vertragscontrolling
- Dashboard mit Statistiken, Fristenliste und Vertragsart-Diagramm
- Vertragsverwaltung: Liste, Details, Neu/Bearbeiten, Löschen
- Authentifizierung via NextAuth (Credentials), Login-Seite
- Prisma Schema + Seeds (Admin-User, Vertragsarten, Demo-Verträge)
- API-Routen für Contracts, Contract-Types, Cron-Reminders
- UI-Komponenten (Tailwind, shadcn-ähnlicher Stil), Sidebar-Layout
