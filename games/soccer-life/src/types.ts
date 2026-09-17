/** Core data types — DESIGN_LLM §3 */

export type Position = 'GK' | 'CB' | 'FB' | 'DM' | 'CM' | 'AM' | 'W' | 'ST';

export type RoleId =
  | 'defender'
  | 'playmaker'
  | 'box_to_box'
  | 'inside_forward'
  | 'poacher'
  | 'sweeper_keeper';

export type PlayerAttrs = {
  pac: number; // 1..20
  sht: number;
  pas: number;
  def: number;
  phy: number;
  men: number;
};

export type Player = {
  id: string;
  name: string;
  pos: Position;
  age: number;
  attrs: PlayerAttrs;
  form: number; // 0..100
  fatigue: number; // 0..100
  role?: RoleId;
  value: number;
};

export type FormationId = '433' | '442' | '352';
export type InstrLevel = 0 | 1 | 2; // low | med | high

export type Tactics = {
  formation: FormationId;
  press: InstrLevel;
  width: InstrLevel;
  tempo: InstrLevel;
  risk: InstrLevel;
  lineup: string[]; // 11 player ids
  bench: string[]; // up to 7
};

export type Club = {
  id: string;
  name: string;
  colors: [string, string];
  cash: number;
  stadiumLvl: number;
  trainingLvl: number;
  academyLvl: number;
  players: Player[];
  tactics: Tactics;
};

export type TableRow = {
  clubId: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  gf: number;
  ga: number;
  pts: number;
};

export type Fixture = {
  matchday: number;
  homeId: string;
  awayId: string;
  played: boolean;
  homeGoals?: number;
  awayGoals?: number;
};

export type Season = {
  matchday: number; // current (1-based), next to play
  matchdaysTotal: number;
  fixtures: Fixture[];
  table: TableRow[];
};

export type MatchEvent =
  | {
      t: number;
      type: 'chance';
      side: 'home' | 'away';
      xg: number;
      scorerId?: string;
      outcome: 'goal' | 'save' | 'miss' | 'block';
    }
  | {
      t: number;
      type: 'card' | 'injury' | 'sub';
      side: 'home' | 'away';
      playerId: string;
    }
  | {
      t: number;
      type: 'live';
      side: 'home' | 'away';
      action: 'instr' | 'sub' | 'emotion';
    };

export type SaveBlob = {
  version: 1;
  playerClubId: string;
  clubs: Club[];
  season: Season;
  tokens: number;
  vipUntil: number; // epoch ms, 0 = none
};

export const SCENE = {
  Boot: 'SC_Boot',
  Hub: 'SC_Hub',
  Squad: 'SC_Squad',
  Tactics: 'SC_Tactics',
  Match: 'SC_Match',
  Report: 'SC_Report',
  Club: 'SC_Club',
} as const;

export const SAVE_KEY = 'slf_club_v1';

export const POSITIONS: Position[] = ['GK', 'CB', 'FB', 'DM', 'CM', 'AM', 'W', 'ST'];

export const FORMATION_LABELS: Record<FormationId, string> = {
  '433': '4-3-3',
  '442': '4-4-2',
  '352': '3-5-2',
};

export const INSTR_LABELS = {
  press: ['Низкий блок', 'Стандарт', 'Высокий пресс'],
  width: ['Узко', 'Норма', 'Широко'],
  tempo: ['Медленно', 'Норма', 'Быстро'],
  risk: ['Держать счёт', 'Баланс', 'Все вперёд'],
} as const;

export const POS_RU: Record<Position, string> = {
  GK: 'ВР',
  CB: 'ЦЗ',
  FB: 'КЗ',
  DM: 'ОПЗ',
  CM: 'ЦП',
  AM: 'АПЗ',
  W: 'ВНГ',
  ST: 'НАП',
};
