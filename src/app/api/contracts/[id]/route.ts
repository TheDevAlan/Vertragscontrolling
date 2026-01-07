import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Validierungs-Schema für Fristen
const deadlineSchema = z.object({
  id: z.string().optional(),
  type: z.enum(['KUENDIGUNG', 'VERLAENGERUNG', 'PRUEFUNG', 'RECHNUNG', 'SONSTIGES']),
  customLabel: z.string().optional(),
  dueDate: z.string().min(1, 'Fristdatum erforderlich'),
  reminderDays: z.number().min(0).default(30),
  notifyEmail: z.string().email().optional().or(z.literal('')),
  isCompleted: z.boolean().optional().default(false),
});

// Validierungs-Schema für Kennzahlen
const kpiSchema = z.object({
  id: z.string().optional(),
  kpiTypeId: z.string().min(1, 'Kennzahl erforderlich'),
  targetValue: z.number(),
  currentValue: z.number().optional().default(0),
  dueDate: z.string().optional(),
});

// Validierungs-Schema für Umsatzplanung
const revenuePlanSchema = z.object({
  id: z.string().optional(),
  label: z.string(),
  year2024: z.number().default(0),
  year2025: z.number().default(0),
  year2026: z.number().default(0),
  year2027: z.number().default(0),
  year2028: z.number().default(0),
  year2029: z.number().default(0),
});

// Validierungs-Schema für Berichtspflichten
const reportDutySchema = z.object({
  id: z.string().optional(),
  reportType: z.string(),
  year2024: z.string().optional(),
  year2025: z.string().optional(),
  year2026: z.string().optional(),
  year2027: z.string().optional(),
  year2028: z.string().optional(),
  year2029: z.string().optional(),
  remarks: z.string().optional(),
});

// Validierungs-Schema für Verwendungsnachweis
const proofOfUseSchema = z.object({
  id: z.string().optional(),
  sequenceNumber: z.number(),
  dueDate: z.string(),
  proofType: z.string(),
  auditorRequired: z.boolean().default(false),
});

// Validierungs-Schema für Checkliste (Sektion 7: Abschluss)
const checklistItemSchema = z.object({
  id: z.string().optional(),
  category: z.enum(['MANAGEMENT', 'CONTROLLING', 'IT', 'QUALITAET', 'NACHHALTIGKEIT']),
  label: z.string(),
  assignee: z.string().optional(),
  remark: z.string().optional(),
  isCompleted: z.boolean().optional().default(false),
});

// Validierungs-Schema für Updates
const updateSchema = z.object({
  // Sektion 1: Stammdaten
  title: z.string().min(1).optional(),
  titleShort: z.string().optional(),
  partner: z.string().min(1).optional(),
  description: z.string().optional(),
  esfNumber: z.string().optional(),
  client: z.string().optional(),
  projectLead: z.string().optional(),
  company: z.string().optional(),
  costCenter: z.string().optional(),
  basisDocument: z.string().optional(),
  dataMatchesContract: z.boolean().optional(),
  typeId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  
  // Legacy
  terminationDate: z.string().optional(),
  noticePeriodDays: z.number().min(0).optional(),
  value: z.number().optional(),
  currency: z.string().optional(),
  paymentInterval: z.string().optional(),
  status: z.enum(['ACTIVE', 'TERMINATED', 'EXPIRED', 'DRAFT']).optional(),
  autoRenewal: z.boolean().optional(),
  
  // Sektion 2: Umsatzplanung
  revenueNet: z.number().optional(),
  revenueTax: z.number().optional(),
  revenueGross: z.number().optional(),
  paymentMethod: z.string().optional(),
  revenuePlan: z.array(revenuePlanSchema).optional(),
  
  // Sektion 3: Berichtspflichten
  reportsLinkedToPayment: z.boolean().optional(),
  additionalObligations: z.string().optional(),
  refundDeadline: z.string().optional(),
  reportDuties: z.array(reportDutySchema).optional(),
  
  // Sektion 4: Verwendungsnachweis
  proofOfUseRequired: z.boolean().optional(),
  proofOfUseRemarks: z.string().optional(),
  proofOfUseItems: z.array(proofOfUseSchema).optional(),
  
  // Sonstige
  notes: z.string().optional(),
  reminderDays: z.number().min(0).optional(),
  
  // Sektion 5 & 6
  deadlines: z.array(deadlineSchema).optional(),
  kpis: z.array(kpiSchema).optional(),
  
  // Sektion 7: Abschluss-Checkliste
  checklistItems: z.array(checklistItemSchema).optional(),
});

// GET: Einzelnen Vertrag abrufen
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
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
        checklistItems: {
          orderBy: { sortOrder: 'asc' },
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

    return NextResponse.json({ success: true, data: contract });
  } catch (error) {
    console.error('GET contract error:', error);
    return NextResponse.json(
      { success: false, error: 'Fehler beim Abrufen des Vertrags' },
      { status: 500 }
    );
  }
}

// PUT: Vertrag aktualisieren
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    // Prüfen, ob Vertrag existiert
    const existing = await prisma.contract.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Vertrag nicht gefunden' },
        { status: 404 }
      );
    }

    // Validierung
    const validationResult = updateSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validierungsfehler',
          details: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Update-Daten vorbereiten
    const updateData: Record<string, unknown> = {};

    // Sektion 1: Stammdaten
    if (data.title !== undefined) updateData.title = data.title;
    if (data.titleShort !== undefined) updateData.titleShort = data.titleShort || null;
    if (data.partner !== undefined) updateData.partner = data.partner;
    if (data.description !== undefined) updateData.description = data.description || null;
    if (data.esfNumber !== undefined) updateData.esfNumber = data.esfNumber || null;
    if (data.client !== undefined) updateData.client = data.client || null;
    if (data.projectLead !== undefined) updateData.projectLead = data.projectLead || null;
    if (data.company !== undefined) updateData.company = data.company || null;
    if (data.costCenter !== undefined) updateData.costCenter = data.costCenter || null;
    if (data.basisDocument !== undefined) updateData.basisDocument = data.basisDocument || null;
    if (data.dataMatchesContract !== undefined) updateData.dataMatchesContract = data.dataMatchesContract;
    if (data.typeId !== undefined) updateData.typeId = data.typeId;
    if (data.startDate !== undefined) updateData.startDate = new Date(data.startDate);
    if (data.endDate !== undefined) updateData.endDate = data.endDate ? new Date(data.endDate) : null;
    
    // Legacy
    if (data.terminationDate !== undefined) updateData.terminationDate = data.terminationDate ? new Date(data.terminationDate) : null;
    if (data.noticePeriodDays !== undefined) updateData.noticePeriodDays = data.noticePeriodDays;
    if (data.value !== undefined) updateData.value = data.value || null;
    if (data.currency !== undefined) updateData.currency = data.currency;
    if (data.paymentInterval !== undefined) updateData.paymentInterval = data.paymentInterval || null;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.autoRenewal !== undefined) updateData.autoRenewal = data.autoRenewal;
    
    // Sektion 2: Umsatzplanung
    if (data.revenueNet !== undefined) {
      updateData.revenueNet = data.revenueNet || null;
      updateData.revenueTax = data.revenueNet ? data.revenueNet * 0.19 : null;
      updateData.revenueGross = data.revenueNet ? data.revenueNet * 1.19 : null;
    }
    if (data.paymentMethod !== undefined) updateData.paymentMethod = data.paymentMethod || null;
    
    // Sektion 3: Berichtspflichten
    if (data.reportsLinkedToPayment !== undefined) updateData.reportsLinkedToPayment = data.reportsLinkedToPayment;
    if (data.additionalObligations !== undefined) updateData.additionalObligations = data.additionalObligations || null;
    if (data.refundDeadline !== undefined) updateData.refundDeadline = data.refundDeadline ? new Date(data.refundDeadline) : null;
    
    // Sektion 4: Verwendungsnachweis
    if (data.proofOfUseRequired !== undefined) updateData.proofOfUseRequired = data.proofOfUseRequired;
    if (data.proofOfUseRemarks !== undefined) updateData.proofOfUseRemarks = data.proofOfUseRemarks || null;
    
    // Sonstige
    if (data.notes !== undefined) updateData.notes = data.notes || null;
    if (data.reminderDays !== undefined) updateData.reminderDays = data.reminderDays;

    // Fristen verarbeiten (falls übergeben)
    if (body.deadlines !== undefined) {
      // Alle existierenden Fristen löschen
      await prisma.deadline.deleteMany({
        where: { contractId: params.id },
      });

      // Fristen aus dem Formular übernehmen
      const deadlinesToCreate = [...body.deadlines];

      // Automatisch Rückzahlungsfrist hinzufügen wenn refundDeadline gesetzt ist
      if (data.refundDeadline) {
        // Prüfen ob bereits eine Rückzahlungsfrist in den Fristen existiert
        const hasRefundDeadline = deadlinesToCreate.some(
          (d: { type: string; customLabel?: string }) => 
            d.type === 'SONSTIGES' && d.customLabel === 'Rückzahlung Mittel'
        );

        if (!hasRefundDeadline) {
          deadlinesToCreate.push({
            type: 'SONSTIGES',
            customLabel: 'Rückzahlung Mittel',
            dueDate: data.refundDeadline,
            reminderDays: 30,
            notifyEmail: '',
            isCompleted: false,
          });
        }
      }

      if (deadlinesToCreate.length > 0) {
        await prisma.deadline.createMany({
          data: deadlinesToCreate.map((deadline: z.infer<typeof deadlineSchema>) => ({
            contractId: params.id,
            type: deadline.type,
            customLabel: deadline.customLabel || null,
            dueDate: new Date(deadline.dueDate),
            reminderDays: deadline.reminderDays,
            notifyEmail: deadline.notifyEmail || null,
            isCompleted: deadline.isCompleted || false,
          })),
        });
      }
    }

    // Kennzahlen verarbeiten (falls übergeben)
    if (body.kpis !== undefined) {
      await prisma.contractKpi.deleteMany({
        where: { contractId: params.id },
      });

      if (body.kpis.length > 0) {
        await prisma.contractKpi.createMany({
          data: body.kpis.map((kpi: z.infer<typeof kpiSchema>) => ({
            contractId: params.id,
            kpiTypeId: kpi.kpiTypeId,
            targetValue: kpi.targetValue,
            currentValue: kpi.currentValue || 0,
            dueDate: kpi.dueDate ? new Date(kpi.dueDate) : null,
          })),
        });
      }
    }

    // Umsatzplanung verarbeiten (falls übergeben)
    if (body.revenuePlan !== undefined) {
      await prisma.revenuePlanEntry.deleteMany({
        where: { contractId: params.id },
      });

      if (body.revenuePlan.length > 0) {
        await prisma.revenuePlanEntry.createMany({
          data: body.revenuePlan.map((entry: z.infer<typeof revenuePlanSchema>, index: number) => ({
            contractId: params.id,
            label: entry.label,
            year2024: entry.year2024,
            year2025: entry.year2025,
            year2026: entry.year2026,
            year2027: entry.year2027,
            year2028: entry.year2028,
            year2029: entry.year2029,
            sortOrder: index,
          })),
        });
      }
    }

    // Berichtspflichten verarbeiten (falls übergeben)
    if (body.reportDuties !== undefined) {
      await prisma.reportDuty.deleteMany({
        where: { contractId: params.id },
      });

      if (body.reportDuties.length > 0) {
        await prisma.reportDuty.createMany({
          data: body.reportDuties.map((duty: z.infer<typeof reportDutySchema>, index: number) => ({
            contractId: params.id,
            reportType: duty.reportType,
            year2024: duty.year2024 || null,
            year2025: duty.year2025 || null,
            year2026: duty.year2026 || null,
            year2027: duty.year2027 || null,
            year2028: duty.year2028 || null,
            year2029: duty.year2029 || null,
            remarks: duty.remarks || null,
            sortOrder: index,
          })),
        });
      }
    }

    // Verwendungsnachweis verarbeiten (falls übergeben)
    if (body.proofOfUseItems !== undefined) {
      await prisma.proofOfUseItem.deleteMany({
        where: { contractId: params.id },
      });

      if (body.proofOfUseItems.length > 0) {
        await prisma.proofOfUseItem.createMany({
          data: body.proofOfUseItems.map((item: z.infer<typeof proofOfUseSchema>, index: number) => ({
            contractId: params.id,
            sequenceNumber: item.sequenceNumber,
            dueDate: new Date(item.dueDate),
            proofType: item.proofType,
            auditorRequired: item.auditorRequired,
            sortOrder: index,
          })),
        });
      }
    }

    // Checkliste verarbeiten (falls übergeben)
    if (body.checklistItems !== undefined) {
      await prisma.checklistItem.deleteMany({
        where: { contractId: params.id },
      });

      if (body.checklistItems.length > 0) {
        await prisma.checklistItem.createMany({
          data: body.checklistItems.map((item: z.infer<typeof checklistItemSchema>, index: number) => ({
            contractId: params.id,
            category: item.category,
            label: item.label,
            assignee: item.assignee || null,
            remark: item.remark || null,
            isCompleted: item.isCompleted || false,
            sortOrder: index,
          })),
        });
      }
    }

    // Vertrag aktualisieren
    const contract = await prisma.contract.update({
      where: { id: params.id },
      data: updateData,
      include: {
        type: true,
        deadlines: {
          orderBy: { dueDate: 'asc' },
        },
        kpis: {
          include: {
            kpiType: true,
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
        checklistItems: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    return NextResponse.json({ success: true, data: contract });
  } catch (error) {
    console.error('PUT contract error:', error);
    return NextResponse.json(
      { success: false, error: 'Fehler beim Aktualisieren des Vertrags' },
      { status: 500 }
    );
  }
}

// DELETE: Vertrag löschen
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Prüfen, ob Vertrag existiert
    const existing = await prisma.contract.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Vertrag nicht gefunden' },
        { status: 404 }
      );
    }

    // Vertrag löschen (Cascade löscht alle Relationen)
    await prisma.contract.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true, message: 'Vertrag gelöscht' });
  } catch (error) {
    console.error('DELETE contract error:', error);
    return NextResponse.json(
      { success: false, error: 'Fehler beim Löschen des Vertrags' },
      { status: 500 }
    );
  }
}
