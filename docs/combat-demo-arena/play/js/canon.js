/** Canon numbers from COMBAT_MECHANICS.md — demo slice subset */

export const PX = 40; // pixels per meter
export const ARENA_W = 18;
export const ARENA_H = 14;

export const PLAYER = {
  hp: 100,
  sta: 100,
  focus: 100,
  debtMax: 50,
  poise: 80,
  speed: 4.2,
  softAimMax: 3,
};

export const STA = {
  attackA: 12,
  attackB: 22,
  dodge: 28,
  regen: 28,
  regenDelay: 0.35,
  parryFail: 6,
};

export const FOCUS = {
  skill: 24,
  combine: 40,
  regen: 10,
  regenDelay: 0.8,
};

export const DEBT = {
  max: 50,
  drain: 6,
  drainFocusMin: 60,
  hotDodgeExtra: 6,
  backfireAt: 40,
  backfireHp: 12,
  backfirePoise: 30,
  backfireStagger: 0.35,
};

export const COMBINE_HOLD = 0.12;
export const SKILL_HOLD_COMBINE = 0.2;
export const BLOCK_HOLD = 0.2;
export const PARRY_WINDOW = 0.12;

export const CHASSIS = {
  Cleaver: {
    id: 'Cleaver',
    family: 'blade',
    canBlock: true,
    A: { dmg: 18, poise: 22, start: 0.22, active: 0.1, recover: 0.28, range: 1.6, arc: 90 },
    B: { dmg: 32, poise: 40, start: 0.42, active: 0.12, recover: 0.48, range: 1.8, arc: 70 },
  },
  Staff: {
    id: 'Staff',
    family: 'magic',
    canBlock: false,
    A: { dmg: 14, poise: 18, start: 0.24, active: 0.1, recover: 0.3, range: 1.7, arc: 80 },
    B: { dmg: 20, poise: 16, start: 0.48, active: 0.12, recover: 0.52, range: 4.0, width: 1.2, wave: true },
  },
};

export const FORCES = {
  Spark: { color: '#e6a84a', name: 'Spark' },
  Tide: { color: '#3aa8a0', name: 'Tide' },
  Ash: { color: '#c45c2a', name: 'Ash' },
  Root: { color: '#5a8a4a', name: 'Root' },
  Whisper: { color: '#b8a0d0', name: 'Whisper' },
};

/** Presets used in prefight + route tips */
export const PRESETS = {
  M1: {
    id: 'M1',
    label: 'M1 Melee',
    chassis: 'Cleaver',
    skill1: 'Root',
    skill2: 'Ash',
    blurb: 'Parry / Cleaver weight. Tier-2 optional.',
  },
  M2: {
    id: 'M2',
    label: 'M2 Magic',
    chassis: 'Staff',
    skill1: 'Spark',
    skill2: 'Tide',
    blurb: 'Water → Грозовой столб. Debt cold.',
  },
  M3: {
    id: 'M3',
    label: 'M3 Hybrid',
    chassis: 'Cleaver',
    skill1: 'Spark',
    skill2: 'Root',
    blurb: 'RootAnchor → Проводная казнь.',
  },
};

export const ENEMY = {
  AshGrunt: { hp: 70, poise: 50, speed: 3.2, name: 'Ash Grunt' },
  TideWretch: { hp: 55, poise: 40, speed: 2.6, name: 'Tide Wretch' },
  GateSaint: { hp: 280, poise: 120, speed: 2.4, name: 'Gate Saint' },
};

export const KEYBOARD_MAP = [
  ['Move', 'WASD / Arrows (L stick)'],
  ['Aim', 'Mouse (R stick)'],
  ['Attack A (R1)', 'J / LMB'],
  ['Attack B (R2)', 'K / RMB'],
  ['Skill1 (L1)', 'Q'],
  ['Skill2 (L2)', 'E'],
  ['Combine (L1+L2)', 'Hold Q+E ≥120ms'],
  ['Dodge (○)', 'Space / Shift'],
  ['Block/Parry (□)', 'F'],
  ['Swap (△)', 'R / Tab'],
  ['Interact (×)', 'X'],
  ['Env Read (Touchpad)', 'Hold V'],
  ['Soft-lock (R3)', 'T / MMB'],
  ['Pause (Options)', 'Esc / P'],
];
