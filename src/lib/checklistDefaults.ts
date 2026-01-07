// Standard-Checklisten-Items für den Abschluss
import type { ChecklistCategory, ChecklistItemFormData } from '@/types';

export interface ChecklistCategoryConfig {
  id: ChecklistCategory;
  label: string;
  description?: string;
  items: string[];
}

export const CHECKLIST_CATEGORIES: ChecklistCategoryConfig[] = [
  {
    id: 'MANAGEMENT',
    label: '1. Management',
    items: [
      'Auftrag Windream-Verzeichnisse und Projektleitung benennen',
      'Ziele/ Qualitätsstandards / Kennziffern bestimmen (Vertragscontrolling - inhaltlich)',
      'Aufbau- und Ablauforganisation entwerfen',
      'Projekt-/ Zeit-/ Meilensteinplanung',
      'Personaleinsatz und Qualifizierungen',
      'Durchführung einer Risikoanalyse',
      'Abstimmung des Antrags- und Nachweisprüfkonzepts (für Fördermittelprojekte)',
    ],
  },
  {
    id: 'CONTROLLING',
    label: '2. Controlling / Finanzen / Personalverwaltung',
    items: [
      'FiBu und Kostenstelle einrichten',
      'Bankkonten bei BFS einrichten',
      'Organisatorische Anlage des Projekts in Rexx (Festlegung der Projektzeiterfassungskategorie, ggf. Anlage einer neuen Organisationseinheit mit eigenen Stellen)',
    ],
  },
  {
    id: 'IT',
    label: '3. IT / ISMS / Datenschutz / ProDaBa',
    items: [
      'Abstimmung IT-Themen (Konzept und Bedarf)',
      'Zugriffsrechte für MA in windream beauftragen für „03 Programme" bei Bedarf „13 Zahlungsverkehr" (bei ZN/ VN Prüfung vorher Zugriffsbedarf GPT klären)',
      'Abstimmung mit ISMS-Beauftragten',
      'Abstimmung mit Datenschutzbeauftragten',
      'Beim Einsatz der ProDaBa - Abstimmung und Beantragung von Zugriffsrechten in Jira',
      'Beim Einsatz der ProDaBa – Programmstammdaten an Softwareentwicklung übermitteln (Jira-Ticket)',
      'Aufbewahrungsfrist der Unterlagen gemäß Vertrag bzw. gesetzlicher Regelung dokumentieren',
    ],
  },
  {
    id: 'QUALITAET',
    label: '4. Qualität & Öffentlichkeitsarbeit',
    items: [
      'Projektsteckbrief in Confluence erstellen',
      'Projekthandbuch (PHB) erstellen',
      'Kurzinformation über das Projekt in der Führungskräftesitzung',
      'Mitteilung an das Zentralsekretariat (Projektbeginn, E-Mail-Adresse, Telefonnummer/Hotline-Nummer, Hotline-Zeiten, verantwortliche*r Mitarbeiter*in)',
    ],
  },
  {
    id: 'NACHHALTIGKEIT',
    label: '5. Nachhaltigkeit',
    description: 'Welche der folgenden 17 UN-Nachhaltigkeitsziele erfüllt das Projekt? Bitte ankreuzen.',
    items: [
      '1. Keine Armut',
      '2. Kein Hunger',
      '3. Gesundheit und Wohlergehen',
      '4. Hochwertige Bildung',
      '5. Geschlechtergleichheit',
      '6. Sauberes Wasser und Sanitäreinrichtungen',
      '7. Bezahlbare und saubere Energie',
      '8. Menschenwürdige Arbeit und Wirtschaftswachstum',
      '9. Industrie, Innovation und Infrastruktur',
      '10. Weniger Ungleichheiten',
      '11. Nachhaltige Städte und Gemeinden',
      '12. Nachhaltiger Konsum und Produktion',
      '13. Maßnahmen zum Klimaschutz',
      '14. Leben unter Wasser',
      '15. Leben an Land',
      '16. Frieden, Gerechtigkeit und starke Institutionen',
      '17. Partnerschaften zur Erreichung der Ziele',
    ],
  },
];

// Generiert eine leere Checkliste mit allen Standard-Items
export const generateDefaultChecklist = (): ChecklistItemFormData[] => {
  const items: ChecklistItemFormData[] = [];
  let sortOrder = 0;

  CHECKLIST_CATEGORIES.forEach((category) => {
    category.items.forEach((label) => {
      items.push({
        category: category.id,
        label,
        assignee: '',
        remark: '',
        isCompleted: false,
      });
      sortOrder++;
    });
  });

  return items;
};

// Hilfsfunktion um den Category-Label zu bekommen
export const getCategoryLabel = (category: ChecklistCategory): string => {
  const config = CHECKLIST_CATEGORIES.find((c) => c.id === category);
  return config?.label || category;
};


