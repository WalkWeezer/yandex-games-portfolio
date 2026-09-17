/**
 * Event-based match engine — DESIGN_LLM §4
 *
 * 90 ticks. Each tick: fatigue drift; with pChance create a chance event.
 * Live actions (default 3): instruction / sub / emotion bus|all-out (~12 ticks).
 * Seeded RNG → deterministic simulate().
 */

import type { Club, InstrLevel, MatchEvent, Player, Tactics } from '../types';
import {
  computePowers,
  computeXg,
  effectiveRisk,
  pChance,
  pickChanceType,
  pickShooter,
  resolveOutcome,
  resolvePlayers,
} from './chanceModel';
import { buildMatchDeltas, buildReport } from './reportBuilder';
import type {
  EmotionMode,
  LiveActionRequest,
  MatchConfig,
  MatchState,
  Side,
  SideRuntime,
  SimulateResult,
} from './types';

const MATCH_LENGTH = 90;
const EMOTION_TICKS = 12;
const FATIGUE_PER_TICK = 0.35;
const CARD_P = 0.012;
const INJURY_P = 0.004;

function clonePlayer(p: Player): Player {
  return {
    ...p,
    attrs: { ...p.attrs },
  };
}

function cloneTactics(t: Tactics): Tactics {
  return {
    ...t,
    lineup: [...t.lineup],
    bench: [...t.bench],
  };
}

function cloneClubPlayers(club: Club): Player[] {
  return club.players.map(clonePlayer);
}

function makeSide(club: Club): SideRuntime {
  return {
    clubId: club.id,
    name: club.name,
    colors: [...club.colors] as [string, string],
    tactics: cloneTactics(club.tactics),
    players: cloneClubPlayers(club),
    baseRisk: club.tactics.risk,
    emotionUntil: 0,
    emotionMode: null,
  };
}

/** Mulberry32 — returns next u32 state + float in [0,1). */
export function nextRng(state: number): { state: number; value: number } {
  let s = (state + 0x6d2b79f5) >>> 0;
  let t = Math.imul(s ^ (s >>> 15), 1 | s);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  const value = ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  return { state: s, value };
}

function rngFn(stateRef: { s: number }): () => number {
  return () => {
    const r = nextRng(stateRef.s);
    stateRef.s = r.state;
    return r.value;
  };
}

function emotionRiskOf(side: SideRuntime, minute: number): InstrLevel | null {
  if (side.emotionUntil > minute && side.emotionMode) {
    return side.emotionMode === 'bus' ? 0 : 2;
  }
  return null;
}

function clearExpiredEmotion(side: SideRuntime, minute: number): void {
  if (side.emotionUntil > 0 && minute >= side.emotionUntil) {
    side.tactics.risk = side.baseRisk;
    side.emotionUntil = 0;
    side.emotionMode = null;
  }
}

function applyEmotionRisk(side: SideRuntime, minute: number): void {
  const er = emotionRiskOf(side, minute);
  if (er !== null) {
    side.tactics.risk = er;
  }
}

function driftFatigue(side: SideRuntime): void {
  const on = new Set(side.tactics.lineup);
  for (const p of side.players) {
    if (on.has(p.id)) {
      const phyFactor = 1.15 - p.attrs.phy / 20; // stronger PHY → less fatigue
      p.fatigue = Math.min(100, p.fatigue + FATIGUE_PER_TICK * phyFactor);
    } else {
      p.fatigue = Math.max(0, p.fatigue - 0.08);
    }
  }
}

function onPitch(side: SideRuntime): Player[] {
  return resolvePlayers(side.tactics.lineup, side.players);
}

function maybeRareEvent(
  state: MatchState,
  side: Side,
  rng: () => number,
): void {
  const rt = state[side];
  const pitch = onPitch(rt);
  if (pitch.length === 0) return;
  if (rng() < INJURY_P) {
    const victim = pitch[Math.floor(rng() * pitch.length)]!;
    state.events.push({
      t: state.minute,
      type: 'injury',
      side,
      playerId: victim.id,
    });
    victim.fatigue = Math.min(100, victim.fatigue + 25);
    return;
  }
  if (rng() < CARD_P) {
    const victim = pitch[Math.floor(rng() * pitch.length)]!;
    state.events.push({
      t: state.minute,
      type: 'card',
      side,
      playerId: victim.id,
    });
  }
}

function rollChanceForSide(state: MatchState, atkSide: Side, rng: () => number): void {
  const defSide: Side = atkSide === 'home' ? 'away' : 'home';
  const atk = state[atkSide];
  const def = state[defSide];

  applyEmotionRisk(atk, state.minute);
  applyEmotionRisk(def, state.minute);

  const atkPitch = onPitch(atk);
  const defPitch = onPitch(def);
  if (atkPitch.length === 0 || defPitch.length === 0) return;

  const atkPow = computePowers(atkPitch, atk.tactics, {
    isHome: atkSide === 'home',
    emotionRisk: emotionRiskOf(atk, state.minute),
  });
  const defPow = computePowers(defPitch, def.tactics, {
    isHome: defSide === 'home',
    emotionRisk: emotionRiskOf(def, state.minute),
  });

  if (atkSide === 'home') {
    state.stats.homeAttackSum += atkPow.attackPower;
    state.stats.awayDefSum += defPow.defensePower;
  } else {
    state.stats.awayAttackSum += atkPow.attackPower;
    state.stats.homeDefSum += defPow.defensePower;
  }

  const p = pChance(atkPow.attackPower, defPow.defensePower);
  if (rng() >= p) return;

  const risk = effectiveRisk(atk.tactics, emotionRiskOf(atk, state.minute));
  const ctype = pickChanceType(rng, atk.tactics.tempo, risk);
  const shooter = pickShooter(atkPitch, rng);
  const xg = computeXg(shooter, defPitch, ctype, rng);
  const outcome = resolveOutcome(xg, shooter, defPitch, rng);

  const ev: MatchEvent = {
    t: state.minute,
    type: 'chance',
    side: atkSide,
    xg,
    outcome,
    scorerId: outcome === 'goal' ? shooter.id : shooter.id,
  };
  state.events.push(ev);
  state.xg[atkSide] += xg;
  if (atkSide === 'home') state.stats.homeChances += 1;
  else state.stats.awayChances += 1;

  if (outcome === 'goal') {
    state.score[atkSide] += 1;
  }
}

/**
 * Create a live-controllable match. Does not run ticks yet.
 */
export function createMatch(config: MatchConfig): MatchState {
  const seed = (config.seed ?? 1) >>> 0 || 1;
  const charges = config.liveCharges ?? 3;
  return {
    seed,
    minute: 0,
    finished: false,
    home: makeSide(config.home),
    away: makeSide(config.away),
    score: { home: 0, away: 0 },
    xg: { home: 0, away: 0 },
    events: [],
    liveCharges: charges,
    liveChargesMax: charges,
    stats: {
      homeChances: 0,
      awayChances: 0,
      homeAttackSum: 0,
      awayAttackSum: 0,
      homeDefSum: 0,
      awayDefSum: 0,
    },
    rngState: seed,
  };
}

/**
 * Advance one minute. Returns false if match already finished.
 */
export function tickMatch(state: MatchState): boolean {
  if (state.finished || state.minute >= MATCH_LENGTH) {
    state.finished = true;
    return false;
  }

  state.minute += 1;
  const ref = { s: state.rngState };
  const rng = rngFn(ref);

  clearExpiredEmotion(state.home, state.minute);
  clearExpiredEmotion(state.away, state.minute);

  driftFatigue(state.home);
  driftFatigue(state.away);

  // Home then away chance rolls (independent)
  rollChanceForSide(state, 'home', rng);
  rollChanceForSide(state, 'away', rng);

  // Rare events lightly favor the team under more press (home first coin)
  if (rng() < 0.5) {
    maybeRareEvent(state, 'home', rng);
    maybeRareEvent(state, 'away', rng);
  } else {
    maybeRareEvent(state, 'away', rng);
    maybeRareEvent(state, 'home', rng);
  }

  state.rngState = ref.s;

  if (state.minute >= MATCH_LENGTH) {
    state.finished = true;
  }
  return true;
}

export type LiveActionResult =
  | { ok: true; event: MatchEvent }
  | { ok: false; reason: string };

/**
 * Spend one live charge. Instruction changes affect subsequent pChance immediately.
 */
export function applyLiveAction(
  state: MatchState,
  action: LiveActionRequest,
  side: Side = 'home',
): LiveActionResult {
  if (state.finished) return { ok: false, reason: 'match_over' };
  if (state.liveCharges <= 0) return { ok: false, reason: 'no_charges' };

  const rt = state[side];

  if (action.kind === 'instr') {
    if (action.key === 'risk') {
      rt.baseRisk = action.level;
      if (!(rt.emotionUntil > state.minute)) {
        rt.tactics.risk = action.level;
      }
    } else {
      rt.tactics[action.key] = action.level;
    }
  } else if (action.kind === 'sub') {
    const li = rt.tactics.lineup.indexOf(action.outId);
    const bi = rt.tactics.bench.indexOf(action.inId);
    if (li < 0 || bi < 0) return { ok: false, reason: 'bad_sub_ids' };
    const outOnPitch = rt.players.find((p) => p.id === action.outId);
    const inn = rt.players.find((p) => p.id === action.inId);
    if (!outOnPitch || !inn) return { ok: false, reason: 'player_missing' };
    rt.tactics.lineup[li] = action.inId;
    rt.tactics.bench[bi] = action.outId;
    state.events.push({
      t: state.minute,
      type: 'sub',
      side,
      playerId: action.inId,
    });
  } else if (action.kind === 'emotion') {
    const mode: EmotionMode = action.mode;
    rt.emotionMode = mode;
    rt.emotionUntil = state.minute + EMOTION_TICKS;
    rt.tactics.risk = mode === 'bus' ? 0 : 2;
  }

  state.liveCharges -= 1;
  const liveEv: MatchEvent = {
    t: state.minute,
    type: 'live',
    side,
    action: action.kind === 'instr' ? 'instr' : action.kind === 'sub' ? 'sub' : 'emotion',
  };
  state.events.push(liveEv);
  return { ok: true, event: liveEv };
}

/** Run remaining ticks to 90'. */
export function finishMatch(state: MatchState): void {
  while (!state.finished && state.minute < MATCH_LENGTH) {
    tickMatch(state);
  }
  state.finished = true;
}

/** Full auto simulation (no live actions). Deterministic for seed. */
export function simulateMatch(config: MatchConfig): SimulateResult {
  const state = createMatch(config);
  finishMatch(state);
  const report = buildReport(state);
  const deltas = buildMatchDeltas(state, config.home, config.away);
  return { state, report, deltas };
}

/** Peek current pChance for UI / tests (does not advance RNG). */
export function peekChanceRates(state: MatchState): {
  home: number;
  away: number;
  homeAttack: number;
  awayAttack: number;
  homeDefense: number;
  awayDefense: number;
} {
  applyEmotionRisk(state.home, state.minute);
  applyEmotionRisk(state.away, state.minute);
  const hp = onPitch(state.home);
  const ap = onPitch(state.away);
  const hAtk = computePowers(hp, state.home.tactics, {
    isHome: true,
    emotionRisk: emotionRiskOf(state.home, state.minute),
  });
  const aAtk = computePowers(ap, state.away.tactics, {
    isHome: false,
    emotionRisk: emotionRiskOf(state.away, state.minute),
  });
  const hDef = computePowers(hp, state.home.tactics, {
    isHome: true,
    emotionRisk: emotionRiskOf(state.home, state.minute),
  });
  const aDef = computePowers(ap, state.away.tactics, {
    isHome: false,
    emotionRisk: emotionRiskOf(state.away, state.minute),
  });
  return {
    home: pChance(hAtk.attackPower, aDef.defensePower),
    away: pChance(aAtk.attackPower, hDef.defensePower),
    homeAttack: hAtk.attackPower,
    awayAttack: aAtk.attackPower,
    homeDefense: hDef.defensePower,
    awayDefense: aDef.defensePower,
  };
}

export const MATCH_MINUTES = MATCH_LENGTH;
export const EMOTION_DURATION = EMOTION_TICKS;
