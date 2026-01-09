import { Prisma } from '@prisma/client';

// Feld-Mapping: Feldname -> Anzeige-Label
const FIELD_LABELS: Record<string, string> = {
  // Sektion 1: Stammdaten
  title: 'Projektbezeichnung',
  titleShort: 'Abkürzung',
  partner: 'Vertragspartner',
  description: 'Beschreibung',
  esfNumber: 'ESF-Nummer',
  client: 'Auftraggeber',
  projectLead: 'Projektleitung',
  company: 'Gesellschaft',
  costCenter: 'Kostenstelle',
  basisDocument: 'Grundlage',
  dataMatchesContract: 'Daten entsprechen Vertrag',
  typeId: 'Vertragsart',
  startDate: 'Startdatum',
  endDate: 'Enddatum',
  terminationDate: 'Kündigungsdatum',
  noticePeriodDays: 'Kündigungsfrist (Tage)',
  
  // Sektion 2: Umsatzplanung & Finanzen
  revenueNet: 'Umsatz Netto',
  revenueTax: 'MwSt (19%)',
  revenueGross: 'Umsatz Brutto',
  paymentMethod: 'Zahlungsart',
  value: 'Vertragswert',
  currency: 'Währung',
  paymentInterval: 'Zahlungsintervall',
  
  // Sektion 3: Berichtspflichten
  reportsLinkedToPayment: 'Berichtspflichten mit Auszahlung gekoppelt',
  additionalObligations: 'Weitere Pflichten',
  refundDeadline: 'Rückzahlungsfrist',
  
  // Sektion 4: Verwendungsnachweis
  proofOfUseRequired: 'Verwendungsnachweis erforderlich',
  proofOfUseRemarks: 'Bemerkungen zum Verwendungsnachweis',
  
  // Sonstige
  status: 'Status',
  autoRenewal: 'Automatische Verlängerung',
  notes: 'Notizen',
  reminderDays: 'Erinnerungsfrist (Tage)',
};

// Formatierung von Werten für die Anzeige
function formatValue(value: unknown, fieldName: string): string {
  if (value === null || value === undefined) {
    return '(leer)';
  }

  // Boolean
  if (typeof value === 'boolean') {
    return value ? 'Ja' : 'Nein';
  }

  // Datum
  if (value instanceof Date) {
    return value.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  // Währung
  if (fieldName.includes('revenue') || fieldName === 'value') {
    if (typeof value === 'number') {
      return new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: 'EUR',
      }).format(value);
    }
  }

  // Zahl mit Einheit
  if (fieldName === 'noticePeriodDays' || fieldName === 'reminderDays') {
    return `${value} Tage`;
  }

  // String
  return String(value);
}

// Vergleichsfunktion: Prüft, ob zwei Werte gleich sind
function valuesEqual(oldValue: unknown, newValue: unknown): boolean {
  // Beide null/undefined
  if ((oldValue === null || oldValue === undefined) && (newValue === null || newValue === undefined)) {
    return true;
  }

  // Einer null/undefined, der andere nicht
  if (oldValue === null || oldValue === undefined || newValue === null || newValue === undefined) {
    return false;
  }

  // Datum-Vergleich
  if (oldValue instanceof Date && newValue instanceof Date) {
    return oldValue.getTime() === newValue.getTime();
  }

  // Normale Werte-Vergleich
  return oldValue === newValue;
}

// Konvertiert Wert zu JSON-String für Speicherung
function serializeValue(value: unknown): string | null {
  if (value === null || value === undefined) {
    return null;
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (typeof value === 'object') {
    return JSON.stringify(value);
  }

  return String(value);
}

// Konvertiert JSON-String zurück zu Wert
function deserializeValue(value: string | null, fieldName: string): unknown {
  if (value === null) {
    return null;
  }

  // Datum-Felder
  if (fieldName.includes('Date') || fieldName.includes('deadline')) {
    return new Date(value);
  }

  // Boolean-Felder
  if (fieldName.includes('Required') || fieldName.includes('Linked') || fieldName.includes('Matches') || fieldName === 'autoRenewal') {
    return value === 'true';
  }

  // Zahl-Felder
  if (fieldName.includes('revenue') || fieldName === 'value' || fieldName.includes('Days') || fieldName === 'noticePeriodDays' || fieldName === 'reminderDays') {
    const num = parseFloat(value);
    return isNaN(num) ? value : num;
  }

  // Versuche JSON zu parsen, sonst String
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

// Erstellt Historie-Einträge für alle geänderten Felder
export async function createHistoryEntries(
  prisma: Prisma.TransactionClient,
  contractId: string,
  userId: string,
  oldData: Record<string, unknown>,
  newData: Record<string, unknown>,
  contractTypes?: Array<{ id: string; name: string }> // Für typeId -> Name Konvertierung
): Promise<void> {
  const historyEntries: Array<{
    contractId: string;
    changedById: string;
    fieldName: string;
    fieldLabel: string;
    oldValue: string | null;
    newValue: string | null;
    changeType: string;
  }> = [];

  // Alle Felder durchgehen, die getrackt werden sollen
  const fieldsToTrack = Object.keys(FIELD_LABELS);

  for (const fieldName of fieldsToTrack) {
    const oldValue = oldData[fieldName];
    const newValue = newData[fieldName];

    // Überspringe, wenn Feld nicht in beiden Datensätzen vorhanden
    if (!(fieldName in oldData) && !(fieldName in newData)) {
      continue;
    }

    // Prüfe, ob sich der Wert geändert hat
    if (!valuesEqual(oldValue, newValue)) {
      let displayOldValue = oldValue;
      let displayNewValue = newValue;

      // Spezialbehandlung für typeId: Konvertiere zu Vertragsart-Name
      if (fieldName === 'typeId' && contractTypes) {
        const oldType = contractTypes.find(t => t.id === oldValue);
        const newType = contractTypes.find(t => t.id === newValue);
        displayOldValue = oldType?.name || oldValue;
        displayNewValue = newType?.name || newValue;
      }

      // Bestimme Change-Type
      let changeType = 'UPDATE';
      if (oldValue === null || oldValue === undefined) {
        changeType = 'CREATE';
      } else if (newValue === null || newValue === undefined) {
        changeType = 'DELETE';
      }

      historyEntries.push({
        contractId,
        changedById: userId,
        fieldName,
        fieldLabel: FIELD_LABELS[fieldName] || fieldName,
        oldValue: serializeValue(displayOldValue),
        newValue: serializeValue(displayNewValue),
        changeType,
      });
    }
  }

  // Alle Historie-Einträge in einem Batch erstellen
  if (historyEntries.length > 0) {
    await prisma.contractHistory.createMany({
      data: historyEntries,
    });
  }
}

// Erstellt Historie-Einträge für Relationen-Änderungen (Fristen, KPIs, etc.)
export async function createRelationHistoryEntries(
  prisma: Prisma.TransactionClient,
  contractId: string,
  userId: string,
  relationType: 'deadlines' | 'kpis' | 'revenuePlan' | 'reportDuties' | 'proofOfUseItems' | 'checklistItems',
  oldItems: Array<Record<string, unknown>>,
  newItems: Array<Record<string, unknown>>
): Promise<void> {
  const relationLabels: Record<string, string> = {
    deadlines: 'Frist',
    kpis: 'Kennzahl',
    revenuePlan: 'Umsatzplanung',
    reportDuties: 'Berichtspflicht',
    proofOfUseItems: 'Verwendungsnachweis',
    checklistItems: 'Checklist-Item',
  };

  const label = relationLabels[relationType] || relationType;
  const historyEntries: Array<{
    contractId: string;
    changedById: string;
    fieldName: string;
    fieldLabel: string;
    oldValue: string | null;
    newValue: string | null;
    changeType: string;
  }> = [];

  // Helper: Formatiert ein Datum sicher
  const formatDateSafe = (dateValue: unknown): string => {
    if (!dateValue) return 'Kein Datum';
    
    try {
      let dateObj: Date | null = null;
      
      if (dateValue instanceof Date) {
        dateObj = dateValue;
      } else if (typeof dateValue === 'string') {
        // Versuche ISO-Format (YYYY-MM-DD) zu parsen
        if (/^\d{4}-\d{2}-\d{2}/.test(dateValue)) {
          // Füge Zeit hinzu um Zeitzonen-Probleme zu vermeiden
          dateObj = new Date(`${dateValue}T12:00:00`);
          // Falls das nicht funktioniert, versuche ohne Zeit
          if (isNaN(dateObj.getTime())) {
            dateObj = new Date(dateValue);
          }
        } else {
          // Versuche deutsches Format (DD.MM.YYYY oder DD/MM/YYYY)
          const normalized = dateValue.trim().replace(/[\/\-]/g, '.');
          const parts = normalized.split('.');
          if (parts.length === 3) {
            const day = parts[0].padStart(2, '0');
            const month = parts[1].padStart(2, '0');
            const year = parts[2].length === 2 ? `20${parts[2]}` : parts[2];
            dateObj = new Date(`${year}-${month}-${day}T12:00:00`);
            // Falls das nicht funktioniert, versuche ohne Zeit
            if (isNaN(dateObj.getTime())) {
              dateObj = new Date(`${year}-${month}-${day}`);
            }
          }
        }
      }
      
      // Prüfe ob das Datum gültig ist
      if (dateObj && !isNaN(dateObj.getTime())) {
        return dateObj.toLocaleDateString('de-DE', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        });
      }
      
      // Fallback: Zeige Original-Wert (gekürzt falls zu lang)
      const str = String(dateValue);
      return str.length > 20 ? str.substring(0, 20) + '...' : str;
    } catch (error) {
      return String(dateValue).substring(0, 20);
    }
  };

  // Helper: Erstellt eine Beschreibung eines Items für die Historie
  const getItemDescription = (item: Record<string, unknown>, type: string): string => {
    switch (type) {
      case 'deadlines':
        const deadlineType = item.customLabel || item.type || 'Unbekannt';
        const dueDateStr = formatDateSafe(item.dueDate);
        return `${deadlineType} (${dueDateStr})`;
      case 'kpis':
        const kpiType = (item as any).kpiType?.name || 'Unbekannt';
        const target = item.targetValue !== undefined ? String(item.targetValue) : '0';
        return `${kpiType} (Ziel: ${target})`;
      case 'revenuePlan':
        return item.label ? String(item.label) : 'Unbenannt';
      case 'reportDuties':
        return item.reportType ? String(item.reportType) : 'Unbenannt';
      case 'proofOfUseItems':
        const seq = item.sequenceNumber !== undefined ? String(item.sequenceNumber) : '?';
        const type_ = item.proofType ? String(item.proofType) : 'Unbekannt';
        return `#${seq}: ${type_}`;
      case 'checklistItems':
        return item.label ? String(item.label) : 'Unbenannt';
      default:
        return 'Unbekannt';
    }
  };

  // Vergleiche alte und neue Items
  // Einfacher Ansatz: Vergleiche Anzahl und Beschreibungen
  const oldDescriptions = oldItems.map(item => getItemDescription(item, relationType));
  const newDescriptions = newItems.map(item => getItemDescription(item, relationType));

  // Gelöschte Items finden
  for (const oldDesc of oldDescriptions) {
    if (!newDescriptions.includes(oldDesc)) {
      historyEntries.push({
        contractId,
        changedById: userId,
        fieldName: relationType,
        fieldLabel: `${label} entfernt`,
        oldValue: serializeValue(oldDesc),
        newValue: null,
        changeType: 'DELETE',
      });
    }
  }

  // Neue Items finden
  for (const newDesc of newDescriptions) {
    if (!oldDescriptions.includes(newDesc)) {
      historyEntries.push({
        contractId,
        changedById: userId,
        fieldName: relationType,
        fieldLabel: `${label} hinzugefügt`,
        oldValue: null,
        newValue: serializeValue(newDesc),
        changeType: 'CREATE',
      });
    }
  }

  // Wenn sich nur die Anzahl geändert hat (gleiche Items, aber mehr/weniger)
  // Oder wenn alle Items gleich bleiben, aber die Anzahl sich ändert
  if (oldItems.length !== newItems.length && historyEntries.length === 0) {
    // Nur wenn Anzahl-Änderung ohne neue/gelöschte Items
    historyEntries.push({
      contractId,
      changedById: userId,
      fieldName: relationType,
      fieldLabel: `${label}${oldItems.length === 0 ? ' hinzugefügt' : newItems.length === 0 ? ' entfernt' : ' geändert'}`,
      oldValue: oldItems.length === 0 ? null : serializeValue(`${oldItems.length} Einträge`),
      newValue: newItems.length === 0 ? null : serializeValue(`${newItems.length} Einträge`),
      changeType: oldItems.length === 0 ? 'CREATE' : newItems.length === 0 ? 'DELETE' : 'UPDATE',
    });
  }

  // Alle Historie-Einträge in einem Batch erstellen
  if (historyEntries.length > 0) {
    await prisma.contractHistory.createMany({
      data: historyEntries,
    });
  }
}

// Export für Formatierung in UI
export { formatValue, deserializeValue, FIELD_LABELS };
