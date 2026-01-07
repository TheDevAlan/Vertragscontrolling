# Changelog

## [0.5.0] - 2026-01-07

### Neu: Excel-Export-Funktion
- **Professioneller Excel-Export**: Alle Vertragsdaten werden in eine sauber strukturierte `.xlsx`-Datei exportiert
- **Logische Gliederung**: Alle 6 Sektionen (Stammdaten, Umsatzplanung, Berichtspflichten, Verwendungsnachweis, Kennzahlen, Fristen) in exakt dieser Reihenfolge
- **Visuelles Design**: 
  - Sektions-Header mit Corporate Design (#94a3b8 Hintergrund, #be004a Schrift)
  - Tabellen mit formatierten Headern und automatischer Spaltenbreiten-Anpassung
  - Eingefrorene erste Zeile für bessere Navigation
- **Excel-Formeln**: 
  - Summen in der Umsatzplanung als `=SUMME(...)`-Formeln (dynamische Berechnung)
  - Automatische Aktualisierung bei Wertänderungen in Excel
- **Korrekte Datenformate**:
  - Datumsfelder als Excel-Datumsformat (DD.MM.YYYY)
  - Währungsfelder als Euro-Format (#,##0.00 €)
  - Prozentwerte als Prozentformat (0.00%)
- **Tabellarische Präzision**:
  - Umsatzplanung-Tabelle (2.3) exakt übernommen
  - Berichtspflichten-Matrix (3.1) vollständig dargestellt
  - Verwendungsnachweis-Tabelle (4.2) mit allen Details
- **Export-Button**: Neuer Button in der Vertragsdetailansicht zum direkten Export

### Technische Änderungen
- **ExcelJS-Bibliothek**: Professionelle Excel-Dateigenerierung
- **API-Route**: `/api/contracts/[id]/export` für Excel-Generierung
- **ExportButton-Komponente**: Client-seitige Download-Funktionalität mit Ladeindikator

---

## [0.4.0] - 2026-01-07

### Neu: Erweitertes Vertragsmodul mit 6 Sektionen
- **Einklappbare Accordions**: Alle Sektionen in übersichtlichen, einklappbaren Containern organisiert
- **Sektion 1: Stammdaten**: Projektbezeichnung, Abkürzung, Vertragsnummer, ESF-Nummer, Auftraggeber, Projektleitung, Gesellschaft, Kostenstelle, Grundlage, Vertragspartner
- **Sektion 2: Umsatzplanung & Finanzen**: 
  - Umsatzberechnung: Netto, automatische MwSt (19%), automatisches Brutto
  - Zahlungsart (Freitext)
  - Tabellarische Jahresplanung (2024-2029) mit dynamischen Zeilen
  - Automatische Gesamt-Spalten und Summenzeilen
  - **Validierung**: Rote Warnung bei Abweichung zwischen Jahresplanung und Netto-Umsatz
- **Sektion 3: Berichtspflichten**:
  - Matrix-Tabelle: Berichtsart × Jahre (2024-2029) mit Bemerkungen
  - Radio-Buttons: "Berichtspflichten mit Auszahlung gekoppelt?"
  - Textfeld für weitere Pflichten
  - Rückzahlungsfrist-Datumsfeld (wird automatisch als Frist angelegt)
- **Sektion 4: Verwendungsnachweis**:
  - Konditionale Anzeige via Radio-Buttons (Ja/Nein)
  - Tabelle mit: Lfd.-Nr., Termin, Art des VN/Abrechnung, WP-Testat (Checkbox)
  - Textfeld für weitere Bemerkungen zum Verwendungsnachweis
- **Sektion 5: Steuerung von Kennzahlen** (unverändert)
- **Sektion 6: Fristen** (unverändert)

### UI-Verbesserungen
- **Neue Accordion-Komponente**: Einklappbare Container mit Icons und Badges
- **Section-Komponenten**: Modulare, wiederverwendbare Formular-Sektionen
- **Verbesserte Validierung**: Umfassende Fehlerprüfung für alle Pflichtfelder
- **Bessere UX**: Badges zeigen Ausfüllstatus und Anzahl der Einträge pro Sektion

### Detailansicht
- **Vollständige Accordion-Struktur**: Alle 6 Sektionen übersichtlich dargestellt
- **Umsatzplanung-Tabelle**: Formatierte Darstellung mit Summenberechnung
- **Berichtspflichten-Matrix**: Übersichtliche Tabellenansicht
- **Verwendungsnachweis-Tabelle**: Klare Struktur mit Checkboxen für WP-Testat

### Technische Änderungen
- **Neue Prisma-Modelle**: 
  - `RevenuePlanEntry` für Umsatzplanung pro Jahr
  - `ReportDuty` für Berichtspflichten-Matrix
  - `ProofOfUseItem` für Verwendungsnachweis-Einträge
- **Erweiterte Contract-Felder**: 
  - Stammdaten: titleShort, esfNumber, client, projectLead, company, costCenter, basisDocument, dataMatchesContract
  - Umsatzplanung: revenueNet, revenueTax, revenueGross, paymentMethod
  - Berichtspflichten: reportsLinkedToPayment, additionalObligations, refundDeadline
  - Verwendungsnachweis: proofOfUseRequired, proofOfUseRemarks
- **API-Routen erweitert**: Vollständige Unterstützung für alle neuen Datenstrukturen in POST und PUT
- **Automatische Frist-Erstellung**: Rückzahlungsfrist wird bei Erstellung und Bearbeitung automatisch als Frist angelegt
- **TypeScript-Typen**: Umfassende Typisierung für alle neuen Formular-Sektionen

### Bugfixes
- Automatische Erstellung der Rückzahlungsfrist bei Vertrags-Bearbeitung funktioniert jetzt korrekt

---

## [0.3.0] - 2026-01-07

### Neu: Steuerung von Kennzahlen (KPIs)
- **Kennzahlen-Verwaltung** in Einstellungen: Beliebige KPIs definieren (Name, Datentyp, Farbe)
- **Datentypen**: Zahl, Prozent (%), Währung (€)
- **Vertragserstellung**: Kennzahlen auswählen und Zielwerte festlegen
- **Inline-Bearbeitung**: Werte direkt in der Vertragsdetailansicht aktualisieren
- **Änderungshistorie**: Alle Wertanpassungen mit Zeitstempel und optionaler Notiz

### Kennzahlen-Darstellung
- **Ampelsystem für Fortschritt**: Farbige Anzeige basierend auf Zielerreichung
  - 🟢 Grün: ≥75% des Ziels erreicht
  - 🟡 Gelb: 50-74% erreicht
  - 🟠 Orange: 25-49% erreicht
  - 🔴 Rot: <25% erreicht
- **Fortschrittsbalken**: Visuelle Darstellung des aktuellen Stands
- **Historie-Ansicht**: Änderungsverlauf per Klick einsehbar

### Technische Änderungen
- Neue Prisma-Modelle: `KpiType`, `ContractKpi`, `KpiHistory`
- API-Routen: `/api/kpi-types`, `/api/contract-kpis/[id]`
- Neue Komponente: `KpiCard` für Inline-Editing
- TypeScript-Typen für KPIs erweitert

---

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
