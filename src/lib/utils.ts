import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Kombiniert Tailwind-Klassen intelligent
 */
export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs));
};

/**
 * Formatiert ein Datum im deutschen Format
 */
export const formatDate = (date: Date | string | null | undefined): string => {
  if (!date) return '-';
  const d = new Date(date);
  return d.toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

/**
 * Formatiert einen Betrag als Währung
 */
export const formatCurrency = (
  amount: number | null | undefined,
  currency: string = 'EUR'
): string => {
  if (amount === null || amount === undefined) return '-';
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency,
  }).format(amount);
};

/**
 * Berechnet die Tage bis zu einem Datum
 */
export const daysUntil = (date: Date | string | null | undefined): number | null => {
  if (!date) return null;
  const target = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  const diffTime = target.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Gibt den Status-Text zurück
 */
export const getStatusText = (status: string): string => {
  const statusMap: Record<string, string> = {
    ACTIVE: 'Aktiv',
    TERMINATED: 'Gekündigt',
    EXPIRED: 'Abgelaufen',
    DRAFT: 'Entwurf',
  };
  return statusMap[status] || status;
};

/**
 * Gibt die Status-Farbe zurück
 */
export const getStatusColor = (status: string): string => {
  const colorMap: Record<string, string> = {
    ACTIVE: 'bg-green-100 text-green-800',
    TERMINATED: 'bg-yellow-100 text-yellow-800',
    EXPIRED: 'bg-red-100 text-red-800',
    DRAFT: 'bg-gray-100 text-gray-800',
  };
  return colorMap[status] || 'bg-gray-100 text-gray-800';
};

/**
 * Generiert eine eindeutige Vertragsnummer
 */
export const generateContractNumber = (prefix: string = 'VT'): string => {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${prefix}-${year}-${random}`;
};

/**
 * Frist-Typen für Dropdown
 */
export const DEADLINE_TYPE_OPTIONS = [
  { value: 'KUENDIGUNG', label: 'Kündigungsfrist' },
  { value: 'VERLAENGERUNG', label: 'Verlängerungs-Deadline' },
  { value: 'PRUEFUNG', label: 'Prüfungsintervall' },
  { value: 'RECHNUNG', label: 'Rechnungslegung' },
  { value: 'SONSTIGES', label: 'Sonstiges' },
] as const;

/**
 * Erinnerungs-Presets in Tagen
 */
export const REMINDER_PRESETS = [
  { value: 7, label: '7 Tage vorher' },
  { value: 14, label: '14 Tage vorher' },
  { value: 30, label: '30 Tage vorher' },
  { value: 90, label: '90 Tage vorher' },
] as const;

/**
 * Gibt den Frist-Typ-Text zurück
 */
export const getDeadlineTypeText = (type: string): string => {
  const typeMap: Record<string, string> = {
    KUENDIGUNG: 'Kündigungsfrist',
    VERLAENGERUNG: 'Verlängerungs-Deadline',
    PRUEFUNG: 'Prüfungsintervall',
    RECHNUNG: 'Rechnungslegung',
    SONSTIGES: 'Sonstiges',
  };
  return typeMap[type] || type;
};

/**
 * Berechnet den Status einer Frist
 * - ERLEDIGT: isCompleted = true
 * - VERPASST: dueDate in der Vergangenheit und nicht erledigt
 * - KRITISCH: dueDate <= 30 Tage in der Zukunft
 * - ZUKUNFT: dueDate > 30 Tage in der Zukunft
 */
export const getDeadlineStatus = (
  dueDate: Date | string,
  isCompleted: boolean
): { status: 'ZUKUNFT' | 'KRITISCH' | 'ERLEDIGT' | 'VERPASST'; daysUntil: number } => {
  if (isCompleted) {
    return { status: 'ERLEDIGT', daysUntil: 0 };
  }

  const days = daysUntil(dueDate) ?? 0;

  if (days < 0) {
    return { status: 'VERPASST', daysUntil: days };
  }

  if (days <= 30) {
    return { status: 'KRITISCH', daysUntil: days };
  }

  return { status: 'ZUKUNFT', daysUntil: days };
};

/**
 * Gibt die Farbe für den Frist-Status zurück
 */
export const getDeadlineStatusColor = (status: string): string => {
  const colorMap: Record<string, string> = {
    ZUKUNFT: 'bg-blue-100 text-blue-800',
    KRITISCH: 'bg-amber-100 text-amber-800',
    ERLEDIGT: 'bg-green-100 text-green-800',
    VERPASST: 'bg-red-100 text-red-800',
  };
  return colorMap[status] || 'bg-gray-100 text-gray-800';
};

/**
 * Gibt den Status-Text für Fristen zurück
 */
export const getDeadlineStatusText = (status: string): string => {
  const statusMap: Record<string, string> = {
    ZUKUNFT: 'Zukunft',
    KRITISCH: 'Kritisch',
    ERLEDIGT: 'Erledigt',
    VERPASST: 'Verpasst',
  };
  return statusMap[status] || status;
};

