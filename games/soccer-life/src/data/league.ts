import { CLUB_DEFS, FIRST_NAMES, LAST_NAMES } from './names';
import { FORMATIONS, SQUAD_TEMPLATE } from './formations';
import type {
  Club,
  Fixture,
  FormationId,
  Player,
  PlayerAttrs,
  Position,
  Season,
  TableRow,
  Tactics,
} from '../types';

/** Deterministic PRNG (mulberry32) */
function mulberry32(seed: number): () => number {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}

function randInt(rng: () => number, lo: number, hi: number): number {
  return lo + Math.floor(rng() * (hi - lo + 1));
}

function pickName(rng: () => number, used: Set<string>): string {
  for (let i = 0; i < 40; i++) {
    const first = FIRST_NAMES[Math.floor(rng() * FIRST_NAMES.length)];
    const last = LAST_NAMES[Math.floor(rng() * LAST_NAMES.length)];
    const name = `${first} ${last}`;
    if (!used.has(name)) {
      used.add(name);
      return name;
    }
  }
  return `Игрок ${used.size + 1}`;
}

function baseAttrsForPos(pos: Position, strength: number, rng: () => number): PlayerAttrs {
  const base = clamp(Math.round(strength * 0.7 + rng() * 6), 4, 16);
  const jitter = () => clamp(base + randInt(rng, -3, 3), 1, 20);
  const attrs: PlayerAttrs = {
    pac: jitter(),
    sht: jitter(),
    pas: jitter(),
    def: jitter(),
    phy: jitter(),
    men: jitter(),
  };
  // Position bias
  switch (pos) {
    case 'GK':
      attrs.def = clamp(attrs.def + 4, 1, 20);
      attrs.sht = clamp(attrs.sht - 4, 1, 20);
      attrs.phy = clamp(attrs.phy + 2, 1, 20);
      break;
    case 'CB':
      attrs.def = clamp(attrs.def + 3, 1, 20);
      attrs.phy = clamp(attrs.phy + 2, 1, 20);
      attrs.sht = clamp(attrs.sht - 2, 1, 20);
      break;
    case 'FB':
      attrs.pac = clamp(attrs.pac + 2, 1, 20);
      attrs.def = clamp(attrs.def + 1, 1, 20);
      break;
    case 'DM':
      attrs.def = clamp(attrs.def + 2, 1, 20);
      attrs.pas = clamp(attrs.pas + 1, 1, 20);
      break;
    case 'CM':
      attrs.pas = clamp(attrs.pas + 3, 1, 20);
      attrs.men = clamp(attrs.men + 1, 1, 20);
      break;
    case 'AM':
      attrs.pas = clamp(attrs.pas + 2, 1, 20);
      attrs.sht = clamp(attrs.sht + 2, 1, 20);
      break;
    case 'W':
      attrs.pac = clamp(attrs.pac + 3, 1, 20);
      attrs.pas = clamp(attrs.pas + 1, 1, 20);
      break;
    case 'ST':
      attrs.sht = clamp(attrs.sht + 4, 1, 20);
      attrs.pac = clamp(attrs.pac + 1, 1, 20);
      break;
  }
  return attrs;
}

function playerValue(attrs: PlayerAttrs, age: number): number {
  const sum = attrs.pac + attrs.sht + attrs.pas + attrs.def + attrs.phy + attrs.men;
  const ageMod = age < 24 ? 1.15 : age > 30 ? 0.85 : 1;
  return Math.round(sum * 8_000 * ageMod);
}

function overall(p: Player): number {
  const a = p.attrs;
  return (a.pac + a.sht + a.pas + a.def + a.phy + a.men) / 6;
}

function generatePlayers(
  clubId: string,
  strength: number,
  rng: () => number,
  usedNames: Set<string>,
): Player[] {
  const players: Player[] = [];
  SQUAD_TEMPLATE.forEach((pos, i) => {
    const age = randInt(rng, 18, 34);
    const attrs = baseAttrsForPos(pos, strength, rng);
    const id = `${clubId}_p${String(i + 1).padStart(2, '0')}`;
    players.push({
      id,
      name: pickName(rng, usedNames),
      pos,
      age,
      attrs,
      form: randInt(rng, 55, 90),
      fatigue: randInt(rng, 0, 25),
      value: playerValue(attrs, age),
    });
  });
  return players;
}

function defaultTactics(players: Player[], formation: FormationId = '433'): Tactics {
  const slots = FORMATIONS[formation];
  const remaining = [...players].sort((a, b) => overall(b) - overall(a));
  const lineup: string[] = [];
  const used = new Set<string>();

  for (const slot of slots) {
    // Prefer exact position, then nearby
    let pick =
      remaining.find((p) => !used.has(p.id) && p.pos === slot.pos) ??
      remaining.find((p) => !used.has(p.id) && compatible(p.pos, slot.pos)) ??
      remaining.find((p) => !used.has(p.id));
    if (pick) {
      used.add(pick.id);
      lineup.push(pick.id);
    }
  }

  while (lineup.length < 11) {
    const pick = remaining.find((p) => !used.has(p.id));
    if (!pick) break;
    used.add(pick.id);
    lineup.push(pick.id);
  }

  const bench = remaining
    .filter((p) => !used.has(p.id))
    .slice(0, 7)
    .map((p) => p.id);

  return {
    formation,
    press: 1,
    width: 1,
    tempo: 1,
    risk: 1,
    lineup,
    bench,
  };
}

function compatible(a: Position, b: Position): boolean {
  const groups: Position[][] = [
    ['GK'],
    ['CB', 'FB', 'DM'],
    ['DM', 'CM', 'AM'],
    ['AM', 'W', 'ST'],
    ['W', 'FB'],
  ];
  return groups.some((g) => g.includes(a) && g.includes(b));
}

/** Round-robin: each pair once → 15 matchdays for 16 clubs; we take first 14. */
function buildFixtures(clubIds: string[], matchdaysTotal: number): Fixture[] {
  const n = clubIds.length;
  if (n % 2 !== 0) throw new Error('Need even club count');
  const ids = [...clubIds];
  const fixtures: Fixture[] = [];
  const rounds = n - 1;
  const half = n / 2;

  for (let round = 0; round < rounds && round < matchdaysTotal; round++) {
    for (let i = 0; i < half; i++) {
      const home = ids[i];
      const away = ids[n - 1 - i];
      const swap = round % 2 === 1;
      fixtures.push({
        matchday: round + 1,
        homeId: swap ? away : home,
        awayId: swap ? home : away,
        played: false,
      });
    }
    // rotate (circle method)
    const fixed = ids[0];
    const rest = ids.slice(1);
    rest.unshift(rest.pop()!);
    ids.splice(0, ids.length, fixed, ...rest);
  }

  return fixtures;
}

function emptyTable(clubIds: string[]): TableRow[] {
  return clubIds.map((clubId) => ({
    clubId,
    played: 0,
    won: 0,
    drawn: 0,
    lost: 0,
    gf: 0,
    ga: 0,
    pts: 0,
  }));
}

export type LeagueBundle = {
  clubs: Club[];
  season: Season;
  playerClubId: string;
};

export function generateLeague(seed = 42): LeagueBundle {
  const rng = mulberry32(seed);
  const usedNames = new Set<string>();
  const playerClubId = 'club_player';

  const clubs: Club[] = CLUB_DEFS.map((def) => {
    const players = generatePlayers(def.id, def.strength, rng, usedNames);
    const cash = def.id === playerClubId ? 2_500_000 : randInt(rng, 800_000, 4_000_000);
    return {
      id: def.id,
      name: def.name,
      colors: def.colors,
      cash,
      stadiumLvl: 1,
      trainingLvl: 1,
      academyLvl: 1,
      players,
      tactics: defaultTactics(players, '433'),
    };
  });

  const clubIds = clubs.map((c) => c.id);
  const matchdaysTotal = 14;
  const season: Season = {
    matchday: 1,
    matchdaysTotal,
    fixtures: buildFixtures(clubIds, matchdaysTotal),
    table: emptyTable(clubIds),
  };

  return { clubs, season, playerClubId };
}

export function clubById(clubs: Club[], id: string): Club {
  const c = clubs.find((x) => x.id === id);
  if (!c) throw new Error(`Club not found: ${id}`);
  return c;
}

export function nextFixture(season: Season, clubId: string): Fixture | undefined {
  return season.fixtures.find(
    (f) =>
      !f.played &&
      f.matchday === season.matchday &&
      (f.homeId === clubId || f.awayId === clubId),
  );
}

export function opponentId(fixture: Fixture, clubId: string): string {
  return fixture.homeId === clubId ? fixture.awayId : fixture.homeId;
}
