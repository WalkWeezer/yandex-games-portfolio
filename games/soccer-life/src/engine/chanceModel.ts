/**
 * Chance / power model — DESIGN_LLM §4.2
 *
 * attackPower = line(FWD) * tempoMult * riskMult * formMult * fatigueMult * widthMult
 * defensePower = line(DEF) * pressMult * homeMult * formMult * fatigueMult * riskDefMult
 * pChance ≈ clamp(0.02..0.18, attack/(attack+defense) * BASE)
 * xg ≈ f(SHT, DEF_opp, chanceType); pGoal ≈ xg
 *
 * Instruction multipliers stay in 0.85–1.20 so one live tap shifts rates without breaking the match.
 */

import type { InstrLevel, Player, Position, Tactics } from '../types';
import type { ChanceType } from './types';

export const INSTR_MULT: Record<InstrLevel, number> = {
  0: 0.85,
  1: 1.0,
  2: 1.2,
};

export const BASE_CHANCE = 0.22;
export const P_CHANCE_MIN = 0.02;
export const P_CHANCE_MAX = 0.18;
export const HOME_DEF_MULT = 1.08;

const ATTACK_POS: Position[] = ['ST', 'W', 'AM'];
const DEFENSE_POS: Position[] = ['GK', 'CB', 'FB', 'DM'];
const MID_POS: Position[] = ['CM', 'DM', 'AM', 'W'];

export function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}

export function instrMult(level: InstrLevel): number {
  return INSTR_MULT[level];
}

export function resolvePlayers(lineupIds: string[], squad: Player[]): Player[] {
  const byId = new Map(squad.map((p) => [p.id, p]));
  const out: Player[] = [];
  for (const id of lineupIds) {
    const p = byId.get(id);
    if (p) out.push(p);
  }
  return out;
}

function avg(nums: number[]): number {
  if (nums.length === 0) return 8;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

function formMult(players: Player[]): number {
  const f = avg(players.map((p) => p.form));
  // form 50 → 1.0; 100 → 1.15; 0 → 0.85
  return clamp(0.85 + (f / 100) * 0.3, 0.85, 1.15);
}

function fatigueMult(players: Player[]): number {
  const f = avg(players.map((p) => p.fatigue));
  // fatigue 0 → 1.0; 100 → 0.82
  return clamp(1.0 - (f / 100) * 0.18, 0.82, 1.0);
}

function lineAttackRaw(onPitch: Player[]): number {
  const atk = onPitch.filter((p) => ATTACK_POS.includes(p.pos));
  const mid = onPitch.filter((p) => MID_POS.includes(p.pos));
  const pool = atk.length >= 2 ? atk : [...atk, ...mid].slice(0, 4);
  const use = pool.length > 0 ? pool : onPitch.slice(0, 4);
  // Creation: SHT + PAS + PAC (weighted toward finishing/creation)
  return avg(
    use.map((p) => p.attrs.sht * 0.4 + p.attrs.pas * 0.35 + p.attrs.pac * 0.25),
  );
}

function lineDefenseRaw(onPitch: Player[]): number {
  const def = onPitch.filter((p) => DEFENSE_POS.includes(p.pos));
  const use = def.length > 0 ? def : onPitch.slice(0, 5);
  return avg(
    use.map((p) => p.attrs.def * 0.45 + p.attrs.phy * 0.3 + p.attrs.men * 0.25),
  );
}

export type PowerBreakdown = {
  attackPower: number;
  defensePower: number;
  attackRaw: number;
  defenseRaw: number;
  tempoMult: number;
  riskAtkMult: number;
  riskDefMult: number;
  widthMult: number;
  pressMult: number;
  formMult: number;
  fatigueMult: number;
  homeMult: number;
};

/**
 * Effective tactics risk (emotion may override).
 */
export function effectiveRisk(tactics: Tactics, emotionRisk: InstrLevel | null): InstrLevel {
  return emotionRisk ?? tactics.risk;
}

export function computePowers(
  onPitch: Player[],
  tactics: Tactics,
  opts: {
    isHome: boolean;
    emotionRisk?: InstrLevel | null;
  },
): PowerBreakdown {
  const risk = effectiveRisk(tactics, opts.emotionRisk ?? null);
  const tempoM = instrMult(tactics.tempo);
  const widthMult = clamp(0.85 + tactics.width * 0.175, 0.85, 1.2);
  const riskAtk = instrMult(risk);
  // High risk weakens own shape slightly
  const riskDef = clamp(1.2 - risk * 0.175, 0.85, 1.2);
  const pressM = instrMult(tactics.press);
  const fMult = formMult(onPitch);
  const fatM = fatigueMult(onPitch);
  const homeMult = opts.isHome ? HOME_DEF_MULT : 1.0;

  const attackRaw = lineAttackRaw(onPitch);
  const defenseRaw = lineDefenseRaw(onPitch);

  const attackPower =
    attackRaw * tempoM * riskAtk * widthMult * fMult * fatM;
  const defensePower =
    defenseRaw * pressM * riskDef * homeMult * fMult * fatM;

  return {
    attackPower,
    defensePower,
    attackRaw,
    defenseRaw,
    tempoMult: tempoM,
    riskAtkMult: riskAtk,
    riskDefMult: riskDef,
    widthMult,
    pressMult: pressM,
    formMult: fMult,
    fatigueMult: fatM,
    homeMult,
  };
}

export function pChance(attackPower: number, defensePower: number): number {
  const a = Math.max(0.01, attackPower);
  const d = Math.max(0.01, defensePower);
  const raw = (a / (a + d)) * BASE_CHANCE;
  return clamp(raw, P_CHANCE_MIN, P_CHANCE_MAX);
}

export function pickChanceType(rng: () => number, tempo: InstrLevel, risk: InstrLevel): ChanceType {
  const r = rng();
  if (risk >= 2 && r < 0.28) return 'counter';
  if (tempo <= 0 && r < 0.18) return 'setpiece';
  if (r < 0.12) return 'setpiece';
  if (r < 0.3) return 'counter';
  return 'open';
}

export function computeXg(
  shooter: Player,
  defenders: Player[],
  chanceType: ChanceType,
  rng: () => number,
): number {
  const oppDef = avg(
    defenders
      .filter((p) => DEFENSE_POS.includes(p.pos) || p.pos === 'GK')
      .map((p) => (p.pos === 'GK' ? p.attrs.def * 1.1 : p.attrs.def)),
  );
  const sht = shooter.attrs.sht;
  const base =
    chanceType === 'setpiece'
      ? 0.09
      : chanceType === 'counter'
        ? 0.11
        : 0.08;
  // Scale by finishing vs opposition defending (attrs 1..20)
  const quality = (sht - oppDef * 0.65) / 20;
  const xg = base + quality * 0.18 + (rng() - 0.5) * 0.04;
  return clamp(xg, 0.03, 0.45);
}

export function pickShooter(onPitch: Player[], rng: () => number): Player {
  const preferred = onPitch.filter((p) => ATTACK_POS.includes(p.pos));
  const pool = preferred.length > 0 ? preferred : onPitch.filter((p) => p.pos !== 'GK');
  const use = pool.length > 0 ? pool : onPitch;
  // Weight by SHT
  const weights = use.map((p) => Math.max(1, p.attrs.sht));
  const sum = weights.reduce((a, b) => a + b, 0);
  let r = rng() * sum;
  for (let i = 0; i < use.length; i++) {
    r -= weights[i]!;
    if (r <= 0) return use[i]!;
  }
  return use[use.length - 1]!;
}

export function resolveOutcome(
  xg: number,
  shooter: Player,
  defenders: Player[],
  rng: () => number,
): 'goal' | 'save' | 'miss' | 'block' {
  if (rng() < xg) return 'goal';
  const gk = defenders.find((p) => p.pos === 'GK');
  const gkSkill = gk ? gk.attrs.def : 10;
  const saveWeight = gkSkill + 4;
  const blockWeight = avg(defenders.map((p) => p.attrs.def)) * 0.8;
  const missWeight = 14 - shooter.attrs.sht * 0.35;
  const total = saveWeight + blockWeight + Math.max(2, missWeight);
  const r = rng() * total;
  if (r < saveWeight) return 'save';
  if (r < saveWeight + blockWeight) return 'block';
  return 'miss';
}
