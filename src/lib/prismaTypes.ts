/**
 * Utility-Funktionen zur Konvertierung von Prisma-Typen zu TypeScript-Typen
 * 
 * Prisma gibt Enum-Werte als 'string' zurück, aber TypeScript erwartet Union-Types.
 * Diese Funktionen konvertieren Prisma-Ergebnisse zu unseren TypeScript-Interfaces.
 */

import type { DeadlineType, KpiDataType, Deadline, KpiType, ContractFull, ChecklistCategory } from '@/types';

/**
 * Konvertiert einen Prisma Deadline-String zu DeadlineType
 */
export function convertToDeadlineType(type: string): DeadlineType {
  const validTypes: DeadlineType[] = ['KUENDIGUNG', 'VERLAENGERUNG', 'PRUEFUNG', 'RECHNUNG', 'SONSTIGES'];
  if (validTypes.includes(type as DeadlineType)) {
    return type as DeadlineType;
  }
  // Fallback zu SONSTIGES wenn unbekannter Typ
  return 'SONSTIGES';
}

/**
 * Konvertiert einen Prisma KpiDataType-String zu KpiDataType
 */
export function convertToKpiDataType(dataType: string): KpiDataType {
  const validTypes: KpiDataType[] = ['NUMBER', 'PERCENT', 'CURRENCY'];
  if (validTypes.includes(dataType as KpiDataType)) {
    return dataType as KpiDataType;
  }
  // Fallback zu NUMBER wenn unbekannter Typ
  return 'NUMBER';
}

/**
 * Konvertiert einen Prisma ChecklistCategory-String zu ChecklistCategory
 */
export function convertToChecklistCategory(category: string): ChecklistCategory {
  const validCategories: ChecklistCategory[] = ['MANAGEMENT', 'CONTROLLING', 'IT', 'QUALITAET', 'NACHHALTIGKEIT'];
  if (validCategories.includes(category as ChecklistCategory)) {
    return category as ChecklistCategory;
  }
  // Fallback zu MANAGEMENT wenn unbekannte Kategorie
  return 'MANAGEMENT';
}

/**
 * Konvertiert ein Prisma Deadline-Objekt zu unserem Deadline-Interface
 */
export function convertDeadline(deadline: {
  id: string;
  contractId: string;
  type: string;
  customLabel: string | null;
  dueDate: Date;
  reminderDays: number;
  notifyEmail: string | null;
  isCompleted: boolean;
  completedAt: Date | null;
  reminderSent: boolean;
  createdAt: Date;
  updatedAt: Date;
}): Deadline {
  return {
    ...deadline,
    type: convertToDeadlineType(deadline.type),
    customLabel: deadline.customLabel,
    notifyEmail: deadline.notifyEmail,
  };
}

/**
 * Konvertiert ein Prisma KpiType-Objekt zu unserem KpiType-Interface
 */
export function convertKpiType(kpiType: {
  id: string;
  name: string;
  dataType: string;
  unit: string | null;
  description: string | null;
  color: string;
  createdAt: Date;
  updatedAt: Date;
  _count?: {
    contractKpis: number;
  };
}): KpiType {
  return {
    ...kpiType,
    dataType: convertToKpiDataType(kpiType.dataType),
    unit: kpiType.unit,
    description: kpiType.description,
  };
}

/**
 * Konvertiert ChecklistItems mit korrekten Kategorien
 */
export function convertChecklistItem(item: {
  id: string;
  contractId: string;
  category: string;
  label: string;
  assignee: string | null;
  remark: string | null;
  isCompleted: boolean;
  completedAt: Date | null;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    ...item,
    category: convertToChecklistCategory(item.category),
    assignee: item.assignee,
    remark: item.remark,
  };
}
