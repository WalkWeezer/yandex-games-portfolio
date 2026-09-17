import type { Club, SaveBlob, Season, Tactics } from '../types';
import { SAVE_KEY } from '../types';
import { clubById, generateLeague, nextFixture, opponentId } from '../data/league';

let state: SaveBlob | null = null;

export function getState(): SaveBlob {
  if (!state) throw new Error('GameState not loaded');
  return state;
}

export function getPlayerClub(): Club {
  const s = getState();
  return clubById(s.clubs, s.playerClubId);
}

export function getClub(id: string): Club {
  return clubById(getState().clubs, id);
}

export function getSeason(): Season {
  return getState().season;
}

export function getNextOpponent(): Club | null {
  const s = getState();
  const fx = nextFixture(s.season, s.playerClubId);
  if (!fx) return null;
  return clubById(s.clubs, opponentId(fx, s.playerClubId));
}

export function updatePlayerTactics(patch: Partial<Tactics>): void {
  const club = getPlayerClub();
  club.tactics = { ...club.tactics, ...patch };
  persist();
}

export function setLineup(lineup: string[], bench: string[]): void {
  const club = getPlayerClub();
  club.tactics.lineup = lineup.slice(0, 11);
  club.tactics.bench = bench.slice(0, 7);
  persist();
}

/** Move player into lineup slot (0..10). Displaced player goes to bench/reserves. */
export function assignToLineupSlot(playerId: string, slotIndex: number): void {
  const club = getPlayerClub();
  const { lineup, bench } = club.tactics;
  if (slotIndex < 0 || slotIndex > 10) return;
  if (!club.players.some((p) => p.id === playerId)) return;

  const L = [...lineup];
  while (L.length < 11) L.push('');
  const B = [...bench];

  const inLine = L.indexOf(playerId);
  const inBench = B.indexOf(playerId);
  const displaced = L[slotIndex];

  if (inLine === slotIndex) return;

  if (inLine >= 0) {
    L[inLine] = displaced;
    L[slotIndex] = playerId;
  } else {
    L[slotIndex] = playerId;
    if (inBench >= 0) B.splice(inBench, 1);
    if (displaced && displaced !== playerId && !B.includes(displaced) && B.length < 7) {
      B.push(displaced);
    }
  }

  club.tactics.lineup = L.slice(0, 11);
  club.tactics.bench = B.filter((id) => id && !club.tactics.lineup.includes(id)).slice(0, 7);
  persist();
}

/** Put player on bench if not in XI; if in XI, swap with first bench. */
export function assignToBench(playerId: string): void {
  const club = getPlayerClub();
  const L = [...club.tactics.lineup];
  const B = [...club.tactics.bench];
  const li = L.indexOf(playerId);
  if (li >= 0) {
    if (B.length === 0) return;
    const fromBench = B.shift()!;
    L[li] = fromBench;
    B.push(playerId);
  } else if (!B.includes(playerId)) {
    if (B.length >= 7) B.pop();
    B.push(playerId);
  }
  club.tactics.lineup = L;
  club.tactics.bench = B.slice(0, 7);
  persist();
}

export function persist(): void {
  if (!state) return;
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  } catch {
    // quota / private mode — ignore
  }
}

export function loadOrCreate(seed = 42): SaveBlob {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as SaveBlob;
      if (parsed?.version === 1 && Array.isArray(parsed.clubs) && parsed.clubs.length === 16) {
        state = parsed;
        return state;
      }
    }
  } catch {
    // fall through to new game
  }
  return newGame(seed);
}

export function newGame(seed = 42): SaveBlob {
  const league = generateLeague(seed);
  state = {
    version: 1,
    playerClubId: league.playerClubId,
    clubs: league.clubs,
    season: league.season,
    tokens: 50,
    vipUntil: 0,
  };
  persist();
  return state;
}

export function sortedTable(): { row: import('../types').TableRow; club: Club }[] {
  const s = getState();
  const rows = [...s.season.table].sort((a, b) => {
    if (b.pts !== a.pts) return b.pts - a.pts;
    const gdA = a.gf - a.ga;
    const gdB = b.gf - b.ga;
    if (gdB !== gdA) return gdB - gdA;
    return b.gf - a.gf;
  });
  return rows.map((row) => ({ row, club: clubById(s.clubs, row.clubId) }));
}

/** Apply post-match deltas from MatchEngine (sibling). */
export function applyMatchResult(
  _report: unknown,
  deltas: {
    homeClubId: string;
    awayClubId: string;
    homeGoals: number;
    awayGoals: number;
    homePts: number;
    awayPts: number;
    homeCashDelta: number;
    awayCashDelta: number;
    formDelta: Record<string, number>;
    fatigueAfter: Record<string, number>;
  },
): void {
  const s = getState();
  const home = clubById(s.clubs, deltas.homeClubId);
  const away = clubById(s.clubs, deltas.awayClubId);

  home.cash = Math.max(0, home.cash + deltas.homeCashDelta);
  away.cash = Math.max(0, away.cash + deltas.awayCashDelta);

  for (const club of [home, away]) {
    for (const p of club.players) {
      if (deltas.formDelta[p.id] != null) {
        p.form = clamp(p.form + deltas.formDelta[p.id], 0, 100);
      }
      if (deltas.fatigueAfter[p.id] != null) {
        p.fatigue = clamp(deltas.fatigueAfter[p.id], 0, 100);
      }
    }
  }

  const bump = (clubId: string, pts: number, gf: number, ga: number) => {
    const row = s.season.table.find((r) => r.clubId === clubId);
    if (!row) return;
    row.played += 1;
    row.pts += pts;
    row.gf += gf;
    row.ga += ga;
    if (pts === 3) row.won += 1;
    else if (pts === 1) row.drawn += 1;
    else row.lost += 1;
  };
  bump(deltas.homeClubId, deltas.homePts, deltas.homeGoals, deltas.awayGoals);
  bump(deltas.awayClubId, deltas.awayPts, deltas.awayGoals, deltas.homeGoals);

  const fx = s.season.fixtures.find(
    (f) =>
      !f.played &&
      f.matchday === s.season.matchday &&
      f.homeId === deltas.homeClubId &&
      f.awayId === deltas.awayClubId,
  );
  if (fx) {
    fx.played = true;
    fx.homeGoals = deltas.homeGoals;
    fx.awayGoals = deltas.awayGoals;
  }

  // Advance matchday when all fixtures that day are done
  const dayLeft = s.season.fixtures.some((f) => f.matchday === s.season.matchday && !f.played);
  if (!dayLeft && s.season.matchday < s.season.matchdaysTotal) {
    s.season.matchday += 1;
  }

  persist();
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}

export function isVip(): boolean {
  return getState().vipUntil > Date.now();
}
