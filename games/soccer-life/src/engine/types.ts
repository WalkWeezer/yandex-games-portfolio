/**
 * Match-engine types. Shared Club/Player/Tactics live in ../types (DESIGN_LLM §3).
 * Engine-specific shapes for live sim, report, and registry handoff.
 */

import type {
  Club,
  InstrLevel,
  MatchEvent,
  Player,
  Tactics,
} from '../types';

export type {
  Club,
  FormationId,
  InstrLevel,
  MatchEvent,
  Player,
  Position,
  Tactics,
} from '../types';

export type Side = 'home' | 'away';

export type InstrKey = 'press' | 'width' | 'tempo' | 'risk';

export type ChanceType = 'open' | 'counter' | 'setpiece';

export type EmotionMode = 'bus' | 'allout';

export type LiveActionRequest =
  | { kind: 'instr'; key: InstrKey; level: InstrLevel }
  | { kind: 'sub'; outId: string; inId: string }
  | { kind: 'emotion'; mode: EmotionMode };

export type MatchConfig = {
  home: Club;
  away: Club;
  /** Deterministic seed (uint32). Default 1. */
  seed?: number;
  /** Default 3; VIP may pass 4. */
  liveCharges?: number;
};

/** Snapshot used while the match is ticking (mutable). */
export type SideRuntime = {
  clubId: string;
  name: string;
  colors: [string, string];
  tactics: Tactics;
  /** Working copy of squad (fatigue mutates). */
  players: Player[];
  /** Base risk before emotion override. */
  baseRisk: InstrLevel;
  emotionUntil: number; // minute exclusive; 0 = inactive
  emotionMode: EmotionMode | null;
};

export type MatchState = {
  seed: number;
  minute: number; // 0..90; after tick N, minute === N
  finished: boolean;
  home: SideRuntime;
  away: SideRuntime;
  score: { home: number; away: number };
  xg: { home: number; away: number };
  events: MatchEvent[];
  liveCharges: number;
  liveChargesMax: number;
  /** Accumulated attack power samples for tip heuristics. */
  stats: {
    homeChances: number;
    awayChances: number;
    homeAttackSum: number;
    awayAttackSum: number;
    homeDefSum: number;
    awayDefSum: number;
  };
  rngState: number;
};

export type MatchReport = {
  homeName: string;
  awayName: string;
  homeId: string;
  awayId: string;
  score: { home: number; away: number };
  xg: { home: number; away: number };
  bestPlayer: { id: string; name: string; side: Side; reason: string };
  keyEvents: MatchEvent[];
  tip: string;
  tipCode:
    | 'press_too_low'
    | 'no_width'
    | 'stamina_collapse'
    | 'tempo_slow'
    | 'risk_high'
    | 'solid'
    | 'finishing';
  events: MatchEvent[];
  seed: number;
};

/** Soft/meta deltas for sibling GameState to apply. */
export type MatchDeltas = {
  homeClubId: string;
  awayClubId: string;
  homeGoals: number;
  awayGoals: number;
  homePts: number;
  awayPts: number;
  homeCashDelta: number;
  awayCashDelta: number;
  /** Player id → form delta (clamped by applier). */
  formDelta: Record<string, number>;
  /** Player id → absolute fatigue after match. */
  fatigueAfter: Record<string, number>;
};

export type SimulateResult = {
  state: MatchState;
  report: MatchReport;
  deltas: MatchDeltas;
};

/** Registry keys for MatchScene ↔ ReportScene ↔ Hub. */
export const REG = {
  matchConfig: 'slf_match_config',
  matchReport: 'slf_match_report',
  matchDeltas: 'slf_match_deltas',
  onMatchEnd: 'slf_on_match_end',
} as const;

export type OnMatchEndFn = (report: MatchReport, deltas: MatchDeltas) => void;
