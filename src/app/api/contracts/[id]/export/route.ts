import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import ExcelJS from 'exceljs';

export const dynamic = 'force-dynamic';

// Hilfsfunktionen für Formatierung
const formatDateForExcel = (date: Date | null | undefined): Date | string => {
  if (!date) return '';
  return new Date(date);
};

const getYearColumns = () => ['2024', '2025', '2026', '2027', '2028', '2029'];

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Vertrag mit allen Relationen laden
    const contract = await prisma.contract.findUnique({
      where: { id: params.id },
      include: {
        type: true,
        deadlines: {
          orderBy: { dueDate: 'asc' },
        },
        kpis: {
          include: {
            kpiType: true,
            history: {
              orderBy: { changedAt: 'desc' },
              take: 10,
            },
          },
        },
        revenuePlan: {
          orderBy: { sortOrder: 'asc' },
        },
        reportDuties: {
          orderBy: { sortOrder: 'asc' },
        },
        proofOfUseItems: {
          orderBy: { sequenceNumber: 'asc' },
        },
        createdBy: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (!contract) {
      return NextResponse.json(
        { success: false, error: 'Vertrag nicht gefunden' },
        { status: 404 }
      );
    }

    // Excel Workbook erstellen
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Vertragscontrolling';
    workbook.created = new Date();

    const worksheet = workbook.addWorksheet(contract.contractNumber, {
      views: [{ state: 'frozen', xSplit: 0, ySplit: 1 }],
    });

    let currentRow = 1;

    // === STYLING DEFINITIONEN ===
    // Sektions-Header: Hintergrund #94a3b8, Schrift #be004a
    
    const headerStyle: Partial<ExcelJS.Style> = {
      font: { bold: true, size: 14, color: { argb: 'FFbe004a' } }, // Primary-600
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF94a3b8' } }, // Grau-Blau
    };

    const subHeaderStyle: Partial<ExcelJS.Style> = {
      font: { bold: true, size: 11, color: { argb: 'FFbe004a' } }, // Primary-600
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF94a3b8' } }, // Grau-Blau
    };

    const labelStyle: Partial<ExcelJS.Style> = {
      font: { color: { argb: 'FF000000' } }, // Schwarz
    };

    const currencyFormat = '#,##0.00 €';
    const dateFormat = 'DD.MM.YYYY';
    const percentFormat = '0.00%';
    
    // Tabellen-Header Style
    const tableHeaderStyle: Partial<ExcelJS.Style> = {
      font: { bold: true, color: { argb: 'FF000000' } }, // Schwarz
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFe2e8f0' } }, // Helles Grau
      border: {
        bottom: { style: 'thin', color: { argb: 'FF94a3b8' } },
      },
    };

    // Hilfsfunktion: Sektion-Header hinzufügen
    const addSectionHeader = (title: string) => {
      const row = worksheet.getRow(currentRow);
      row.getCell(1).value = title;
      row.getCell(1).style = headerStyle;
      worksheet.mergeCells(currentRow, 1, currentRow, 8);
      row.height = 25;
      currentRow++;
    };

    // Hilfsfunktion: Feld hinzufügen
    const addField = (label: string, value: unknown, format?: string) => {
      const row = worksheet.getRow(currentRow);
      row.getCell(1).value = label;
      row.getCell(1).style = labelStyle;
      row.getCell(2).value = value as ExcelJS.CellValue;
      if (format === 'currency') {
        row.getCell(2).numFmt = currencyFormat;
      } else if (format === 'date' && value instanceof Date) {
        row.getCell(2).numFmt = dateFormat;
      } else if (format === 'percent') {
        row.getCell(2).numFmt = percentFormat;
      }
      currentRow++;
    };

    // Hilfsfunktion: Leerzeile
    const addEmptyRow = () => {
      currentRow++;
    };

    // === SEKTION 1: STAMMDATEN ===
    addSectionHeader('1. STAMMDATEN');

    addField('Projektbezeichnung', contract.title);
    if (contract.titleShort) addField('Abkürzung', contract.titleShort);
    addField('Vertragsnummer', contract.contractNumber);
    if (contract.esfNumber) addField('ESF-Nummer', contract.esfNumber);
    addField('Vertragsart', contract.type.name);
    addField('Vertragspartner', contract.partner);
    if (contract.client) addField('Auftraggeber', contract.client);
    if (contract.projectLead) addField('Projektleitung', contract.projectLead);
    if (contract.company) addField('Gesellschaft', contract.company);
    if (contract.costCenter) addField('Kostenstelle', contract.costCenter);
    if (contract.basisDocument) addField('Grundlage (Angebot/Kalkulation)', contract.basisDocument);
    addField('Laufzeit von', formatDateForExcel(contract.startDate), 'date');
    addField('Laufzeit bis', formatDateForExcel(contract.endDate), 'date');
    addField('Status', getStatusText(contract.status));
    addField('Daten entsprechen Vertrag', contract.dataMatchesContract ? 'Ja' : 'Nein');
    if (contract.description) addField('Beschreibung', contract.description);

    addEmptyRow();

    // === SEKTION 2: UMSATZPLANUNG & FINANZEN ===
    addSectionHeader('2. UMSATZPLANUNG & FINANZEN');

    // 2.1 Umsatz
    const row21 = worksheet.getRow(currentRow);
    row21.getCell(1).value = '2.1 Umsatz';
    row21.getCell(1).style = subHeaderStyle;
    worksheet.mergeCells(currentRow, 1, currentRow, 4);
    currentRow++;

    addField('Netto', contract.revenueNet || 0, 'currency');
    addField('MwSt (19%)', contract.revenueTax || 0, 'currency');
    addField('Brutto', contract.revenueGross || 0, 'currency');

    // 2.2 Zahlungsart
    if (contract.paymentMethod) {
      addEmptyRow();
      addField('2.2 Zahlungsart', contract.paymentMethod);
    }

    // 2.3 Umsatzplanung Tabelle
    if (contract.revenuePlan && contract.revenuePlan.length > 0) {
      addEmptyRow();
      const row23 = worksheet.getRow(currentRow);
      row23.getCell(1).value = '2.3 Umsatzplanung nach Jahren';
      row23.getCell(1).style = subHeaderStyle;
      worksheet.mergeCells(currentRow, 1, currentRow, 8);
      currentRow++;

      // Tabellen-Header
      const tableHeaderRow = worksheet.getRow(currentRow);
      const years = getYearColumns();
      const tableHeaders = ['Bezeichnung', ...years, 'Gesamt'];
      tableHeaders.forEach((header, idx) => {
        const cell = tableHeaderRow.getCell(idx + 1);
        cell.value = header;
        cell.style = tableHeaderStyle;
      });
      currentRow++;

      const dataStartRow = currentRow;

      // Datenzeilen mit Formeln
      contract.revenuePlan.forEach((entry, index) => {
        const row = worksheet.getRow(currentRow);
        row.getCell(1).value = entry.label;
        row.getCell(2).value = entry.year2024;
        row.getCell(2).numFmt = currencyFormat;
        row.getCell(3).value = entry.year2025;
        row.getCell(3).numFmt = currencyFormat;
        row.getCell(4).value = entry.year2026;
        row.getCell(4).numFmt = currencyFormat;
        row.getCell(5).value = entry.year2027;
        row.getCell(5).numFmt = currencyFormat;
        row.getCell(6).value = entry.year2028;
        row.getCell(6).numFmt = currencyFormat;
        row.getCell(7).value = entry.year2029;
        row.getCell(7).numFmt = currencyFormat;
        
        // Gesamt-Formel für die Zeile
        row.getCell(8).value = { 
          formula: `SUM(B${currentRow}:G${currentRow})`,
          result: entry.year2024 + entry.year2025 + entry.year2026 + entry.year2027 + entry.year2028 + entry.year2029,
        };
        row.getCell(8).numFmt = currencyFormat;
        
        currentRow++;
      });

      const dataEndRow = currentRow - 1;

      // Summenzeile mit Formeln
      const sumRow = worksheet.getRow(currentRow);
      sumRow.getCell(1).value = 'Summe';
      sumRow.getCell(1).font = { bold: true };
      
      for (let col = 2; col <= 8; col++) {
        const colLetter = String.fromCharCode(64 + col);
        sumRow.getCell(col).value = {
          formula: `SUM(${colLetter}${dataStartRow}:${colLetter}${dataEndRow})`,
        };
        sumRow.getCell(col).numFmt = currencyFormat;
        sumRow.getCell(col).font = { bold: true };
        sumRow.getCell(col).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFe2e8f0' } }; // Helles Grau
      }
      currentRow++;
    }

    addEmptyRow();

    // === SEKTION 3: BERICHTSPFLICHTEN ===
    addSectionHeader('3. BERICHTSPFLICHTEN');

    // 3.1 Berichtspflichten Matrix
    if (contract.reportDuties && contract.reportDuties.length > 0) {
      const row31 = worksheet.getRow(currentRow);
      row31.getCell(1).value = '3.1 Berichtspflichten';
      row31.getCell(1).style = subHeaderStyle;
      worksheet.mergeCells(currentRow, 1, currentRow, 8);
      currentRow++;

      // Tabellen-Header
      const tableHeaderRow = worksheet.getRow(currentRow);
      const years = getYearColumns();
      const reportHeaders = ['Berichtsart', ...years, 'Bemerkungen'];
      reportHeaders.forEach((header, idx) => {
        const cell = tableHeaderRow.getCell(idx + 1);
        cell.value = header;
        cell.style = tableHeaderStyle;
      });
      currentRow++;

      // Datenzeilen
      contract.reportDuties.forEach((duty) => {
        const row = worksheet.getRow(currentRow);
        row.getCell(1).value = duty.reportType;
        row.getCell(2).value = duty.year2024 || '';
        row.getCell(3).value = duty.year2025 || '';
        row.getCell(4).value = duty.year2026 || '';
        row.getCell(5).value = duty.year2027 || '';
        row.getCell(6).value = duty.year2028 || '';
        row.getCell(7).value = duty.year2029 || '';
        row.getCell(8).value = duty.remarks || '';
        currentRow++;
      });

      addEmptyRow();
    }

    // 3.2 - 3.4
    addField('3.2 Berichtspflichten mit Auszahlung gekoppelt', contract.reportsLinkedToPayment ? 'Ja' : 'Nein');
    if (contract.additionalObligations) {
      addField('3.3 Weitere Pflichten', contract.additionalObligations);
    }
    if (contract.refundDeadline) {
      addField('3.4 Mittel sind zurückzuzahlen bis', formatDateForExcel(contract.refundDeadline), 'date');
    }

    addEmptyRow();

    // === SEKTION 4: VERWENDUNGSNACHWEIS ===
    addSectionHeader('4. VERWENDUNGSNACHWEIS');

    addField('4.1 Verwendungsnachweis erforderlich', contract.proofOfUseRequired ? 'Ja' : 'Nein');

    // 4.2 Tabelle
    if (contract.proofOfUseRequired && contract.proofOfUseItems && contract.proofOfUseItems.length > 0) {
      addEmptyRow();
      const row42 = worksheet.getRow(currentRow);
      row42.getCell(1).value = '4.2 Verwendungsnachweise';
      row42.getCell(1).style = subHeaderStyle;
      worksheet.mergeCells(currentRow, 1, currentRow, 5);
      currentRow++;

      // Tabellen-Header
      const tableHeaderRow = worksheet.getRow(currentRow);
      const pouHeaders = ['Lfd.-Nr.', 'Termin', 'Art des VN/Abrechnung', 'WP-Testat notwendig'];
      pouHeaders.forEach((header, idx) => {
        const cell = tableHeaderRow.getCell(idx + 1);
        cell.value = header;
        cell.style = tableHeaderStyle;
      });
      currentRow++;

      // Datenzeilen
      contract.proofOfUseItems.forEach((item) => {
        const row = worksheet.getRow(currentRow);
        row.getCell(1).value = item.sequenceNumber;
        row.getCell(2).value = formatDateForExcel(item.dueDate);
        row.getCell(2).numFmt = dateFormat;
        row.getCell(3).value = item.proofType;
        row.getCell(4).value = item.auditorRequired ? 'Ja' : 'Nein';
        currentRow++;
      });

      addEmptyRow();
    }

    if (contract.proofOfUseRemarks) {
      addField('4.3 Bemerkungen zum Verwendungsnachweis', contract.proofOfUseRemarks);
    }

    addEmptyRow();

    // === SEKTION 5: KENNZAHLEN ===
    if (contract.kpis && contract.kpis.length > 0) {
      addSectionHeader('5. STEUERUNG VON KENNZAHLEN');

      // Tabellen-Header
      const tableHeaderRow = worksheet.getRow(currentRow);
      const kpiHeaders = ['Kennzahl', 'Zielwert', 'Aktueller Wert', 'Fortschritt', 'Fristdatum'];
      kpiHeaders.forEach((header, idx) => {
        const cell = tableHeaderRow.getCell(idx + 1);
        cell.value = header;
        cell.style = tableHeaderStyle;
      });
      currentRow++;

      // Datenzeilen
      contract.kpis.forEach((kpi) => {
        const row = worksheet.getRow(currentRow);
        row.getCell(1).value = kpi.kpiType?.name || 'Unbekannt';
        
        // Werte basierend auf Datentyp formatieren
        const dataType = kpi.kpiType?.dataType;
        if (dataType === 'CURRENCY') {
          row.getCell(2).value = kpi.targetValue;
          row.getCell(2).numFmt = currencyFormat;
          row.getCell(3).value = kpi.currentValue;
          row.getCell(3).numFmt = currencyFormat;
        } else if (dataType === 'PERCENT') {
          row.getCell(2).value = kpi.targetValue / 100;
          row.getCell(2).numFmt = percentFormat;
          row.getCell(3).value = kpi.currentValue / 100;
          row.getCell(3).numFmt = percentFormat;
        } else {
          row.getCell(2).value = kpi.targetValue;
          row.getCell(3).value = kpi.currentValue;
        }
        
        // Fortschritt als Formel
        const progress = kpi.targetValue > 0 ? kpi.currentValue / kpi.targetValue : 0;
        row.getCell(4).value = progress;
        row.getCell(4).numFmt = percentFormat;
        
        row.getCell(5).value = kpi.dueDate ? formatDateForExcel(kpi.dueDate) : '';
        if (kpi.dueDate) row.getCell(5).numFmt = dateFormat;
        
        currentRow++;
      });

      addEmptyRow();
    }

    // === SEKTION 6: FRISTEN ===
    if (contract.deadlines && contract.deadlines.length > 0) {
      addSectionHeader('6. FRISTEN');

      // Tabellen-Header
      const tableHeaderRow = worksheet.getRow(currentRow);
      const deadlineHeaders = ['Typ', 'Bezeichnung', 'Fällig am', 'Erinnerung (Tage)', 'Benachrichtigung', 'Status'];
      deadlineHeaders.forEach((header, idx) => {
        const cell = tableHeaderRow.getCell(idx + 1);
        cell.value = header;
        cell.style = tableHeaderStyle;
      });
      currentRow++;

      // Datenzeilen
      contract.deadlines.forEach((deadline) => {
        const row = worksheet.getRow(currentRow);
        row.getCell(1).value = getDeadlineTypeText(deadline.type);
        row.getCell(2).value = deadline.customLabel || '';
        row.getCell(3).value = formatDateForExcel(deadline.dueDate);
        row.getCell(3).numFmt = dateFormat;
        row.getCell(4).value = deadline.reminderDays;
        row.getCell(5).value = deadline.notifyEmail || '';
        row.getCell(6).value = deadline.isCompleted ? 'Erledigt' : 'Offen';
        currentRow++;
      });

      addEmptyRow();
    }

    // === METADATEN ===
    addSectionHeader('METADATEN');
    addField('Erstellt von', contract.createdBy?.name || contract.createdBy?.email || 'Unbekannt');
    addField('Erstellt am', formatDateForExcel(contract.createdAt), 'date');
    addField('Zuletzt geändert', formatDateForExcel(contract.updatedAt), 'date');
    addField('Export erstellt am', new Date(), 'date');

    // === SPALTENBREITEN AUTOMATISCH ANPASSEN ===
    worksheet.columns.forEach((column) => {
      let maxLength = 0;
      column.eachCell?.({ includeEmpty: false }, (cell) => {
        const cellLength = cell.value ? String(cell.value).length : 0;
        if (cellLength > maxLength) {
          maxLength = cellLength;
        }
      });
      column.width = Math.min(Math.max(maxLength + 2, 12), 50);
    });

    // Excel-Datei als Buffer generieren
    const buffer = await workbook.xlsx.writeBuffer();

    // Response mit korrektem Content-Type
    const filename = `Vertrag_${contract.contractNumber}_${new Date().toISOString().split('T')[0]}.xlsx`;
    
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Excel export error:', error);
    return NextResponse.json(
      { success: false, error: 'Fehler beim Erstellen des Excel-Exports' },
      { status: 500 }
    );
  }
}

// Hilfsfunktionen
function getStatusText(status: string): string {
  const statusMap: Record<string, string> = {
    ACTIVE: 'Aktiv',
    TERMINATED: 'Gekündigt',
    EXPIRED: 'Abgelaufen',
    DRAFT: 'Entwurf',
  };
  return statusMap[status] || status;
}

function getDeadlineTypeText(type: string): string {
  const typeMap: Record<string, string> = {
    KUENDIGUNG: 'Kündigungsfrist',
    VERLAENGERUNG: 'Verlängerungs-Deadline',
    PRUEFUNG: 'Prüfungsintervall',
    RECHNUNG: 'Rechnungslegung',
    SONSTIGES: 'Sonstiges',
  };
  return typeMap[type] || type;
}

