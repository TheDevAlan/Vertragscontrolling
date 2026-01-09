// TypeScript Typen für Vertragscontrolling

export type Role = 'ADMIN' | 'MANAGER' | 'PROJEKTLEITUNG';

export type ContractStatus = 'ACTIVE' | 'TERMINATED' | 'EXPIRED' | 'DRAFT';

// Fristen-Typen
export type DeadlineType = 'KUENDIGUNG' | 'VERLAENGERUNG' | 'PRUEFUNG' | 'RECHNUNG' | 'SONSTIGES';
export type DeadlineStatus = 'ZUKUNFT' | 'KRITISCH' | 'ERLEDIGT' | 'VERPASST';

// Kennzahlen-Typen
export type KpiDataType = 'NUMBER' | 'PERCENT' | 'CURRENCY';

export interface User {
  id: string;
  email: string;
  name: string | null;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
}

export interface ContractType {
  id: string;
  name: string;
  color: string;
  createdAt: Date;
  _count?: {
    contracts: number;
  };
}

export interface Contract {
  id: string;
  contractNumber: string;
  title: string;
  titleShort: string | null;
  partner: string;
  description: string | null;
  
  // Sektion 1: Stammdaten
  esfNumber: string | null;
  client: string | null;
  projectLead: string | null;
  company: string | null;
  costCenter: string | null;
  basisDocument: string | null;
  dataMatchesContract: boolean;
  
  typeId: string;
  type?: ContractType;
  startDate: Date;
  endDate: Date | null;
  terminationDate: Date | null;
  noticePeriodDays: number;
  
  // Sektion 2: Umsatzplanung & Finanzen
  revenueNet: number | null;
  revenueTax: number | null;
  revenueGross: number | null;
  paymentMethod: string | null;
  
  value: number | null;
  currency: string;
  paymentInterval: string | null;
  status: ContractStatus;
  autoRenewal: boolean;
  
  // Sektion 3: Berichtspflichten
  reportsLinkedToPayment: boolean;
  additionalObligations: string | null;
  refundDeadline: Date | null;
  
  // Sektion 4: Verwendungsnachweis
  proofOfUseRequired: boolean;
  proofOfUseRemarks: string | null;
  
  notes: string | null;
  documentPath: string | null;
  reminderDays: number;
  reminderSent: boolean;
  createdById: string;
  createdBy?: User;
  createdAt: Date;
  updatedAt: Date;
}

// Umsatzplanung Eintrag
export interface RevenuePlanEntry {
  id: string;
  contractId: string;
  label: string;
  year2024: number;
  year2025: number;
  year2026: number;
  year2027: number;
  year2028: number;
  year2029: number;
  sortOrder: number;
}

// Berichtspflichten Eintrag
export interface ReportDuty {
  id: string;
  contractId: string;
  reportType: string;
  year2024: string | null;
  year2025: string | null;
  year2026: string | null;
  year2027: string | null;
  year2028: string | null;
  year2029: string | null;
  remarks: string | null;
  sortOrder: number;
}

// Verwendungsnachweis Eintrag
export interface ProofOfUseItem {
  id: string;
  contractId: string;
  sequenceNumber: number;
  dueDate: Date;
  proofType: string;
  auditorRequired: boolean;
  sortOrder: number;
}

// Checklisten-Kategorien (Sektion 7: Abschluss)
export type ChecklistCategory = 'MANAGEMENT' | 'CONTROLLING' | 'IT' | 'QUALITAET' | 'NACHHALTIGKEIT';

// Checklisten-Eintrag
export interface ChecklistItem {
  id: string;
  contractId: string;
  category: ChecklistCategory;
  label: string;
  assignee: string | null;
  remark: string | null;
  isCompleted: boolean;
  completedAt: Date | null;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ContractWithType extends Contract {
  type: ContractType;
}

// Frist-Interface
export interface Deadline {
  id: string;
  contractId: string;
  type: DeadlineType;
  customLabel: string | null;
  dueDate: Date;
  reminderDays: number;
  notifyEmail: string | null;
  isCompleted: boolean;
  completedAt: Date | null;
  reminderSent: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Frist mit berechnetem Status
export interface DeadlineWithStatus extends Deadline {
  status: DeadlineStatus;
  daysUntilDue: number | null;
}

export interface ContractWithDeadlines extends Contract {
  type: ContractType;
  deadlines: Deadline[];
}

// Kennzahlen-Interfaces
export interface KpiType {
  id: string;
  name: string;
  dataType: KpiDataType;
  unit: string | null;
  description: string | null;
  color: string;
  createdAt: Date;
  updatedAt: Date;
  _count?: {
    contractKpis: number;
  };
}

export interface KpiHistory {
  id: string;
  contractKpiId: string;
  previousValue: number;
  newValue: number;
  changedAt: Date;
  changedBy: string | null;
  note: string | null;
}

export interface ContractKpi {
  id: string;
  contractId: string;
  kpiTypeId: string;
  kpiType?: KpiType;
  targetValue: number;
  currentValue: number;
  dueDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
  history?: KpiHistory[];
}

export interface ContractWithKpis extends ContractWithDeadlines {
  kpis: ContractKpi[];
}

// Erweiterter Vertrag mit allen Relationen
export interface ContractFull extends Contract {
  type: ContractType;
  deadlines: Deadline[];
  kpis: ContractKpi[];
  revenuePlan: RevenuePlanEntry[];
  reportDuties: ReportDuty[];
  proofOfUseItems: ProofOfUseItem[];
  checklistItems: ChecklistItem[];
}

// Dashboard Statistiken
export interface DashboardStats {
  totalContracts: number;
  activeContracts: number;
  expiringContracts: number;
  totalValue: number;
}

export interface ContractTypeDistribution {
  name: string;
  value: number;
  color: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Form Types
export interface DeadlineFormData {
  id?: string;
  type: DeadlineType;
  customLabel?: string;
  dueDate: string;
  reminderDays: number;
  notifyEmail?: string;
  isCompleted?: boolean;
}

export interface KpiFormData {
  id?: string;
  kpiTypeId: string;
  targetValue: number;
  currentValue?: number;
  dueDate?: string;
}

// Form Types für neue Sektionen
export interface RevenuePlanFormData {
  id?: string;
  label: string;
  year2024: number;
  year2025: number;
  year2026: number;
  year2027: number;
  year2028: number;
  year2029: number;
}

export interface ReportDutyFormData {
  id?: string;
  reportType: string;
  year2024?: string;
  year2025?: string;
  year2026?: string;
  year2027?: string;
  year2028?: string;
  year2029?: string;
  remarks?: string;
}

export interface ProofOfUseFormData {
  id?: string;
  sequenceNumber: number;
  dueDate: string;
  proofType: string;
  auditorRequired: boolean;
}

export interface ChecklistItemFormData {
  id?: string;
  category: ChecklistCategory;
  label: string;
  assignee?: string;
  remark?: string;
  isCompleted?: boolean;
}

export interface ContractFormData {
  // Sektion 1: Stammdaten
  contractNumber: string;
  title: string;
  titleShort?: string;
  partner: string;
  description?: string;
  esfNumber?: string;
  client?: string;
  projectLead?: string;
  company?: string;
  costCenter?: string;
  basisDocument?: string;
  dataMatchesContract: boolean;
  typeId: string;
  startDate: string;
  endDate?: string;
  
  // Legacy Felder
  terminationDate?: string;
  noticePeriodDays: number;
  value?: number;
  currency: string;
  paymentInterval?: string;
  status: ContractStatus;
  autoRenewal: boolean;
  
  // Sektion 2: Umsatzplanung & Finanzen
  revenueNet?: number;
  revenueTax?: number;
  revenueGross?: number;
  paymentMethod?: string;
  revenuePlan: RevenuePlanFormData[];
  
  // Sektion 3: Berichtspflichten
  reportsLinkedToPayment: boolean;
  additionalObligations?: string;
  refundDeadline?: string;
  reportDuties: ReportDutyFormData[];
  
  // Sektion 4: Verwendungsnachweis
  proofOfUseRequired: boolean;
  proofOfUseRemarks?: string;
  proofOfUseItems: ProofOfUseFormData[];
  
  // Sonstige
  notes?: string;
  reminderDays: number;
  
  // Sektion 5 & 6: Kennzahlen und Fristen (unverändert)
  deadlines: DeadlineFormData[];
  kpis: KpiFormData[];
  
  // Sektion 7: Abschluss-Checkliste
  checklistItems: ChecklistItemFormData[];
}

// Session erweiterter Typ
export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: Role;
}

