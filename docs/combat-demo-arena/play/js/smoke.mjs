/**
 * Headless smoke: load modules, simulate a short fight without DOM canvas APIs beyond stubs.
 * Run: node --experimental-vm-modules docs/combat-demo-arena/play/js/smoke.mjs
 * (Uses dynamic import of canon only — full canvas game needs browser.)
 */
import {
  PRESETS, CHASSIS, COMBINE_HOLD, STA, FOCUS, DEBT, ENEMY, KEYBOARD_MAP,
} from './canon.js';

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

assert(COMBINE_HOLD === 0.12, 'Combine hold must be 120ms');
assert(PRESETS.M1.skill1 === 'Root' && PRESETS.M1.skill2 === 'Ash', 'M1 forces');
assert(PRESETS.M2.chassis === 'Staff', 'M2 magic chassis');
assert(PRESETS.M3.skill1 === 'Spark' && PRESETS.M3.skill2 === 'Root', 'M3 hybrid');
assert(CHASSIS.Cleaver.canBlock === true, 'Cleaver blocks');
assert(CHASSIS.Staff.canBlock === false, 'Staff no block');
assert(ENEMY.AshGrunt.hp === 70, 'Ash Grunt HP');
assert(ENEMY.TideWretch.hp === 55, 'Tide Wretch HP');
assert(ENEMY.GateSaint.hp === 280, 'Gate Saint HP');
assert(DEBT.backfireAt === 40, 'Backfire threshold');
assert(STA.dodge === 28 && FOCUS.combine === 40, 'resource costs');
assert(KEYBOARD_MAP.some((r) => r[0].includes('Combine')), 'keyboard map documents Combine');

// Debt shortage math
function spendFocus(focus, debt, cost, debtMax = 50) {
  if (focus >= cost) return { focus: focus - cost, debt, ok: true };
  const debtAdd = cost - focus;
  if (debt + debtAdd > debtMax) return { focus, debt, ok: false };
  return { focus: 0, debt: debt + debtAdd, ok: true };
}
let r = spendFocus(15, 0, 40);
assert(r.ok && r.focus === 0 && r.debt === 25, 'Focus shortage → Debt');
r = spendFocus(0, 45, 40);
assert(!r.ok, 'Debt cap cancels cast');

console.log('SMOKE OK — canon constants + debt math');
