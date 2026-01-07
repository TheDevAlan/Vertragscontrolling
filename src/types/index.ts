// TypeScript Typen für Vertragscontrolling

export type Role = 'ADMIN' | 'USER' | 'VIEWER';

export type ContractStatus = 'ACTIVE' | 'TERMINATED' | 'EXPIRED' | 'DRAFT';

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
}

// Session erweiterter Typ
export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: Role;
}

