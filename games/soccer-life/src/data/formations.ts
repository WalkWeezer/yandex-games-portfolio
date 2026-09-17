import type { FormationId, Position } from '../types';

/** Slot order for lineup[0..10] per formation */

export type FormationSlot = {
  pos: Position;
  label: string;
  /** pitch coords 0..1 for future tactics UI */
  x: number;
  y: number;
};

export const FORMATIONS: Record<FormationId, FormationSlot[]> = {
  '433': [
    { pos: 'GK', label: 'ВР', x: 0.5, y: 0.92 },
    { pos: 'FB', label: 'ЛЗ', x: 0.15, y: 0.72 },
    { pos: 'CB', label: 'ЦЗ', x: 0.38, y: 0.74 },
    { pos: 'CB', label: 'ЦЗ', x: 0.62, y: 0.74 },
    { pos: 'FB', label: 'ПЗ', x: 0.85, y: 0.72 },
    { pos: 'CM', label: 'ЦП', x: 0.3, y: 0.5 },
    { pos: 'CM', label: 'ЦП', x: 0.5, y: 0.48 },
    { pos: 'CM', label: 'ЦП', x: 0.7, y: 0.5 },
    { pos: 'W', label: 'ЛВ', x: 0.18, y: 0.28 },
    { pos: 'ST', label: 'НАП', x: 0.5, y: 0.18 },
    { pos: 'W', label: 'ПВ', x: 0.82, y: 0.28 },
  ],
  '442': [
    { pos: 'GK', label: 'ВР', x: 0.5, y: 0.92 },
    { pos: 'FB', label: 'ЛЗ', x: 0.15, y: 0.72 },
    { pos: 'CB', label: 'ЦЗ', x: 0.38, y: 0.74 },
    { pos: 'CB', label: 'ЦЗ', x: 0.62, y: 0.74 },
    { pos: 'FB', label: 'ПЗ', x: 0.85, y: 0.72 },
    { pos: 'W', label: 'ЛП', x: 0.15, y: 0.48 },
    { pos: 'CM', label: 'ЦП', x: 0.38, y: 0.5 },
    { pos: 'CM', label: 'ЦП', x: 0.62, y: 0.5 },
    { pos: 'W', label: 'ПП', x: 0.85, y: 0.48 },
    { pos: 'ST', label: 'НАП', x: 0.38, y: 0.2 },
    { pos: 'ST', label: 'НАП', x: 0.62, y: 0.2 },
  ],
  '352': [
    { pos: 'GK', label: 'ВР', x: 0.5, y: 0.92 },
    { pos: 'CB', label: 'ЦЗ', x: 0.25, y: 0.74 },
    { pos: 'CB', label: 'ЦЗ', x: 0.5, y: 0.76 },
    { pos: 'CB', label: 'ЦЗ', x: 0.75, y: 0.74 },
    { pos: 'FB', label: 'ЛВНГ', x: 0.1, y: 0.48 },
    { pos: 'DM', label: 'ОПЗ', x: 0.35, y: 0.55 },
    { pos: 'CM', label: 'ЦП', x: 0.5, y: 0.48 },
    { pos: 'DM', label: 'ОПЗ', x: 0.65, y: 0.55 },
    { pos: 'FB', label: 'ПВНГ', x: 0.9, y: 0.48 },
    { pos: 'ST', label: 'НАП', x: 0.38, y: 0.2 },
    { pos: 'ST', label: 'НАП', x: 0.62, y: 0.2 },
  ],
};

/** Ideal squad composition counts by position (~20 players) */
export const SQUAD_TEMPLATE: Position[] = [
  'GK',
  'GK',
  'CB',
  'CB',
  'CB',
  'FB',
  'FB',
  'FB',
  'DM',
  'DM',
  'CM',
  'CM',
  'AM',
  'W',
  'W',
  'W',
  'ST',
  'ST',
  'ST',
  'CM',
];
