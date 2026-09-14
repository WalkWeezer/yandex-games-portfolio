/**
 * Demo Arena — playable vertical slice
 * Canon: docs/combat-demo-arena/COMBAT_MECHANICS.md
 */
import {
  PX, ARENA_W, ARENA_H, PLAYER, STA, FOCUS, DEBT, COMBINE_HOLD,
  BLOCK_HOLD, PARRY_WINDOW, CHASSIS, FORCES, PRESETS, ENEMY, KEYBOARD_MAP,
} from './canon.js';
import { createInput } from './input.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const input = createInput(canvas);

const VIEW = { ox: 80, oy: 48, scale: PX }; // world meters → screen

function w2s(x, y) {
  return { x: VIEW.ox + x * VIEW.scale, y: VIEW.oy + y * VIEW.scale };
}
function s2w(sx, sy) {
  return { x: (sx - VIEW.ox) / VIEW.scale, y: (sy - VIEW.oy) / VIEW.scale };
}
function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
function dist(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }
function norm(x, y) {
  const l = Math.hypot(x, y) || 1;
  return { x: x / l, y: y / l };
}
function angBetween(ax, ay, bx, by) {
  return Math.atan2(by - ay, bx - ax);
}
function inArc(ox, oy, dir, range, arcDeg, tx, ty) {
  const d = Math.hypot(tx - ox, ty - oy);
  if (d > range || d < 0.05) return d <= range;
  const a = Math.atan2(ty - oy, tx - ox);
  let diff = Math.abs(((a - dir + Math.PI * 3) % (Math.PI * 2)) - Math.PI);
  return diff <= (arcDeg * Math.PI / 180) / 2;
}

// ——— State ———
const state = {
  mode: 'bench', // bench | fight | pause | win | dead
  presetId: 'M1',
  chassisId: 'Cleaver',
  skill1: 'Root',
  skill2: 'Ash',
  pauseTab: 'controls',
  msg: '',
  msgT: 0,
  arenaTime: 0,
  bossReleased: false,
  bossWalk: 0,
  floaters: [],
  zones: [],
  projectiles: [],
  fx: [],
  carriers: [],
  enemies: [],
  player: null,
  lockTarget: null,
  envRead: false,
  damageLog: { weapon: 0, skill: 0, combine: 0 },
  swapCd: 0,
  spareChassis: null,
};

function toast(t, sec = 2.2) {
  state.msg = t;
  state.msgT = sec;
}

function addFloater(x, y, text, color = '#fff') {
  state.floaters.push({ x, y, text, color, t: 0.9 });
}

function makePlayer() {
  const ch = CHASSIS[state.chassisId];
  return {
    x: 9, y: 2,
    r: 0.35,
    hp: PLAYER.hp,
    sta: PLAYER.sta,
    focus: PLAYER.focus,
    debt: 0,
    poise: PLAYER.poise,
    maxPoise: PLAYER.poise,
    facing: 0,
    aimX: 9, aimY: 3.5,
    chassis: ch,
    skill1: state.skill1,
    skill2: state.skill2,
    action: null, // { type, t, dur, ... }
    iFrames: 0,
    stagger: 0,
    staIdle: 0,
    focusIdle: 0,
    blocking: false,
    blockHold: 0,
    parryArmed: false,
    weave: 0,
    rooted: 0,
    dots: [],
    canBlock: ch.canBlock,
    moveMul: 1,
  };
}

function resetArena() {
  state.arenaTime = 0;
  state.bossReleased = false;
  state.bossWalk = 0;
  state.floaters = [];
  state.zones = [];
  state.projectiles = [];
  state.fx = [];
  state.swapCd = 0;
  state.damageLog = { weapon: 0, skill: 0, combine: 0 };
  state.lockTarget = null;
  state.player = makePlayer();
  // spare weapon for swap demo: Cleaver <-> Staff
  state.spareChassis = state.chassisId === 'Cleaver' ? CHASSIS.Staff : CHASSIS.Cleaver;

  state.carriers = [
    { type: 'Torch', x: 3, y: 5, alive: true, label: 'Torch' },
    { type: 'Torch', x: 15, y: 5, alive: true, label: 'Torch' },
    { type: 'Torch', x: 9, y: 11, alive: true, label: 'Torch' },
    { type: 'Water', x: 6, y: 9, alive: true, label: 'Wet pit', r: 1.1, conductive: true },
    { type: 'Water', x: 12, y: 9, alive: true, label: 'Wet pit', r: 1.1, conductive: true },
    { type: 'Oil', x: 9, y: 4, alive: true, label: 'AshBed', r: 0.9 },
    { type: 'RootedGround', x: 4.5, y: 10, alive: true, label: 'RootedGround', r: 0.8, permanent: true },
    { type: 'RootedGround', x: 13.5, y: 10, alive: true, label: 'RootedGround', r: 0.8, permanent: true },
    { type: 'Conductive', x: 9, y: 8, alive: true, label: 'Conductive plate', r: 1.0, permanent: true },
  ];
  // Geometry shadows (not Tier-2 carriers)
  state.shadowZones = [
    { x: 4, y: 7, r: 1.2 },
    { x: 14, y: 7, r: 1.2 },
    { x: 9, y: 12, r: 1.0 },
  ];
  state.columns = [
    { x: 4, y: 7, r: 0.55 },
    { x: 14, y: 7, r: 0.55 },
  ];

  state.enemies = [
    makeEnemy('AshGrunt', 7.5, 8.5),
    makeEnemy('TideWretch', 11.5, 9.5),
    makeEnemy('GateSaint', 9, 12.2, true),
  ];
  toast('Waves: Ash Grunt + Tide Wretch. Gate Saint waits behind the grate.', 3.5);
}

function makeEnemy(kind, x, y, gated = false) {
  const def = ENEMY[kind];
  return {
    kind,
    name: def.name,
    x, y,
    r: kind === 'GateSaint' ? 0.7 : 0.42,
    hp: def.hp,
    maxHp: def.hp,
    poise: def.poise,
    maxPoise: def.poise,
    speed: def.speed,
    facing: Math.PI / 2,
    action: null,
    stagger: 0,
    gated,
    invuln: gated,
    alive: true,
    cd: 0,
    phase: 1,
    ashWaveCd: 0,
    rooted: 0,
    dots: [],
    corpse: false,
  };
}

// ——— Resources ———
function spendSta(p, cost) {
  if (p.sta < cost) return false;
  p.sta -= cost;
  p.staIdle = 0;
  return true;
}

function spendFocus(p, cost) {
  // Allowed under Focus; shortage → Debt
  let need = cost;
  if (p.focus >= need) {
    p.focus -= need;
    p.focusIdle = 0;
    return true;
  }
  const fromFocus = p.focus;
  const debtAdd = need - fromFocus;
  if (p.debt + debtAdd > DEBT.max && p.debt >= DEBT.max) {
    return 'cancel';
  }
  const room = DEBT.max - p.debt;
  if (debtAdd > room) {
    return 'cancel';
  }
  p.focus = 0;
  p.debt += debtAdd;
  p.focusIdle = 0;
  return true;
}

function applyBackfire(p) {
  p.hp -= DEBT.backfireHp;
  p.poise = Math.max(0, p.poise - DEBT.backfirePoise);
  p.stagger = DEBT.backfireStagger;
  p.action = null;
  addFloater(p.x, p.y - 0.4, 'BACKFIRE', '#e04545');
  toast('Backfire! Debt was Critical (≥40).', 2);
}

function tickResources(p, dt) {
  p.staIdle += dt;
  p.focusIdle += dt;
  const debtMulSta = 1 - 0.01 * p.debt;
  const debtMulFoc = 1 - 0.012 * p.debt;
  if (p.staIdle >= STA.regenDelay && p.stagger <= 0) {
    p.sta = Math.min(100, p.sta + STA.regen * debtMulSta * dt);
  }
  if (p.focusIdle >= FOCUS.regenDelay && !p.action) {
    let regen = FOCUS.regen * debtMulFoc;
    // Focusweave stub skipped
    p.focus = Math.min(100, p.focus + regen * dt);
  }
  if (p.debt > 0 && p.focus >= DEBT.drainFocusMin && !p.action) {
    p.debt = Math.max(0, p.debt - DEBT.drain * dt);
  }
  if (p.stagger > 0) {
    p.stagger -= dt;
    if (p.stagger <= 0 && p.poise <= 0) p.poise = 40;
  } else if (p.poise < p.maxPoise) {
    p.poise = Math.min(p.maxPoise, p.poise + 20 * dt);
  }
  if (p.iFrames > 0) p.iFrames -= dt;
  if (p.rooted > 0) p.rooted -= dt;
  if (p.weave > 0) p.weave -= dt;
  if (state.swapCd > 0) state.swapCd -= dt;
  // DoTs
  for (let i = p.dots.length - 1; i >= 0; i--) {
    const d = p.dots[i];
    d.t -= dt;
    d.acc = (d.acc || 0) + dt;
    if (d.acc >= 1) {
      d.acc -= 1;
      hurtPlayer(d.dps, 0, null, true);
    }
    if (d.t <= 0) p.dots.splice(i, 1);
  }
}

function heatLabel(debt) {
  if (debt <= 0) return 'Cold';
  if (debt < 30) return 'Warm';
  if (debt < 40) return 'Hot';
  return 'Critical';
}

// ——— Combat verbs ———
function busy(p) {
  return !!(p.action || p.stagger > 0);
}

function startAttack(p, which) {
  if (busy(p) && !(p.action && p.action.type === 'block')) return;
  const cost = which === 'A' ? STA.attackA : STA.attackB;
  if (!spendSta(p, cost)) {
    toast('STA deny', 0.8);
    return;
  }
  const atk = which === 'A' ? p.chassis.A : p.chassis.B;
  p.blocking = false;
  p.action = {
    type: 'attack',
    which,
    t: 0,
    start: atk.start,
    active: atk.active,
    recover: atk.recover,
    hit: false,
    atk,
  };
}

function startDodge(p) {
  if (p.stagger > 0) return;
  // cancel window for casts
  if (p.action && (p.action.type === 'skill' || p.action.type === 'combine')) {
    const win = p.action.type === 'combine' ? 0.12 : 0.1;
    if (p.action.t <= win) {
      // refund
      p.focus = Math.min(100, p.focus + (p.action.focusSpent || 0));
      p.debt = Math.max(0, p.debt - (p.action.debtSpent || 0));
      p.action = null;
    } else if (p.action.t > win) {
      return; // commitment
    }
  } else if (p.action && p.action.type === 'attack') {
    const atk = p.action;
    if (atk.which === 'A' && atk.t >= atk.start + atk.active && atk.t < atk.start + atk.active + atk.recover * 0.5) {
      // dodge cancel mid recovery A for Cleaver
    } else if (atk.t > 0.05) {
      return;
    }
  } else if (p.action && p.action.type === 'swap') {
    return;
  }
  let cost = STA.dodge;
  if (p.debt >= 30) cost += DEBT.hotDodgeExtra;
  if (!spendSta(p, cost)) {
    toast('STA deny', 0.8);
    return;
  }
  const mv = input.moveVec();
  let dx = mv.x, dy = mv.y;
  if (!dx && !dy) {
    // away from nearest threat
    const th = nearestThreat(p);
    if (th) {
      const n = norm(p.x - th.x, p.y - th.y);
      dx = n.x; dy = n.y;
    } else {
      dx = Math.cos(p.facing); dy = Math.sin(p.facing);
    }
  }
  p.action = { type: 'dodge', t: 0, dx, dy, iframesAt: 2 / 60, doneI: false };
  p.blocking = false;
}

function startBlock(p) {
  if (!p.canBlock) {
    toast('canBlock=no', 0.7);
    return;
  }
  if (busy(p) && !(p.action && p.action.type === 'block')) return;
  p.blockHold = 0;
  p.parryArmed = true;
  p.action = { type: 'block', t: 0, holding: true };
}

function tryParry(p, enemy) {
  // Called when enemy active starts / hits
  if (!p.canBlock) return false;
  if (p.action && p.action.type === 'block' && p.action.t <= PARRY_WINDOW) {
    return true;
  }
  if (p.parryArmed && p.blockHold < BLOCK_HOLD && input.blockDown()) {
    return true;
  }
  return false;
}

function startSwap(p) {
  if (state.swapCd > 0) {
    toast('Swap CD', 0.7);
    return;
  }
  if (busy(p)) return;
  p.action = { type: 'swap', t: 0, dur: 0.6 };
}

function finishSwap(p) {
  const cur = p.chassis;
  p.chassis = state.spareChassis;
  state.spareChassis = cur;
  p.canBlock = p.chassis.canBlock;
  state.swapCd = 4.0;
  toast(`Swap → ${p.chassis.id}`, 1.2);
}

function pairKey(a, b) {
  return [a, b].sort().join('+');
}

function phenomenonName(s1, s2, tier2) {
  const k = pairKey(s1, s2);
  const t1 = {
    'Spark+Tide': 'Грозовая плёнка',
    'Spark+Root': 'Искровой капкан',
    'Ash+Root': 'Мёртвая поросль',
    'Spark+Ash': 'Вспышка тлена',
  };
  const t2 = {
    'Spark+Tide': 'Грозовой столб',
    'Spark+Root': 'Проводная казнь',
    'Ash+Root': 'Костяной терн',
    'Spark+Ash': 'Огненный шквал',
  };
  if (tier2 && t2[k]) return t2[k];
  return t1[k] || `${s1}+${s2}`;
}

function findCarrierNear(aim, types) {
  let best = null, bestD = 1.5;
  for (const c of state.carriers) {
    if (!c.alive) continue;
    if (types && !types.includes(c.type)) continue;
    const d = dist(aim, c);
    const r = (c.r || 0.5) + 0.2;
    if (d <= Math.max(bestD, r) && d < bestD + 0.01) {
      // prefer closer
    }
    if (d <= 1.5 || d <= (c.r || 0.5) + 0.3) {
      if (d < bestD) { bestD = d; best = c; }
    }
  }
  // also check zones overlapping aim
  for (const z of state.zones) {
    if (z.carrierType && types && types.includes(z.carrierType)) {
      if (dist(aim, z) <= (z.r || 1) + 0.2) {
        return { type: z.carrierType, x: z.x, y: z.y, alive: true, fromZone: z };
      }
    }
  }
  return best;
}

function startSkill(p, slot) {
  if (busy(p)) return;
  const force = slot === 1 ? p.skill1 : p.skill2;
  const willBackfire = p.debt >= DEBT.backfireAt;
  const res = spendFocus(p, FOCUS.skill);
  if (res === 'cancel') {
    toast('Debt cap — cast cancel', 1);
    return;
  }
  p.action = {
    type: 'skill',
    slot,
    force,
    t: 0,
    start: 0.28,
    recover: 0.22,
    focusSpent: FOCUS.skill,
    debtSpent: 0,
    released: false,
    willBackfire,
  };
  if (willBackfire) {
    // fires on start per canon A
    applyBackfire(p);
  }
}

function startCombine(p) {
  if (busy(p)) return;
  const willBackfire = p.debt >= DEBT.backfireAt;
  const res = spendFocus(p, FOCUS.combine);
  if (res === 'cancel') {
    toast('Debt cap — combine cancel', 1);
    return;
  }
  p._skill1Armed = false;
  p._skill2Armed = false;
  p._combineConsumed = true;
  p.action = {
    type: 'combine',
    t: 0,
    start: 0.45,
    recover: 0.3,
    focusSpent: FOCUS.combine,
    debtSpent: 0,
    released: false,
    willBackfire,
  };
  if (willBackfire) applyBackfire(p);
}

function releaseSkill(p, force) {
  const aim = { x: p.aimX, y: p.aimY };
  const col = FORCES[force]?.color || '#fff';
  p.weave = 0.5;
  if (force === 'Spark') {
    // ray 5m
    hitRay(p, aim, 5, 26, 12, 'skill', col);
    // ignite oil/torch along ray
    for (const c of state.carriers) {
      if (!c.alive) continue;
      if ((c.type === 'Torch' || c.type === 'Oil') && dist(c, p) < 5.2) {
        // lit / consume oil later via Tier-2
      }
    }
  } else if (force === 'Tide') {
    hitCone(p, 2.2, 160, 18, 20, 'skill', col);
    spawnZone({ type: 'water', carrierType: 'Water', x: p.x + Math.cos(p.facing) * 1.2, y: p.y + Math.sin(p.facing) * 1.2, r: 1.2, t: 2.5, dps: 0, color: '#3aa8a088' });
  } else if (force === 'Ash') {
    hitCone(p, 2.0, 90, 12, 10, 'skill', col);
    applyDotEnemies(p, 2.0, 90, 8, 3);
    // extinguish nearby torch
    for (const c of state.carriers) {
      if (c.type === 'Torch' && c.alive && dist(c, p) < 2.2) {
        c.alive = false;
        c.extinguished = true;
        addFloater(c.x, c.y, 'torch out', '#888');
      }
    }
  } else if (force === 'Root') {
    const zx = aim.x, zy = aim.y;
    hitCircle(zx, zy, 1.3, 10, 24, 'skill', col);
    rootEnemies(zx, zy, 1.3, 1.2);
    state.carriers.push({ type: 'RootAnchor', x: zx, y: zy, alive: true, label: 'RootAnchor', r: 0.7, t: 4, consumable: true });
    spawnZone({ type: 'rootAnchor', carrierType: 'RootAnchor', x: zx, y: zy, r: 0.7, t: 4, color: '#5a8a4a66' });
  }
  addFloater(p.x, p.y - 0.5, force, col);
}

function releaseCombine(p) {
  const s1 = p.skill1, s2 = p.skill2;
  const aim = { x: p.aimX, y: p.aimY };
  const k = pairKey(s1, s2);
  let tier2 = false;
  let carrier = null;

  if (k === 'Spark+Tide') {
    carrier = findCarrierNear(aim, ['Water', 'Conductive']);
    // also wet pits tagged conductive
    if (!carrier) {
      for (const c of state.carriers) {
        if (c.alive && c.type === 'Water' && dist(aim, c) <= 1.5) carrier = c;
      }
    }
    if (carrier) {
      tier2 = true;
      const x = carrier.x, y = carrier.y;
      spawnZone({ type: 'storm', x, y, r: 1.6, t: 2, dps: 18, poiseTick: 18, poiseEvery: 0.6, color: '#6ad4ff88', source: 'combine' });
      if (carrier.type === 'Water' && !carrier.permanent) {
        carrier.alive = false;
      }
      // consume water zones
      for (const z of state.zones) {
        if (z.carrierType === 'Water' && dist(z, { x, y }) < 1.5) z.t = 0;
      }
    } else {
      spawnZone({ type: 'film', x: aim.x, y: aim.y, r: 2.4, t: 2.5, dps: 10, poiseTick: 8, poiseEvery: 0.8, color: '#4ac8c088', source: 'combine' });
    }
  } else if (k === 'Spark+Root') {
    carrier = findCarrierNear(aim, ['RootAnchor']);
    // also RootedGround as soft upgrade path for demo readability
    if (!carrier) carrier = findCarrierNear(aim, ['RootedGround']);
    if (carrier && (carrier.type === 'RootAnchor' || carrier.type === 'RootedGround')) {
      // Проводная казнь — single target on anchor ≤4m
      const target = nearestEnemyTo(carrier.x, carrier.y, 4);
      if (target) {
        tier2 = true;
        damageEnemy(target, 48, 20, 'combine');
        addFloater(target.x, target.y, 'Проводная казнь', '#e6a84a');
        if (carrier.type === 'RootAnchor') carrier.alive = false;
      } else {
        // trap Tier-1 style
        spawnZone({ type: 'trap', x: aim.x, y: aim.y, r: 1.0, t: 3, armDmg: 30, armPoise: 12, color: '#8a6a2a88', source: 'combine' });
      }
    } else {
      spawnZone({ type: 'trap', x: aim.x, y: aim.y, r: 1.0, t: 3, armDmg: 30, armPoise: 12, color: '#8a6a2a88', source: 'combine' });
    }
  } else if (k === 'Ash+Root') {
    spawnZone({ type: 'growth', x: aim.x, y: aim.y, r: 2.0, t: 0.4, burst: 14, frail: 4, color: '#6a4a2a88', source: 'combine' });
    hitCircle(aim.x, aim.y, 2.0, 14, 10, 'combine', '#c45c2a');
  } else if (k === 'Spark+Ash') {
    carrier = findCarrierNear(aim, ['Torch', 'Oil', 'AshBed']);
    if (carrier) {
      tier2 = true;
      hitCone(p, 6, 70, 40, 20, 'combine', '#ff6a2a');
      if (carrier.type === 'Oil' || carrier.type === 'Torch') carrier.alive = false;
      spawnZone({ type: 'burn', x: p.x + Math.cos(p.facing) * 2, y: p.y + Math.sin(p.facing) * 2, r: 1.8, t: 3, dps: 12, color: '#e0502088', source: 'combine' });
    } else {
      hitCircle(aim.x, aim.y, 2.0, 28, 14, 'combine', '#c45c2a');
    }
  } else {
    hitCircle(aim.x, aim.y, 2.0, 22, 12, 'combine', '#aaa');
  }

  const name = phenomenonName(s1, s2, tier2);
  addFloater(p.x, p.y - 0.6, name + (tier2 ? ' T2' : ' T1'), tier2 ? '#e6c84a' : '#c8d0d8');
  toast(name + (tier2 ? ' (Tier-2)' : ' (Tier-1)'), 2);
  p.weave = 0.5;
}

function spawnZone(z) {
  z.acc = 0;
  z.poiseAcc = 0;
  state.zones.push(z);
}

// ——— Damage helpers ———
function livingEnemies() {
  return state.enemies.filter((e) => e.alive && !e.gated);
}

function nearestThreat(p) {
  let best = null, bd = 99;
  for (const e of livingEnemies()) {
    const d = dist(p, e);
    if (d < bd) { bd = d; best = e; }
  }
  return best;
}

function nearestEnemyTo(x, y, maxR) {
  let best = null, bd = maxR;
  for (const e of livingEnemies()) {
    const d = Math.hypot(e.x - x, e.y - y);
    if (d <= bd) { bd = d; best = e; }
  }
  return best;
}

function damageEnemy(e, hp, poise, source) {
  if (!e.alive || e.invuln) return;
  e.hp -= hp;
  e.poise -= poise;
  addFloater(e.x, e.y - 0.3, String(Math.round(hp)), source === 'combine' ? '#e6c84a' : '#fff');
  if (source === 'weapon') state.damageLog.weapon += hp;
  else if (source === 'skill') state.damageLog.skill += hp;
  else if (source === 'combine') state.damageLog.combine += hp;
  if (e.poise <= 0) {
    e.stagger = e.kind === 'GateSaint' ? 1.2 : 0.7;
    e.poise = e.kind === 'GateSaint' ? 60 : e.maxPoise * 0.5;
    addFloater(e.x, e.y - 0.6, 'STAGGER', '#e6c84a');
  }
  if (e.hp <= 0) {
    e.alive = false;
    e.corpse = true;
    if (e.kind !== 'GateSaint') {
      state.carriers.push({ type: 'Corpse', x: e.x, y: e.y, alive: true, label: 'Corpse', r: 0.5 });
    }
    addFloater(e.x, e.y, 'DOWN', '#e04545');
    if (e.kind === 'GateSaint') {
      state.mode = 'win';
      toast('Gate Saint falls. Door opens.', 4);
    }
  }
}

function hurtPlayer(hp, poise, from, isDot = false) {
  const p = state.player;
  if (!p || p.iFrames > 0) return;
  if (p.action && p.action.type === 'block' && p.blocking && p.canBlock && from && !from.unblockable) {
    // parry check
    if (from.parryWindow && tryParry(p, from)) {
      from.poise = Math.max(0, (from.poise || 0) - 12);
      if (from.ref) {
        from.ref.poise -= 12;
        if (from.ref.poise <= 0) {
          from.ref.stagger = 0.7;
          from.ref.poise = from.ref.maxPoise * 0.5;
        }
      }
      addFloater(p.x, p.y, 'PARRY', '#5cbf8a');
      p.parryArmed = false;
      return;
    }
    // block absorb
    const absorb = 8 + 0.35 * poise;
    if (p.sta >= absorb) {
      p.sta -= absorb;
      p.staIdle = 0;
      hp *= from.ranged ? 0.75 : 0.45; // −55% melee, −25% ranged → remaining
      poise *= 0.6;
    } else {
      // block break
      addFloater(p.x, p.y, 'BLOCK BREAK', '#e04545');
      p.action = null;
      p.blocking = false;
    }
  } else if (p.parryArmed && p.blockHold < BLOCK_HOLD && !isDot) {
    // tap parry fail
    if (!spendSta(p, STA.parryFail)) { /* deny */ }
    p.parryArmed = false;
  }

  p.hp -= hp;
  if (!isDot) {
    p.poise -= poise;
    if (p.poise <= 0) {
      p.stagger = 0.7;
      p.action = null;
      addFloater(p.x, p.y, 'STAGGER', '#e6c84a');
    }
    // cast stagger
    if (p.action && (p.action.type === 'skill' || p.action.type === 'combine') && p.action.t > (p.action.type === 'combine' ? 0.12 : 0.1) && poise >= 25) {
      if (p.action.type === 'combine') applyBackfire(p);
      else {
        p.action = null;
        addFloater(p.x, p.y, 'cast fail', '#e04545');
      }
    }
  }
  addFloater(p.x, p.y - 0.2, `-${Math.round(hp)}`, '#e04545');
  if (p.hp <= 0) {
    p.hp = 0;
    state.mode = 'dead';
    toast('Dead — restart with same loadout', 3);
  }
}

function hitArcAttack(p, atk, source) {
  const dir = Math.atan2(p.aimY - p.y, p.aimX - p.x);
  p.facing = dir;
  let dmg = atk.dmg;
  if (p.weave > 0 && p.chassis.id === 'Staff' && source === 'weapon') dmg += 0; // staff no weave; Orb cut
  for (const e of livingEnemies()) {
    if (atk.wave) {
      // staff B wave box
      const along = Math.cos(dir) * (e.x - p.x) + Math.sin(dir) * (e.y - p.y);
      const perp = Math.abs(-Math.sin(dir) * (e.x - p.x) + Math.cos(dir) * (e.y - p.y));
      if (along > 0 && along < (atk.range || 4) && perp < (atk.width || 1.2) / 2 + e.r) {
        damageEnemy(e, dmg, atk.poise, source);
      }
    } else if (inArc(p.x, p.y, dir, atk.range, atk.arc || 90, e.x, e.y)) {
      let bonus = 0;
      if (atk === p.chassis.B && e.stagger > 0 && p.chassis.id === 'Cleaver') bonus = 10;
      damageEnemy(e, dmg + bonus, atk.poise, source);
    }
  }
}

function hitRay(p, aim, range, dmg, poise, source, color) {
  const dir = Math.atan2(aim.y - p.y, aim.x - p.x);
  p.facing = dir;
  state.fx.push({ type: 'ray', x: p.x, y: p.y, dir, range, color, t: 0.15 });
  for (const e of livingEnemies()) {
    const along = Math.cos(dir) * (e.x - p.x) + Math.sin(dir) * (e.y - p.y);
    const perp = Math.abs(-Math.sin(dir) * (e.x - p.x) + Math.cos(dir) * (e.y - p.y));
    if (along > 0 && along < range && perp < 0.45 + e.r) {
      damageEnemy(e, dmg, poise, source);
    }
  }
}

function hitCone(p, range, arc, dmg, poise, source, color) {
  const dir = p.facing;
  state.fx.push({ type: 'cone', x: p.x, y: p.y, dir, range, arc, color, t: 0.18 });
  for (const e of livingEnemies()) {
    if (inArc(p.x, p.y, dir, range, arc, e.x, e.y)) {
      damageEnemy(e, dmg, poise, source);
    }
  }
}

function hitCircle(x, y, r, dmg, poise, source, color) {
  state.fx.push({ type: 'circle', x, y, r, color, t: 0.2 });
  for (const e of livingEnemies()) {
    if (dist(e, { x, y }) <= r + e.r) damageEnemy(e, dmg, poise, source);
  }
}

function applyDotEnemies(p, range, arc, dps, dur) {
  for (const e of livingEnemies()) {
    if (inArc(p.x, p.y, p.facing, range, arc, e.x, e.y)) {
      e.dots.push({ dps, t: dur, acc: 0 });
    }
  }
}

function rootEnemies(x, y, r, dur) {
  for (const e of livingEnemies()) {
    if (dist(e, { x, y }) <= r + e.r) e.rooted = dur;
  }
}

// ——— Player update ———
function updatePlayer(dt) {
  const p = state.player;
  if (!p) return;

  // aim from mouse
  const world = s2w(input.mouse.x, input.mouse.y);
  let ax = world.x - p.x;
  let ay = world.y - p.y;
  const gp = input.gamepad();
  if (gp && (Math.abs(gp.aimX) > 0.01 || Math.abs(gp.aimY) > 0.01)) {
    ax = gp.aimX * PLAYER.softAimMax;
    ay = gp.aimY * PLAYER.softAimMax;
  }
  const al = Math.hypot(ax, ay);
  if (al > PLAYER.softAimMax) {
    ax = (ax / al) * PLAYER.softAimMax;
    ay = (ay / al) * PLAYER.softAimMax;
  }
  p.aimX = p.x + ax;
  p.aimY = p.y + ay;
  if (al > 0.1) p.facing = Math.atan2(ay, ax);

  if (state.lockTarget && (!state.lockTarget.alive || state.lockTarget.gated)) state.lockTarget = null;
  if (input.wasPressed('lock') || (gp && gp.lock)) {
    if (state.lockTarget) state.lockTarget = null;
    else {
      const t = nearestThreat(p);
      if (t && dist(p, t) <= 10) state.lockTarget = t;
    }
  }
  if (state.lockTarget) {
    p.aimX = clamp(state.lockTarget.x, p.x - PLAYER.softAimMax, p.x + PLAYER.softAimMax);
    p.aimY = clamp(state.lockTarget.y, p.y - PLAYER.softAimMax, p.y + PLAYER.softAimMax);
    p.facing = Math.atan2(state.lockTarget.y - p.y, state.lockTarget.x - p.x);
  }

  state.envRead = input.isDown('envRead') || (gp && gp.envRead);
  if (state.envRead && input.holdTime.envRead >= 0.2) {
    /* highlight carriers in render */
  }

  tickResources(p, dt);

  const s1 = input.skill1Down();
  const s2 = input.skill2Down();
  const h1 = input.holdTime.skill1 || 0;
  const h2 = input.holdTime.skill2 || 0;

  // Combine: both held ≥120ms (priority over single skill)
  if (!p.action && p.stagger <= 0 && s1 && s2 && Math.min(h1, h2) >= COMBINE_HOLD) {
    p._skill1Armed = false;
    p._skill2Armed = false;
    startCombine(p);
  }

  if (!p.action && p.stagger <= 0) {
    if (input.wasPressed('dodge') || (gp && gp.dodge && !input._dLatch)) {
      startDodge(p);
      input._dLatch = true;
    } else if (!(gp && gp.dodge)) input._dLatch = false;

    if (input.wasPressed('swap')) startSwap(p);
    if (input.wasPressed('block')) startBlock(p);

    if (input.wasPressed('skill1')) p._skill1Armed = true;
    if (input.wasPressed('skill2')) p._skill2Armed = true;

    // Attack priority: B > A; R1+R2 = B not combine
    if (input.wasPressed('attackB') || input.mouse.rmbPressed) {
      startAttack(p, 'B');
    } else if (input.wasPressed('attackA') || input.mouse.lmbPressed) {
      startAttack(p, 'A');
    }

    if (input.wasPressed('interact')) {
      for (const c of state.carriers) {
        if (c.extinguished && dist(p, c) <= 1.5) {
          c.alive = true;
          c.extinguished = false;
          toast('Torch re-lit', 1);
        }
      }
    }
  }

  // Skill on release if combine did not consume the press
  if (p._skill1Armed && !s1 && !p.action && p.stagger <= 0) {
    p._skill1Armed = false;
    if (!p._combineConsumed) startSkill(p, 1);
  }
  if (p._skill2Armed && !s2 && !p.action && p.stagger <= 0) {
    p._skill2Armed = false;
    if (!p._combineConsumed) startSkill(p, 2);
  }
  if (!s1 && !s2) p._combineConsumed = false;

  // Block hold tracking
  if (input.blockDown() && p.canBlock) {
    p.blockHold += dt;
    if (p.action && p.action.type === 'block') {
      if (p.blockHold >= BLOCK_HOLD) {
        p.blocking = true;
        p.parryArmed = false;
      }
    }
  } else {
    if (p.action && p.action.type === 'block') {
      // released — if was tap without entering block, parry attempt consumed
      if (!p.blocking && p.blockHold < BLOCK_HOLD) {
        // tap ended — parry window closes
        p.action = null;
      } else {
        p.action = null;
      }
      p.blocking = false;
    }
    p.blockHold = 0;
    p.parryArmed = false;
  }

  // Resolve action
  if (p.action) {
    const a = p.action;
    a.t += dt;
    if (a.type === 'attack') {
      if (!a.hit && a.t >= a.start && a.t < a.start + a.active) {
        a.hit = true;
        hitArcAttack(p, a.atk, 'weapon');
      }
      if (a.t >= a.start + a.active + a.recover) p.action = null;
    } else if (a.type === 'dodge') {
      if (!a.doneI && a.t >= a.iframesAt) {
        a.doneI = true;
        p.iFrames = 0.18;
      }
      const spd = 9;
      tryMove(p, a.dx * spd * dt, a.dy * spd * dt);
      if (a.t >= a.iframesAt + 0.18 + 0.22) p.action = null;
    } else if (a.type === 'skill') {
      if (!a.released && a.t >= a.start) {
        a.released = true;
        if (!a.willBackfire || p.stagger <= 0) releaseSkill(p, a.force);
      }
      if (a.t >= a.start + a.recover) p.action = null;
    } else if (a.type === 'combine') {
      if (!a.released && a.t >= a.start) {
        a.released = true;
        if (!a.willBackfire || p.hp > 0) releaseCombine(p);
      }
      if (a.t >= a.start + a.recover) p.action = null;
    } else if (a.type === 'swap') {
      p.moveMul = 0.4;
      if (a.t >= a.dur) {
        finishSwap(p);
        p.action = null;
        p.moveMul = 1;
      }
    } else if (a.type === 'block') {
      // held
    }
  } else {
    p.moveMul = 1;
  }

  // Movement
  if (p.stagger <= 0 && p.rooted <= 0 && !(p.action && (p.action.type === 'attack' || p.action.type === 'skill' || p.action.type === 'combine'))) {
    const mv = input.moveVec();
    let mul = p.moveMul;
    if (p.action && p.action.type === 'block' && p.blocking) mul *= 0.55;
    if (p.action && p.action.type === 'attack') mul *= 0.35;
    tryMove(p, mv.x * PLAYER.speed * mul * dt, mv.y * PLAYER.speed * mul * dt);
  } else if (p.action && (p.action.type === 'skill' || p.action.type === 'combine')) {
    const mv = input.moveVec();
    tryMove(p, mv.x * PLAYER.speed * 0.25 * dt, mv.y * PLAYER.speed * 0.25 * dt);
  }
}

function tryMove(ent, dx, dy) {
  let nx = clamp(ent.x + dx, 0.5, ARENA_W - 0.5);
  let ny = clamp(ent.y + dy, 0.5, ARENA_H - 0.5);
  for (const c of state.columns) {
    const d = Math.hypot(nx - c.x, ny - c.y);
    if (d < c.r + ent.r) {
      const n = norm(nx - c.x, ny - c.y);
      nx = c.x + n.x * (c.r + ent.r);
      ny = c.y + n.y * (c.r + ent.r);
    }
  }
  ent.x = clamp(nx, 0.5, ARENA_W - 0.5);
  ent.y = clamp(ny, 0.5, ARENA_H - 0.5);
}

// ——— Enemies AI ———
function updateEnemies(dt) {
  const p = state.player;
  const addsAlive = state.enemies.filter((e) => e.alive && (e.kind === 'AshGrunt' || e.kind === 'TideWretch'));
  if (!state.bossReleased && (addsAlive.length === 0 || state.arenaTime >= 45)) {
    state.bossReleased = true;
    state.bossWalk = 2;
    const boss = state.enemies.find((e) => e.kind === 'GateSaint');
    if (boss) {
      boss.gated = false;
      boss.invuln = true;
      toast('Grate rises — Gate Saint enters', 2.5);
    }
  }
  if (state.bossWalk > 0) {
    state.bossWalk -= dt;
    const boss = state.enemies.find((e) => e.kind === 'GateSaint');
    if (boss) {
      boss.y = clamp(boss.y - 1.2 * dt, 8, 12.2);
      if (state.bossWalk <= 0) boss.invuln = false;
    }
  }

  for (const e of state.enemies) {
    if (!e.alive) continue;
    // dots
    for (let i = e.dots.length - 1; i >= 0; i--) {
      const d = e.dots[i];
      d.t -= dt;
      d.acc = (d.acc || 0) + dt;
      if (d.acc >= 1) {
        d.acc -= 1;
        damageEnemy(e, d.dps, 0, 'skill');
      }
      if (d.t <= 0) e.dots.splice(i, 1);
    }
    if (e.rooted > 0) e.rooted -= dt;
    if (e.stagger > 0) {
      e.stagger -= dt;
      e.action = null;
      continue;
    }
    if (e.gated || e.invuln) continue;
    if (e.cd > 0) e.cd -= dt;

    if (e.kind === 'AshGrunt') aiGrunt(e, p, dt);
    else if (e.kind === 'TideWretch') aiWretch(e, p, dt);
    else if (e.kind === 'GateSaint') aiBoss(e, p, dt);
  }
}

function aiGrunt(e, p, dt) {
  if (e.action) {
    tickEnemyAttack(e, p, dt);
    return;
  }
  const d = dist(e, p);
  e.facing = Math.atan2(p.y - e.y, p.x - e.x);
  if (d > 1.6) {
    if (e.rooted <= 0) tryMove(e, Math.cos(e.facing) * e.speed * dt, Math.sin(e.facing) * e.speed * dt);
  } else if (e.cd <= 0) {
    // choose slash or spit
    if (d < 1.8 && Math.random() < 0.65) {
      e.action = { type: 'slash', t: 0, start: 0.4, active: 0.12, recover: 0.35, dmg: 18, poise: 20, range: 1.5, hit: false };
    } else {
      e.action = { type: 'spit', t: 0, start: 0.55, active: 0.05, recover: 0.4, fired: false };
    }
    e.cd = 0.8;
  }
}

function aiWretch(e, p, dt) {
  if (e.action) {
    tickEnemyAttack(e, p, dt);
    return;
  }
  const d = dist(e, p);
  e.facing = Math.atan2(p.y - e.y, p.x - e.x);
  const ideal = d < 5 ? -1 : d > 7 ? 1 : 0;
  if (ideal !== 0 && e.rooted <= 0) {
    tryMove(e, Math.cos(e.facing) * ideal * e.speed * dt, Math.sin(e.facing) * ideal * e.speed * dt);
  } else if (e.cd <= 0) {
    if (Math.random() < 0.55) {
      e.action = { type: 'bolt', t: 0, start: 0.35, active: 0.05, recover: 0.3, fired: false };
    } else {
      e.action = { type: 'wet', t: 0, start: 0.7, active: 0.05, recover: 0.3, done: false };
    }
    e.cd = 1.0;
  }
}

function aiBoss(e, p, dt) {
  const pct = e.hp / e.maxHp;
  e.phase = pct > 0.6 ? 1 : pct > 0.3 ? 2 : 3;
  if (e.phase === 2) {
    // move to circle center
    const cx = 9, cy = 8;
    const d = Math.hypot(e.x - cx, e.y - cy);
    if (d > 0.4 && e.rooted <= 0 && !e.action) {
      tryMove(e, ((cx - e.x) / d) * e.speed * 0.8 * dt, ((cy - e.y) / d) * e.speed * 0.8 * dt);
    }
  }
  if (e.phase === 3) {
    e.ashWaveCd -= dt;
    if (e.ashWaveCd <= 0 && !e.action) {
      e.action = { type: 'ashWave', t: 0, start: 0.5, active: 0.2, recover: 0.4, hit: false };
      e.ashWaveCd = 8;
    }
  }
  if (e.action) {
    tickEnemyAttack(e, p, dt);
    return;
  }
  e.facing = Math.atan2(p.y - e.y, p.x - e.x);
  const d = dist(e, p);
  if (e.phase !== 2 && d > 2.2 && e.rooted <= 0) {
    tryMove(e, Math.cos(e.facing) * e.speed * dt, Math.sin(e.facing) * e.speed * dt);
  }
  if (e.cd <= 0) {
    if (e.phase === 2 && Math.random() < 0.5) {
      e.action = { type: 'snare', t: 0, start: 0.7, active: 0.1, recover: 0.3, tx: p.x, ty: p.y, done: false };
    } else if (d < 2.5 && Math.random() < 0.55) {
      const start = e.phase === 3 ? 0.45 : 0.55;
      e.action = { type: 'cleave', t: 0, start, active: 0.14, recover: 0.5, dmg: 26, poise: 28, range: 2.2, arc: 120, hit: false, unblockable: true };
    } else {
      e.action = { type: 'bolt', t: 0, start: 0.4, active: 0.05, recover: 0.35, fired: false, boss: true };
    }
    e.cd = 0.9;
  }
}

function tickEnemyAttack(e, p, dt) {
  const a = e.action;
  a.t += dt;
  // telegraph handled in render via a.t < a.start
  if (a.type === 'slash' || a.type === 'cleave') {
    if (!a.hit && a.t >= a.start && a.t < a.start + a.active) {
      a.hit = true;
      if (inArc(e.x, e.y, e.facing, a.range, a.arc || 90, p.x, p.y)) {
        hurtPlayer(a.dmg, a.poise, { unblockable: !!a.unblockable, parryWindow: true, ref: e });
      }
    }
  } else if (a.type === 'spit' || a.type === 'bolt') {
    if (!a.fired && a.t >= a.start) {
      a.fired = true;
      const dir = Math.atan2(p.y - e.y, p.x - e.x);
      state.projectiles.push({
        x: e.x, y: e.y,
        vx: Math.cos(dir) * 7,
        vy: Math.sin(dir) * 7,
        r: 0.2,
        dmg: a.boss ? 16 : a.type === 'spit' ? 14 : 12,
        poise: 8,
        ashDot: a.type === 'spit',
        ranged: true,
        life: 2.5,
        from: e,
      });
    }
  } else if (a.type === 'wet') {
    if (!a.done && a.t >= a.start) {
      a.done = true;
      spawnZone({ type: 'water', carrierType: 'Water', x: p.x, y: p.y, r: 1.1, t: 3, color: '#3aa8a066' });
      state.carriers.push({ type: 'Water', x: p.x, y: p.y, alive: true, label: 'Wet pit', r: 1.1, conductive: true, t: 3 });
    }
  } else if (a.type === 'snare') {
    if (!a.done && a.t >= a.start) {
      a.done = true;
      if (Math.hypot(p.x - a.tx, p.y - a.ty) < 1.4) {
        p.rooted = 1.0;
        hurtPlayer(10, 10, { unblockable: false, ranged: true });
      }
      state.fx.push({ type: 'circle', x: a.tx, y: a.ty, r: 1.4, color: '#5a8a4a99', t: 0.25 });
    }
  } else if (a.type === 'ashWave') {
    if (!a.hit && a.t >= a.start) {
      a.hit = true;
      if (Math.hypot(p.x - e.x, p.y - e.y) < 5) {
        hurtPlayer(22, 12, { unblockable: true });
      }
      // first ash wave extinguishes torches
      if (!e._ashOnce) {
        e._ashOnce = true;
        for (const c of state.carriers) {
          if (c.type === 'Torch' && c.alive) {
            c.alive = false;
            c.extinguished = true;
          }
        }
        toast('Ash wave snuffs the torches', 2);
      }
    }
  }
  if (a.t >= a.start + a.active + a.recover) e.action = null;
}

function updateZones(dt) {
  for (let i = state.zones.length - 1; i >= 0; i--) {
    const z = state.zones[i];
    z.t -= dt;
    z.acc += dt;
    if (z.dps && z.acc >= 1) {
      z.acc -= 1;
      for (const e of livingEnemies()) {
        if (dist(e, z) <= z.r + e.r) damageEnemy(e, z.dps, 0, z.source || 'combine');
      }
      const p = state.player;
      if (z.hurtPlayer && dist(p, z) <= z.r) hurtPlayer(z.dps, 0, null, true);
    }
    if (z.poiseTick) {
      z.poiseAcc += dt;
      if (z.poiseAcc >= (z.poiseEvery || 0.8)) {
        z.poiseAcc = 0;
        for (const e of livingEnemies()) {
          if (dist(e, z) <= z.r + e.r) {
            e.poise -= z.poiseTick;
            if (e.poise <= 0) {
              e.stagger = 0.7;
              e.poise = e.maxPoise * 0.5;
            }
          }
        }
      }
    }
    if (z.type === 'trap' && !z.sprung) {
      for (const e of livingEnemies()) {
        if (dist(e, z) <= z.r + e.r) {
          z.sprung = true;
          damageEnemy(e, z.armDmg, z.armPoise, 'combine');
          e.rooted = 0.8;
          z.t = 0;
        }
      }
    }
    if (z.type === 'growth' && z.burst && !z.fired) {
      z.fired = true;
    }
    if (z.t <= 0) state.zones.splice(i, 1);
  }
  // temp carriers ttl
  for (const c of state.carriers) {
    if (c.t != null) {
      c.t -= dt;
      if (c.t <= 0) c.alive = false;
    }
  }
}

function updateProjectiles(dt) {
  const p = state.player;
  for (let i = state.projectiles.length - 1; i >= 0; i--) {
    const pr = state.projectiles[i];
    pr.x += pr.vx * dt;
    pr.y += pr.vy * dt;
    pr.life -= dt;
    if (pr.life <= 0 || pr.x < 0 || pr.y < 0 || pr.x > ARENA_W || pr.y > ARENA_H) {
      state.projectiles.splice(i, 1);
      continue;
    }
    if (Math.hypot(pr.x - p.x, pr.y - p.y) < p.r + pr.r) {
      hurtPlayer(pr.dmg, pr.poise, { ranged: true, parryWindow: true, ref: pr.from });
      if (pr.ashDot) p.dots.push({ dps: 4, t: 2, acc: 0 });
      state.projectiles.splice(i, 1);
    }
  }
}

function updateFx(dt) {
  for (let i = state.fx.length - 1; i >= 0; i--) {
    state.fx[i].t -= dt;
    if (state.fx[i].t <= 0) state.fx.splice(i, 1);
  }
  for (let i = state.floaters.length - 1; i >= 0; i--) {
    state.floaters[i].t -= dt;
    state.floaters[i].y -= dt * 0.6;
    if (state.floaters[i].t <= 0) state.floaters.splice(i, 1);
  }
  if (state.msgT > 0) state.msgT -= dt;
}

// ——— Render ———
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  // atmosphere
  const g = ctx.createLinearGradient(0, 0, 0, canvas.height);
  g.addColorStop(0, '#152029');
  g.addColorStop(1, '#0a1014');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (state.mode === 'bench') {
    drawBench();
    return;
  }

  drawArena();
  drawCarriers();
  drawZones();
  drawColumns();
  drawEnemies();
  drawPlayer();
  drawProjectiles();
  drawFx();
  drawFloaters();
  drawHUD();
  if (state.mode === 'pause') drawPause();
  if (state.mode === 'win') drawOverlay('VICTORY', 'Gate Saint defeated. Press R to bench.', '#5cbf8a');
  if (state.mode === 'dead') drawOverlay('DEFEATED', 'Press R to restart same loadout · Esc bench', '#e04545');
}

function drawArena() {
  const a = w2s(0, 0);
  const w = ARENA_W * VIEW.scale;
  const h = ARENA_H * VIEW.scale;
  ctx.fillStyle = '#1a242c';
  ctx.fillRect(a.x, a.y, w, h);
  // floor pattern
  ctx.strokeStyle = '#243038';
  ctx.lineWidth = 1;
  for (let x = 0; x <= ARENA_W; x++) {
    const p1 = w2s(x, 0), p2 = w2s(x, ARENA_H);
    ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.stroke();
  }
  for (let y = 0; y <= ARENA_H; y++) {
    const p1 = w2s(0, y), p2 = w2s(ARENA_W, y);
    ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.stroke();
  }
  // ritual circle
  const c = w2s(9, 8);
  ctx.strokeStyle = '#3d5a5a';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(c.x, c.y, 2 * VIEW.scale, 0, Math.PI * 2);
  ctx.stroke();
  // door
  const d = w2s(9, 13);
  ctx.fillStyle = state.mode === 'win' ? '#5cbf8a' : '#2a3844';
  ctx.fillRect(d.x - 30, d.y - 8, 60, 16);
  ctx.fillStyle = '#7a8a96';
  ctx.font = '10px IBM Plex Mono';
  ctx.fillText(state.mode === 'win' ? 'DOOR OPEN' : 'DOOR', d.x - 24, d.y + 4);
  // grate / boss silhouette
  if (!state.bossReleased) {
    ctx.fillStyle = '#0e1418cc';
    ctx.fillRect(w2s(7, 11.5).x, w2s(7, 11.5).y, 4 * VIEW.scale, 2 * VIEW.scale);
    ctx.strokeStyle = '#4a5a64';
    ctx.strokeRect(w2s(7, 11.5).x, w2s(7, 11.5).y, 4 * VIEW.scale, 2 * VIEW.scale);
    ctx.fillStyle = '#6a7a84';
    ctx.fillText('GRATE', w2s(8.3, 12.3).x, w2s(8.3, 12.3).y);
  }
  // border
  ctx.strokeStyle = '#3a4a54';
  ctx.lineWidth = 3;
  ctx.strokeRect(a.x, a.y, w, h);
}

function drawColumns() {
  for (const c of state.columns) {
    const p = w2s(c.x, c.y);
    ctx.fillStyle = '#2e3c48';
    ctx.beginPath();
    ctx.arc(p.x, p.y, c.r * VIEW.scale, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#4a5a64';
    ctx.stroke();
  }
  for (const s of state.shadowZones) {
    const p = w2s(s.x, s.y);
    ctx.fillStyle = '#00000044';
    ctx.beginPath();
    ctx.arc(p.x, p.y, s.r * VIEW.scale, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawCarriers() {
  for (const c of state.carriers) {
    if (!c.alive && !c.extinguished) continue;
    const p = w2s(c.x, c.y);
    const r = (c.r || 0.45) * VIEW.scale;
    let col = '#888';
    if (c.type === 'Torch') col = c.alive ? '#e6a84a' : '#555';
    if (c.type === 'Water') col = '#3aa8a0';
    if (c.type === 'Oil' || c.type === 'AshBed') col = '#8a5a2a';
    if (c.type === 'RootAnchor' || c.type === 'RootedGround') col = '#5a8a4a';
    if (c.type === 'Conductive') col = '#6ad4ff';
    if (c.type === 'Corpse') col = '#5a4040';
    ctx.globalAlpha = state.envRead ? 1 : 0.85;
    ctx.fillStyle = col + (c.type === 'Conductive' ? '55' : '99');
    ctx.beginPath();
    ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = col;
    ctx.lineWidth = state.envRead ? 2.5 : 1.5;
    ctx.stroke();
    if (state.envRead || c.type === 'Conductive' || c.type === 'Water') {
      ctx.fillStyle = '#c8d0d8';
      ctx.font = '9px IBM Plex Mono';
      ctx.fillText(c.label || c.type, p.x - 18, p.y - r - 4);
    }
    ctx.globalAlpha = 1;
  }
}

function drawZones() {
  for (const z of state.zones) {
    const p = w2s(z.x, z.y);
    ctx.fillStyle = z.color || '#ffffff44';
    ctx.beginPath();
    ctx.arc(p.x, p.y, z.r * VIEW.scale, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawPlayer() {
  const p = state.player;
  if (!p) return;
  const s = w2s(p.x, p.y);
  // aim
  const a = w2s(p.aimX, p.aimY);
  ctx.strokeStyle = '#5cbf8a88';
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(s.x, s.y);
  ctx.lineTo(a.x, a.y);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = '#5cbf8a';
  ctx.beginPath();
  ctx.arc(a.x, a.y, 4, 0, Math.PI * 2);
  ctx.fill();

  if (p.iFrames > 0) ctx.globalAlpha = 0.45;
  ctx.fillStyle = p.chassis.family === 'magic' ? '#6a9aaa' : '#c8d0d8';
  ctx.beginPath();
  ctx.arc(s.x, s.y, p.r * VIEW.scale, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = p.blocking ? '#5cbf8a' : '#1a242c';
  ctx.lineWidth = p.blocking ? 3 : 2;
  ctx.stroke();
  // facing
  ctx.strokeStyle = '#e8eef2';
  ctx.beginPath();
  ctx.moveTo(s.x, s.y);
  ctx.lineTo(s.x + Math.cos(p.facing) * 16, s.y + Math.sin(p.facing) * 16);
  ctx.stroke();
  ctx.globalAlpha = 1;

  // cast telegraph
  if (p.action && (p.action.type === 'skill' || p.action.type === 'combine')) {
    const col = p.action.type === 'combine' ? '#e6c84a' : (FORCES[p.action.force]?.color || '#fff');
    ctx.strokeStyle = col;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(s.x, s.y, (0.6 + p.action.t) * VIEW.scale, 0, Math.PI * 2);
    ctx.stroke();
  }
}

function drawEnemies() {
  for (const e of state.enemies) {
    if (!e.alive && !e.corpse) continue;
    const s = w2s(e.x, e.y);
    if (!e.alive) {
      ctx.fillStyle = '#3a3030';
      ctx.beginPath();
      ctx.arc(s.x, s.y, e.r * VIEW.scale * 0.8, 0, Math.PI * 2);
      ctx.fill();
      continue;
    }
    if (e.gated) {
      ctx.globalAlpha = 0.35;
    }
    let col = '#c45c2a';
    if (e.kind === 'TideWretch') col = '#3aa8a0';
    if (e.kind === 'GateSaint') col = '#d0c8b0';
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.arc(s.x, s.y, e.r * VIEW.scale, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#0a1014';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.globalAlpha = 1;

    // HP bar
    const bw = 36;
    ctx.fillStyle = '#0008';
    ctx.fillRect(s.x - bw / 2, s.y - e.r * VIEW.scale - 10, bw, 4);
    ctx.fillStyle = e.kind === 'GateSaint' ? '#e6c84a' : '#e04545';
    ctx.fillRect(s.x - bw / 2, s.y - e.r * VIEW.scale - 10, bw * (e.hp / e.maxHp), 4);

    // telegraph
    if (e.action && e.action.t < e.action.start) {
      const urgent = e.action.start - e.action.t <= 0.45;
      const colT = urgent ? '#e6c84a' : '#e6c84a88';
      ctx.strokeStyle = colT;
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 4]);
      if (e.action.type === 'slash' || e.action.type === 'cleave') {
        drawArcTele(e, e.action.range || 1.5, e.action.arc || 90, colT);
      } else if (e.action.type === 'snare') {
        const tp = w2s(e.action.tx, e.action.ty);
        ctx.beginPath();
        ctx.arc(tp.x, tp.y, 1.4 * VIEW.scale, 0, Math.PI * 2);
        ctx.stroke();
      } else if (e.action.type === 'ashWave') {
        ctx.beginPath();
        ctx.arc(s.x, s.y, 5 * VIEW.scale, 0, Math.PI * 2);
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.arc(s.x, s.y, (e.r + 0.5) * VIEW.scale, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.setLineDash([]);
    }
    if (e.action && e.action.t >= e.action.start && e.action.t < e.action.start + e.action.active) {
      ctx.strokeStyle = '#e04545';
      ctx.lineWidth = 3;
      if (e.action.type === 'slash' || e.action.type === 'cleave') {
        drawArcTele(e, e.action.range || 1.5, e.action.arc || 90, '#e04545');
      } else {
        ctx.beginPath();
        ctx.arc(s.x, s.y, (e.r + 0.35) * VIEW.scale, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
    ctx.fillStyle = '#c8d0d8';
    ctx.font = '9px IBM Plex Mono';
    ctx.fillText(e.name, s.x - 24, s.y + e.r * VIEW.scale + 12);
  }
}

function drawArcTele(e, range, arcDeg, color) {
  const s = w2s(e.x, e.y);
  ctx.strokeStyle = color;
  ctx.beginPath();
  ctx.moveTo(s.x, s.y);
  const a0 = e.facing - (arcDeg * Math.PI / 180) / 2;
  const a1 = e.facing + (arcDeg * Math.PI / 180) / 2;
  ctx.arc(s.x, s.y, range * VIEW.scale, a0, a1);
  ctx.closePath();
  ctx.stroke();
  ctx.fillStyle = color.length === 7 ? color + '33' : color;
  ctx.fill();
}

function drawProjectiles() {
  for (const pr of state.projectiles) {
    const s = w2s(pr.x, pr.y);
    ctx.fillStyle = pr.ashDot ? '#c45c2a' : '#6ad4ff';
    ctx.beginPath();
    ctx.arc(s.x, s.y, 5, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawFx() {
  for (const f of state.fx) {
    if (f.type === 'ray') {
      const s = w2s(f.x, f.y);
      ctx.strokeStyle = f.color;
      ctx.lineWidth = 3;
      ctx.globalAlpha = Math.max(0, f.t * 5);
      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(s.x + Math.cos(f.dir) * f.range * VIEW.scale, s.y + Math.sin(f.dir) * f.range * VIEW.scale);
      ctx.stroke();
      ctx.globalAlpha = 1;
    } else if (f.type === 'circle') {
      const s = w2s(f.x, f.y);
      ctx.strokeStyle = f.color;
      ctx.fillStyle = f.color;
      ctx.globalAlpha = 0.35;
      ctx.beginPath();
      ctx.arc(s.x, s.y, f.r * VIEW.scale, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    } else if (f.type === 'cone') {
      drawArcTele({ x: f.x, y: f.y, facing: f.dir }, f.range, f.arc, f.color);
    }
  }
}

function drawFloaters() {
  for (const f of state.floaters) {
    const s = w2s(f.x, f.y);
    ctx.globalAlpha = clamp(f.t * 1.5, 0, 1);
    ctx.fillStyle = f.color;
    ctx.font = 'bold 12px IBM Plex Mono';
    ctx.fillText(f.text, s.x - 10, s.y);
    ctx.globalAlpha = 1;
  }
}

function drawHUD() {
  const p = state.player;
  if (!p) return;
  const x0 = 16, y0 = 12;
  ctx.fillStyle = '#0a1014cc';
  ctx.fillRect(x0, y0, 280, 92);
  ctx.strokeStyle = '#2a3a46';
  ctx.strokeRect(x0, y0, 280, 92);
  bar(x0 + 10, y0 + 10, 160, 10, p.hp / 100, '#e04545', 'HP');
  bar(x0 + 10, y0 + 28, 160, 10, p.sta / 100, '#e6c84a', 'STA');
  bar(x0 + 10, y0 + 46, 160, 10, p.focus / 100, '#3aa8a0', 'FOC');
  bar(x0 + 10, y0 + 64, 160, 10, p.debt / 50, p.debt >= 40 ? '#e04545' : p.debt >= 30 ? '#c45c2a' : '#8a6a4a', `Debt ${Math.floor(p.debt)} ${heatLabel(p.debt)}`);
  ctx.fillStyle = '#9ab';
  ctx.font = '11px IBM Plex Mono';
  ctx.fillText(`${p.chassis.id} · ${p.skill1}/${p.skill2}`, x0 + 180, y0 + 22);
  ctx.fillText(`Poise ${Math.floor(p.poise)}`, x0 + 180, y0 + 40);
  ctx.fillText(`t ${state.arenaTime.toFixed(0)}s`, x0 + 180, y0 + 58);
  if (state.swapCd > 0) ctx.fillText(`swap ${state.swapCd.toFixed(1)}`, x0 + 180, y0 + 76);

  if (state.msgT > 0) {
    ctx.fillStyle = '#0a1014ee';
    ctx.fillRect(canvas.width / 2 - 220, canvas.height - 56, 440, 36);
    ctx.fillStyle = '#e8eef2';
    ctx.font = '13px IBM Plex Mono';
    ctx.textAlign = 'center';
    ctx.fillText(state.msg, canvas.width / 2, canvas.height - 34);
    ctx.textAlign = 'left';
  }
}

function bar(x, y, w, h, pct, col, label) {
  ctx.fillStyle = '#1a242c';
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = col;
  ctx.fillRect(x, y, w * clamp(pct, 0, 1), h);
  ctx.fillStyle = '#c8d0d8';
  ctx.font = '9px IBM Plex Mono';
  ctx.fillText(label, x + w + 6, y + 8);
}

function drawBench() {
  ctx.fillStyle = '#0c1218';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  // subtle grid
  ctx.strokeStyle = '#1a2830';
  for (let i = 0; i < 40; i++) {
    ctx.beginPath();
    ctx.moveTo(i * 40, 0);
    ctx.lineTo(i * 40, canvas.height);
    ctx.stroke();
  }
  ctx.fillStyle = '#e8eef2';
  ctx.font = 'bold 28px Libre Baskerville, serif';
  ctx.fillText('Prefight Bench', 48, 64);
  ctx.font = '13px IBM Plex Mono';
  ctx.fillStyle = '#7a8a96';
  ctx.fillText('Pick chassis + route preset · Enter / Space to enter arena', 48, 90);

  // Chassis
  ctx.fillStyle = '#3d7a7a';
  ctx.font = '12px IBM Plex Mono';
  ctx.fillText('CHASSIS', 48, 130);
  drawChoice(48, 145, 200, 70, state.chassisId === 'Cleaver', 'Cleaver', 'Martial · canBlock · R1/R2 weight');
  drawChoice(268, 145, 200, 70, state.chassisId === 'Staff', 'Staff', 'Magic · no block · A poke / B wave');

  ctx.fillStyle = '#3d7a7a';
  ctx.fillText('FORCE PRESET (Skill1 + Skill2)', 48, 250);
  let i = 0;
  for (const id of ['M1', 'M2', 'M3']) {
    const pr = PRESETS[id];
    drawChoice(48 + i * 220, 265, 200, 90, state.presetId === id, pr.label, `${pr.skill1}+${pr.skill2}\n${pr.blurb}`);
    i++;
  }

  ctx.fillStyle = '#7a8a96';
  ctx.font = '12px IBM Plex Mono';
  ctx.fillText('1/2 chassis · 3/4/5 presets · Click or keys', 48, 390);
  ctx.fillText(`Loadout: ${state.chassisId} · ${state.skill1} + ${state.skill2}`, 48, 420);
  ctx.fillStyle = '#c45c2a';
  ctx.fillText('Phenomena in slice: Грозовая плёнка / Грозовой столб · Искровой капкан / Проводная казнь · Мёртвая поросль', 48, 450);

  ctx.fillStyle = '#5cbf8a';
  ctx.font = 'bold 16px IBM Plex Mono';
  ctx.fillText('[ Enter ] START ARENA', 48, 520);
  ctx.fillStyle = '#7a8a96';
  ctx.font = '12px IBM Plex Mono';
  ctx.fillText('Esc during fight = pause + DualSense/keyboard map', 48, 550);
}

function drawChoice(x, y, w, h, on, title, body) {
  ctx.fillStyle = on ? '#1e3a3a' : '#152029';
  ctx.strokeStyle = on ? '#5cbf8a' : '#2a3a46';
  ctx.lineWidth = on ? 2 : 1;
  ctx.fillRect(x, y, w, h);
  ctx.strokeRect(x, y, w, h);
  ctx.fillStyle = '#e8eef2';
  ctx.font = 'bold 14px IBM Plex Mono';
  ctx.fillText(title, x + 12, y + 24);
  ctx.fillStyle = '#7a8a96';
  ctx.font = '11px IBM Plex Mono';
  const lines = String(body).split('\n');
  lines.forEach((ln, idx) => ctx.fillText(ln, x + 12, y + 44 + idx * 14));
}

function drawPause() {
  ctx.fillStyle = '#0a1014dd';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#e8eef2';
  ctx.font = 'bold 26px Libre Baskerville, serif';
  ctx.fillText('Paused', 80, 70);
  ctx.font = '13px IBM Plex Mono';
  ctx.fillStyle = '#3d7a7a';
  ctx.fillText('DualSense → Keyboard (gold map)', 80, 100);
  let y = 130;
  ctx.fillStyle = '#c8d0d8';
  ctx.font = '12px IBM Plex Mono';
  for (const [a, b] of KEYBOARD_MAP) {
    ctx.fillStyle = '#7a8a96';
    ctx.fillText(a, 80, y);
    ctx.fillStyle = '#e8eef2';
    ctx.fillText(b, 280, y);
    y += 20;
  }
  y += 12;
  ctx.fillStyle = '#c45c2a';
  ctx.fillText('Combine = L1+L2 (Q+E). R1+R2 is NOT Combine (Attack B priority).', 80, y);
  y += 28;
  ctx.fillStyle = '#5cbf8a';
  ctx.fillText('Esc resume · R restart fight · F return to bench', 80, y);
  y += 36;
  ctx.fillStyle = '#3d7a7a';
  ctx.fillText('Route tips', 80, y);
  y += 22;
  ctx.fillStyle = '#9ab';
  ctx.font = '11px IBM Plex Mono';
  for (const id of ['M1', 'M2', 'M3']) {
    const pr = PRESETS[id];
    ctx.fillText(`${pr.label}: ${pr.blurb}`, 80, y);
    y += 18;
  }
}

function drawOverlay(title, sub, col) {
  ctx.fillStyle = '#0a1014aa';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = col;
  ctx.font = 'bold 42px Libre Baskerville, serif';
  ctx.textAlign = 'center';
  ctx.fillText(title, canvas.width / 2, canvas.height / 2 - 20);
  ctx.fillStyle = '#c8d0d8';
  ctx.font = '14px IBM Plex Mono';
  ctx.fillText(sub, canvas.width / 2, canvas.height / 2 + 20);
  const d = state.damageLog;
  const tot = d.weapon + d.skill + d.combine || 1;
  ctx.fillText(`Damage share — weapon ${(100 * d.weapon / tot).toFixed(0)}% · skill ${(100 * d.skill / tot).toFixed(0)}% · combine ${(100 * d.combine / tot).toFixed(0)}%`, canvas.width / 2, canvas.height / 2 + 48);
  ctx.textAlign = 'left';
}

// ——— Bench input ———
function applyPreset(id) {
  const pr = PRESETS[id];
  state.presetId = id;
  state.skill1 = pr.skill1;
  state.skill2 = pr.skill2;
  // chassis from preset unless user overrode after — sync recommended
  state.chassisId = pr.chassis;
}

function handleBenchClick(mx, my) {
  // chassis boxes
  if (hitBox(mx, my, 48, 145, 200, 70)) state.chassisId = 'Cleaver';
  if (hitBox(mx, my, 268, 145, 200, 70)) state.chassisId = 'Staff';
  if (hitBox(mx, my, 48, 265, 200, 90)) applyPreset('M1');
  if (hitBox(mx, my, 268, 265, 200, 90)) applyPreset('M2');
  if (hitBox(mx, my, 488, 265, 200, 90)) applyPreset('M3');
}

function hitBox(mx, my, x, y, w, h) {
  return mx >= x && mx <= x + w && my >= y && my <= y + h;
}

function startFight() {
  // ensure skills from preset if chassis manually changed
  const pr = PRESETS[state.presetId];
  state.skill1 = pr.skill1;
  state.skill2 = pr.skill2;
  resetArena();
  state.mode = 'fight';
  canvas.focus();
}

// ——— Main loop ———
let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  input.beginFrame(dt);

  if (input.consumeBlurPause() && state.mode === 'fight') state.mode = 'pause';

  if (state.mode === 'bench') {
    if (input.wasPressed('attackA') || input.mouse.lmbPressed) {
      handleBenchClick(input.mouse.x, input.mouse.y);
    }
  } else if (state.mode === 'fight') {
    if (input.pausePressed()) state.mode = 'pause';
    else {
      state.arenaTime += dt;
      updatePlayer(dt);
      updateEnemies(dt);
      updateZones(dt);
      updateProjectiles(dt);
      updateFx(dt);
    }
  } else if (state.mode === 'pause') {
    if (input.pausePressed()) state.mode = 'fight';
    if (input.wasPressed('swap')) {
      resetArena();
      state.mode = 'fight';
    }
    if (input.wasPressed('block')) state.mode = 'bench';
  } else if (state.mode === 'win' || state.mode === 'dead') {
    if (input.wasPressed('swap')) {
      resetArena();
      state.mode = 'fight';
    }
    if (input.pausePressed()) state.mode = 'bench';
  }

  draw();
  input.endFrame();
  requestAnimationFrame(frame);
}

// Extra keyboard for bench
window.addEventListener('keydown', (e) => {
  if (state.mode === 'bench') {
    if (e.code === 'Digit1') state.chassisId = 'Cleaver';
    if (e.code === 'Digit2') state.chassisId = 'Staff';
    if (e.code === 'Digit3') applyPreset('M1');
    if (e.code === 'Digit4') applyPreset('M2');
    if (e.code === 'Digit5') applyPreset('M3');
    if (e.code === 'Enter' || e.code === 'Space') {
      e.preventDefault();
      startFight();
    }
  }
});

applyPreset('M1');
requestAnimationFrame(frame);
canvas.focus();
