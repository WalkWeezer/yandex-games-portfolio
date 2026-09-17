/**
 * Post-match report + soft deltas — DESIGN_LLM §4.4
 */

import type { Club, MatchEvent, Player } from '../types';
import type { MatchDeltas, MatchReport, MatchState, Side } from './types';

function playerName(state: MatchState, side: Side, id: string): string {
  const p = state[side].players.find((x) => x.id === id);
  return p?.name ?? id;
}

function chanceEvents(events: MatchEvent[]): Extract<MatchEvent, { type: 'chance' }>[] {
  return events.filter((e): e is Extract<MatchEvent, { type: 'chance' }> => e.type === 'chance');
}

function pickKeyEvents(events: MatchEvent[]): MatchEvent[] {
  const goals = events.filter((e) => e.type === 'chance' && e.outcome === 'goal');
  const live = events.filter((e) => e.type === 'live');
  const injury = events.filter((e) => e.type === 'injury');
  const bigXg = chanceEvents(events)
    .filter((e) => e.outcome !== 'goal')
    .sort((a, b) => b.xg - a.xg);

  const picked: MatchEvent[] = [];
  const push = (e: MatchEvent | undefined) => {
    if (!e) return;
    if (picked.includes(e)) return;
    picked.push(e);
  };

  for (const g of goals) {
    push(g);
    if (picked.length >= 3) return picked.slice(0, 3);
  }
  for (const i of injury) {
    push(i);
    if (picked.length >= 3) return picked.slice(0, 3);
  }
  for (const x of bigXg) {
    push(x);
    if (picked.length >= 3) return picked.slice(0, 3);
  }
  for (const l of live) {
    push(l);
    if (picked.length >= 3) return picked.slice(0, 3);
  }
  for (const e of events) {
    push(e);
    if (picked.length >= 3) break;
  }
  return picked.slice(0, 3);
}

function bestPlayer(state: MatchState): MatchReport['bestPlayer'] {
  const scores = new Map<string, { side: Side; name: string; score: number }>();

  const bump = (side: Side, id: string, add: number) => {
    const name = playerName(state, side, id);
    const cur = scores.get(id) ?? { side, name, score: 0 };
    cur.score += add;
    scores.set(id, cur);
  };

  for (const e of chanceEvents(state.events)) {
    if (!e.scorerId) continue;
    if (e.outcome === 'goal') bump(e.side, e.scorerId, 3 + e.xg);
    else bump(e.side, e.scorerId, e.xg);
  }

  // GK saves
  for (const e of chanceEvents(state.events)) {
    if (e.outcome !== 'save') continue;
    const defSide: Side = e.side === 'home' ? 'away' : 'home';
    const gk = state[defSide].players.find((p) => p.pos === 'GK');
    if (gk) bump(defSide, gk.id, 1.2);
  }

  // Fallback: highest form on pitch
  if (scores.size === 0) {
    for (const side of ['home', 'away'] as Side[]) {
      for (const id of state[side].tactics.lineup) {
        const p = state[side].players.find((x) => x.id === id);
        if (p) bump(side, p.id, p.form / 100 + p.attrs.sht / 40);
      }
    }
  }

  let best: { id: string; side: Side; name: string; score: number } | null = null;
  for (const [id, v] of scores) {
    if (!best || v.score > best.score) best = { id, ...v };
  }
  if (!best) {
    return { id: '', name: '—', side: 'home', reason: 'нет данных' };
  }
  const reason =
    best.score >= 3 ? 'голы и моменты' : best.score >= 1.5 ? 'сейвы / создание' : 'стабильная игра';
  return { id: best.id, name: best.name, side: best.side, reason };
}

function buildTip(state: MatchState): Pick<MatchReport, 'tip' | 'tipCode'> {
  const ticks = Math.max(1, state.minute);
  const homeAtk = state.stats.homeAttackSum / ticks;
  const awayAtk = state.stats.awayAttackSum / ticks;
  const homeDef = state.stats.homeDefSum / Math.max(1, ticks);
  const avgFatigue =
    state.home.players
      .filter((p) => state.home.tactics.lineup.includes(p.id))
      .reduce((s, p) => s + p.fatigue, 0) / 11;

  const press = state.home.tactics.press;
  const width = state.home.tactics.width;
  const tempo = state.home.tactics.tempo;
  const risk = state.home.baseRisk;

  const xgHome = state.xg.home;
  const goalsHome = state.score.home;

  if (avgFatigue > 72) {
    return { tipCode: 'stamina_collapse', tip: 'Физика просела — слишком высокий темп/пресс без свежих ног.' };
  }
  if (press === 0 && awayAtk > homeAtk * 1.05) {
    return { tipCode: 'press_too_low', tip: 'Прессинг слишком низкий — соперник спокойно создавал моменты.' };
  }
  if (width === 0 && state.stats.homeChances < state.stats.awayChances) {
    return { tipCode: 'no_width', tip: 'Нет ширины — атаки шли узко, фланги молчали.' };
  }
  if (tempo === 0 && xgHome < state.xg.away) {
    return { tipCode: 'tempo_slow', tip: 'Темп медленный — мало обострений в чужой штрафной.' };
  }
  if (risk === 2 && state.score.home < state.score.away && homeDef < awayAtk) {
    return { tipCode: 'risk_high', tip: 'Риск «все вперёд» оголил оборону — ловили контратаки.' };
  }
  if (xgHome > goalsHome + 0.8 && goalsHome <= state.score.away) {
    return { tipCode: 'finishing', tip: 'Моментов хватало, не хватило реализации ударов.' };
  }
  if (state.score.home > state.score.away) {
    return { tipCode: 'solid', tip: 'План сработал — держи баланс инструкций на следующий матч.' };
  }
  return { tipCode: 'solid', tip: 'Нужна более смелая ширина или темп, чтобы продавить блок.' };
}

export function buildReport(state: MatchState): MatchReport {
  const tip = buildTip(state);
  return {
    homeName: state.home.name,
    awayName: state.away.name,
    homeId: state.home.clubId,
    awayId: state.away.clubId,
    score: { ...state.score },
    xg: {
      home: Math.round(state.xg.home * 100) / 100,
      away: Math.round(state.xg.away * 100) / 100,
    },
    bestPlayer: bestPlayer(state),
    keyEvents: pickKeyEvents(state.events),
    tip: tip.tip,
    tipCode: tip.tipCode,
    events: [...state.events],
    seed: state.seed,
  };
}

function formDeltaForPlayer(
  p: Player,
  side: Side,
  homeGoals: number,
  awayGoals: number,
  scored: boolean,
): number {
  const won =
    (side === 'home' && homeGoals > awayGoals) ||
    (side === 'away' && awayGoals > homeGoals);
  const drew = homeGoals === awayGoals;
  let d = won ? 3 : drew ? 1 : -2;
  if (scored) d += 4;
  if (p.fatigue > 80) d -= 2;
  return d;
}

export function buildMatchDeltas(
  state: MatchState,
  homeClub: Club,
  awayClub: Club,
): MatchDeltas {
  const hg = state.score.home;
  const ag = state.score.away;
  const homePts = hg > ag ? 3 : hg === ag ? 1 : 0;
  const awayPts = ag > hg ? 3 : ag === hg ? 1 : 0;

  const homeIncome = 6000 + homeClub.stadiumLvl * 2500;
  const awayIncome = 5000 + awayClub.stadiumLvl * 2000;

  const homeCash =
    homePts === 3 ? Math.round(homeIncome * 1.4) : homePts === 1 ? Math.round(homeIncome * 0.85) : Math.round(homeIncome * 0.45);
  const awayCash =
    awayPts === 3 ? Math.round(awayIncome * 1.2) : awayPts === 1 ? Math.round(awayIncome * 0.75) : Math.round(awayIncome * 0.4);

  const scorers = new Set(
    chanceEvents(state.events)
      .filter((e) => e.outcome === 'goal' && e.scorerId)
      .map((e) => e.scorerId!),
  );

  const formDelta: Record<string, number> = {};
  const fatigueAfter: Record<string, number> = {};

  for (const side of ['home', 'away'] as Side[]) {
    const lineup = new Set(state[side].tactics.lineup);
    for (const p of state[side].players) {
      fatigueAfter[p.id] = Math.round(p.fatigue * 10) / 10;
      if (!lineup.has(p.id)) continue;
      formDelta[p.id] = formDeltaForPlayer(p, side, hg, ag, scorers.has(p.id));
    }
  }

  return {
    homeClubId: state.home.clubId,
    awayClubId: state.away.clubId,
    homeGoals: hg,
    awayGoals: ag,
    homePts,
    awayPts,
    homeCashDelta: homeCash,
    awayCashDelta: awayCash,
    formDelta,
    fatigueAfter,
  };
}

/** Russian feed line for MatchScene. */
export function formatEventRu(state: MatchState, e: MatchEvent): string {
  const min = `${e.t}'`;
  if (e.type === 'chance') {
    const who = e.scorerId ? playerName(state, e.side, e.scorerId) : e.side;
    const sideTag = e.side === 'home' ? state.home.name : state.away.name;
    const map = {
      goal: `ГОЛ! ${who} (${sideTag}) · xG ${e.xg.toFixed(2)}`,
      save: `Сейв! удар ${who} · xG ${e.xg.toFixed(2)}`,
      miss: `Мимо — ${who} · xG ${e.xg.toFixed(2)}`,
      block: `Блок — ${who} · xG ${e.xg.toFixed(2)}`,
    } as const;
    return `${min} ${map[e.outcome]}`;
  }
  if (e.type === 'live') {
    const act =
      e.action === 'instr' ? 'смена инструкции' : e.action === 'sub' ? 'замена' : 'эмо-режим';
    return `${min} Live: ${act}`;
  }
  if (e.type === 'sub') {
    return `${min} Замена: ${playerName(state, e.side, e.playerId)}`;
  }
  if (e.type === 'card') {
    return `${min} Карточка: ${playerName(state, e.side, e.playerId)}`;
  }
  return `${min} Травма: ${playerName(state, e.side, e.playerId)}`;
}
