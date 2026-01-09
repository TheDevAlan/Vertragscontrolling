// Berechtigungslogik für Rollen-basierte Zugriffssteuerung
// Rollen: ADMIN, MANAGER, PROJEKTLEITUNG

import type { Role } from '@/types';

/**
 * Prüft ob der Benutzer alle Verträge sehen darf
 * ADMIN und MANAGER: Alle Verträge
 * PROJEKTLEITUNG: Nur eigene
 */
export const canViewAllContracts = (role: Role | string): boolean => {
  return ['ADMIN', 'MANAGER'].includes(role);
};

/**
 * Prüft ob der Benutzer einen bestimmten Vertrag sehen darf
 */
export const canViewContract = (
  role: Role | string,
  userId: string,
  contractCreatorId: string
): boolean => {
  // Admin und Manager sehen alle
  if (canViewAllContracts(role)) {
    return true;
  }
  // Projektleitung sieht nur eigene
  return userId === contractCreatorId;
};

/**
 * Prüft ob der Benutzer einen Vertrag bearbeiten darf
 * (Gleiche Logik wie Sichtbarkeit: nur sichtbare Verträge dürfen bearbeitet werden)
 */
export const canEditContract = (
  role: Role | string,
  userId: string,
  contractCreatorId: string
): boolean => {
  return canViewContract(role, userId, contractCreatorId);
};

/**
 * Prüft ob der Benutzer einen Vertrag löschen darf
 * (Gleiche Logik wie Bearbeiten)
 */
export const canDeleteContract = (
  role: Role | string,
  userId: string,
  contractCreatorId: string
): boolean => {
  return canEditContract(role, userId, contractCreatorId);
};

/**
 * Prüft ob der Benutzer Verträge erstellen darf
 * Alle angemeldeten Benutzer dürfen Verträge erstellen
 */
export const canCreateContract = (role: Role | string): boolean => {
  return ['ADMIN', 'MANAGER', 'PROJEKTLEITUNG'].includes(role);
};

/**
 * Prüft ob der Benutzer Einstellungen verwalten darf
 * Alle angemeldeten Benutzer dürfen Einstellungen verwalten
 */
export const canManageSettings = (role: Role | string): boolean => {
  return ['ADMIN', 'MANAGER', 'PROJEKTLEITUNG'].includes(role);
};

/**
 * Prüft ob der Benutzer andere Benutzer verwalten darf
 * Nur ADMIN darf Benutzer verwalten
 */
export const canManageUsers = (role: Role | string): boolean => {
  return role === 'ADMIN';
};

/**
 * Gibt den deutschen Namen der Rolle zurück
 */
export const getRoleName = (role: Role | string): string => {
  const roleNames: Record<string, string> = {
    ADMIN: 'Administrator',
    MANAGER: 'Manager',
    PROJEKTLEITUNG: 'Projektleitung',
  };
  return roleNames[role] || role;
};

/**
 * Alle verfügbaren Rollen
 */
export const AVAILABLE_ROLES: { value: Role; label: string }[] = [
  { value: 'ADMIN', label: 'Administrator' },
  { value: 'MANAGER', label: 'Manager' },
  { value: 'PROJEKTLEITUNG', label: 'Projektleitung' },
];
