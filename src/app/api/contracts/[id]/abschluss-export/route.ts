import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import ExcelJS from 'exceljs';

// Farben (wie beim Vertragsexport)
const COLORS = {
  headerBg: '94a3b8',      // Grau-Blau für Header
  headerFont: 'be004a',    // Primary für Header-Text
  tableBg: 'e2e8f0',       // Helles Grau für Tabellen-Header
  black: '000000',         // Schwarz für normalen Text
  green: '22c55e',         // Grün für erledigte Items
  white: 'ffffff',
};

// Kategorie-Labels
const CATEGORY_LABELS: Record<string, { label: string; description?: string }> = {
  MANAGEMENT: { label: '1. Management' },
  CONTROLLING: { label: '2. Controlling / Finanzen / Personalverwaltung' },
  IT: { label: '3. IT / ISMS / Datenschutz / ProDaBa' },
  QUALITAET: { label: '4. Qualität & Öffentlichkeitsarbeit' },
  NACHHALTIGKEIT: {
    label: '5. Nachhaltigkeit',
    description: 'Welche der folgenden 17 UN-Nachhaltigkeitsziele erfüllt das Projekt?',
  },
};

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const contract = await prisma.contract.findUnique({
      where: { id: params.id },
      include: {
        checklistItems: {
          orderBy: { sortOrder: 'asc' },
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

    const worksheet = workbook.addWorksheet('Abschluss-Checkliste', {
      views: [{ state: 'frozen', ySplit: 1 }],
    });

    // Spaltenbreiten
    worksheet.columns = [
      { width: 8 },   // Status
      { width: 60 },  // Aufgabe
      { width: 25 },  // Wer?
      { width: 35 },  // Bemerkung
    ];

    let currentRow = 1;

    // Titel
    const titleRow = worksheet.getRow(currentRow);
    titleRow.getCell(1).value = `Abschluss-Checkliste: ${contract.title}`;
    titleRow.getCell(1).font = { bold: true, size: 16, color: { argb: COLORS.headerFont } };
    worksheet.mergeCells(currentRow, 1, currentRow, 4);
    currentRow += 1;

    // Vertragsnummer
    const contractRow = worksheet.getRow(currentRow);
    contractRow.getCell(1).value = `Vertragsnummer: ${contract.contractNumber}`;
    contractRow.getCell(1).font = { size: 11, color: { argb: COLORS.black } };
    worksheet.mergeCells(currentRow, 1, currentRow, 4);
    currentRow += 1;

    // Fortschritt berechnen
    const totalItems = contract.checklistItems.length;
    const completedItems = contract.checklistItems.filter((item) => item.isCompleted).length;
    const progressRow = worksheet.getRow(currentRow);
    progressRow.getCell(1).value = `Gesamtfortschritt: ${completedItems} / ${totalItems} erledigt (${totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0}%)`;
    progressRow.getCell(1).font = { bold: true, size: 11, color: { argb: COLORS.black } };
    worksheet.mergeCells(currentRow, 1, currentRow, 4);
    currentRow += 2;

    // Kategorien
    const categories = ['MANAGEMENT', 'CONTROLLING', 'IT', 'QUALITAET', 'NACHHALTIGKEIT'];

    for (const categoryId of categories) {
      const items = contract.checklistItems.filter((item) => item.category === categoryId);
      if (items.length === 0) continue;

      const categoryConfig = CATEGORY_LABELS[categoryId];
      const isNachhaltigkeit = categoryId === 'NACHHALTIGKEIT';

      // Kategorie-Header
      const headerRow = worksheet.getRow(currentRow);
      const categoryCompleted = items.filter((item) => item.isCompleted).length;
      headerRow.getCell(1).value = `${categoryConfig.label} (${categoryCompleted}/${items.length})`;
      headerRow.getCell(1).font = { bold: true, size: 12, color: { argb: COLORS.headerFont } };
      headerRow.getCell(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: COLORS.headerBg },
      };
      worksheet.mergeCells(currentRow, 1, currentRow, 4);
      currentRow++;

      // Beschreibung (falls vorhanden)
      if (categoryConfig.description) {
        const descRow = worksheet.getRow(currentRow);
        descRow.getCell(1).value = categoryConfig.description;
        descRow.getCell(1).font = { italic: true, size: 10, color: { argb: COLORS.black } };
        worksheet.mergeCells(currentRow, 1, currentRow, 4);
        currentRow++;
      }

      // Tabellen-Header
      const tableHeaderRow = worksheet.getRow(currentRow);
      tableHeaderRow.getCell(1).value = 'Status';
      tableHeaderRow.getCell(2).value = 'Aufgabe';
      
      if (!isNachhaltigkeit) {
        tableHeaderRow.getCell(3).value = 'Wer?';
        tableHeaderRow.getCell(4).value = 'Bemerkung';
      }

      tableHeaderRow.eachCell((cell, colNumber) => {
        if (isNachhaltigkeit && colNumber > 2) return;
        cell.font = { bold: true, size: 10, color: { argb: COLORS.black } };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: COLORS.tableBg },
        };
        cell.border = {
          bottom: { style: 'thin', color: { argb: COLORS.black } },
        };
        cell.alignment = { horizontal: colNumber === 1 ? 'center' : 'left', vertical: 'middle' };
      });
      currentRow++;

      // Items
      for (const item of items) {
        const itemRow = worksheet.getRow(currentRow);
        
        // Status
        itemRow.getCell(1).value = item.isCompleted ? '✓' : '○';
        itemRow.getCell(1).font = {
          bold: true,
          size: 12,
          color: { argb: item.isCompleted ? COLORS.green : COLORS.black },
        };
        itemRow.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };

        // Aufgabe
        itemRow.getCell(2).value = item.label;
        itemRow.getCell(2).font = {
          size: 10,
          color: { argb: COLORS.black },
          strike: item.isCompleted,
        };
        itemRow.getCell(2).alignment = { vertical: 'middle', wrapText: true };

        if (!isNachhaltigkeit) {
          // Wer?
          itemRow.getCell(3).value = item.assignee || '';
          itemRow.getCell(3).font = { size: 10, color: { argb: COLORS.black } };
          itemRow.getCell(3).alignment = { vertical: 'middle' };

          // Bemerkung
          itemRow.getCell(4).value = item.remark || '';
          itemRow.getCell(4).font = { size: 10, color: { argb: COLORS.black } };
          itemRow.getCell(4).alignment = { vertical: 'middle', wrapText: true };
        }

        // Hintergrund für erledigte Items
        if (item.isCompleted) {
          itemRow.eachCell((cell, colNumber) => {
            if (isNachhaltigkeit && colNumber > 2) return;
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'dcfce7' }, // Sehr helles Grün
            };
          });
        }

        // Border
        itemRow.eachCell((cell, colNumber) => {
          if (isNachhaltigkeit && colNumber > 2) return;
          cell.border = {
            bottom: { style: 'hair', color: { argb: 'cbd5e1' } },
          };
        });

        currentRow++;
      }

      // Leerzeile nach Kategorie
      currentRow++;
    }

    // Export-Datum
    currentRow++;
    const dateRow = worksheet.getRow(currentRow);
    dateRow.getCell(1).value = `Exportiert am: ${new Date().toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })}`;
    dateRow.getCell(1).font = { size: 9, italic: true, color: { argb: '64748b' } };
    worksheet.mergeCells(currentRow, 1, currentRow, 4);

    // Excel-Datei als Buffer erstellen
    const buffer = await workbook.xlsx.writeBuffer();

    // Response mit Excel-Datei
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="Abschluss-Checkliste_${contract.contractNumber}.xlsx"`,
      },
    });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json(
      { success: false, error: 'Fehler beim Exportieren' },
      { status: 500 }
    );
  }
}

