// TypeScript Typen für Vertragscontrolling

export type Role = 'ADMIN' | 'USER' | 'VIEWER';

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
  partner: string;
  description: string | null;
  typeId: string;
  type?: ContractType;
  startDate: Date;
  endDate: Date | null;
  terminationDate: Date | null;
  noticePeriodDays: number;
  value: number | null;
  currency: string;
  paymentInterval: string | null;
  status: ContractStatus;
  autoRenewal: boolean;
  notes: string | null;
  documentPath: string | null;
  reminderDays: number;
  reminderSent: boolean;
  createdById: string;
  createdBy?: User;
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

export interface ContractFormData {
  contractNumber: string;
  title: string;
  partner: string;
  description?: string;
  typeId: string;
  startDate: string;
  endDate?: string;
  terminationDate?: string;
  noticePeriodDays: number;
  value?: number;
  currency: string;
  paymentInterval?: string;
  status: ContractStatus;
  autoRenewal: boolean;
  notes?: string;
  reminderDays: number;
  deadlines: DeadlineFormData[];
  kpis: KpiFormData[];
}

// Session erweiterter Typ
export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: Role;
}

