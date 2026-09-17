/**
 * Node-runnable smoke: deterministic sim + live instruction shifts pChance.
 *
 *   npx tsx src/engine/__tests__/simSmoke.ts
 */

import {
  applyLiveAction,
  createMatch,
  finishMatch,
  peekChanceRates,
  simulateMatch,
  tickMatch,
} from '../matchEngine';
import type { Club, Player, Position, Tactics } from '../../types';

function mkPlayer(id: string, name: string, pos: Position, level: number): Player {
  const a = Math.max(1, Math.min(20, level));
  return {
    id,
    name,
    pos,
    age: 24,
    attrs: { pac: a, sht: a, pas: a, def: a, phy: a, men: a },
    form: 60,
    fatigue: 10,
    value: 100_000,
  };
}

function lineupFor(
  formation: Tactics['formation'],
  prefix: string,
): { players: Player[]; tactics: Tactics } {
  const slots: Position[] =
    formation === '433'
      ? ['GK', 'FB', 'CB', 'CB', 'FB', 'CM', 'CM', 'CM', 'W', 'ST', 'W']
      : formation === '442'
        ? ['GK', 'FB', 'CB', 'CB', 'FB', 'W', 'CM', 'CM', 'W', 'ST', 'ST']
        : ['GK', 'CB', 'CB', 'CB', 'DM', 'DM', 'CM', 'W', 'W', 'ST', 'ST'];

  const players = slots.map((pos, i) =>
    mkPlayer(`${prefix}${i}`, `${prefix.toUpperCase()} ${pos}${i}`, pos, prefix === 'h' ? 14 : 11),
  );
  const bench = [0, 1, 2].map((i) =>
    mkPlayer(`${prefix}b${i}`, `${prefix} Bench${i}`, 'CM', prefix === 'h' ? 12 : 10),
  );
  const tactics: Tactics = {
    formation,
    press: 1,
    width: 1,
    tempo: 1,
    risk: 1,
    lineup: players.map((p) => p.id),
    bench: bench.map((p) => p.id),
  };
  return { players: [...players, ...bench], tactics };
}

function mkClub(id: string, name: string, strong: boolean): Club {
  const { players, tactics } = lineupFor('433', id[0] ?? 'x');
  if (!strong) {
    for (const p of players) {
      for (const k of Object.keys(p.attrs) as (keyof Player['attrs'])[]) {
        p.attrs[k] = Math.max(1, p.attrs[k] - 3);
      }
    }
  }
  return {
    id,
    name,
    colors: ['#0b1f3a', '#1a7a3a'],
    cash: 50_000,
    stadiumLvl: 1,
    trainingLvl: 1,
    academyLvl: 1,
    players,
    tactics,
  };
}

function assert(cond: boolean, msg: string): void {
  if (!cond) throw new Error(msg);
}

function main(): void {
  const home = mkClub('home', 'Север', true);
  const away = mkClub('away', 'Юг', false);

  const a = simulateMatch({ home, away, seed: 42 });
  const b = simulateMatch({ home, away, seed: 42 });
  assert(a.report.score.home === b.report.score.home, 'deterministic home goals');
  assert(a.report.score.away === b.report.score.away, 'deterministic away goals');
  assert(a.report.xg.home === b.report.xg.home, 'deterministic xG');
  assert(a.report.keyEvents.length <= 3, 'key events ≤3');
  assert(a.report.tip.length > 0, 'tip present');
  assert(a.state.minute === 90 && a.state.finished, '90 minutes');

  const live = createMatch({ home, away, seed: 7 });
  for (let i = 0; i < 10; i++) tickMatch(live);
  const before = peekChanceRates(live);
  const res = applyLiveAction(live, { kind: 'instr', key: 'tempo', level: 2 }, 'home');
  assert(res.ok, 'live instr ok');
  const after = peekChanceRates(live);
  assert(after.homeAttack > before.homeAttack, 'tempo↑ raises attack power');
  assert(after.home !== before.home, 'pChance home changed');

  const bus = applyLiveAction(live, { kind: 'emotion', mode: 'bus' }, 'home');
  assert(bus.ok, 'emotion ok');
  const afterBus = peekChanceRates(live);
  assert(afterBus.homeAttack < after.homeAttack, 'bus lowers attack');

  finishMatch(live);
  assert(live.finished && live.minute === 90, 'finishMatch');

  const c = simulateMatch({ home, away, seed: 99 });
  const sameScore =
    c.report.score.home === a.report.score.home && c.report.score.away === a.report.score.away;
  const sameEvents = c.state.events.length === a.state.events.length;
  assert(!(sameScore && sameEvents && c.report.xg.home === a.report.xg.home), 'seed changes outcome');

  console.log('simSmoke OK', {
    score: a.report.score,
    xg: a.report.xg,
    tip: a.report.tip,
    best: a.report.bestPlayer.name,
    liveShift: { before: before.home, after: after.home },
  });
}

main();
