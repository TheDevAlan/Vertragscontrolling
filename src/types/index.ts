// TypeScript Typen für Vertragscontrolling

export type Role = 'ADMIN' | 'USER' | 'VIEWER';

export type ContractStatus = 'ACTIVE' | 'TERMINATED' | 'EXPIRED' | 'DRAFT';

// Fristen-Typen
export type DeadlineType = 'KUENDIGUNG' | 'VERLAENGERUNG' | 'PRUEFUNG' | 'RECHNUNG' | 'SONSTIGES';
export type DeadlineStatus = 'ZUKUNFT' | 'KRITISCH' | 'ERLEDIGT' | 'VERPASST';

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
}

// Session erweiterter Typ
export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: Role;
}

