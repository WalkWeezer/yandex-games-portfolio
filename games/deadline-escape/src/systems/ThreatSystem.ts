import type { KindDef } from "../data/canon";
import { HIT_BODY, KINDS, floorSpeedMul, threatCap, unlockedKinds } from "../data/canon";
import { edgeSpawnOpen, inPlayArea, walkable } from "./GridMap";

export interface Threat {
  id: string;
  kind: KindDef;
  col: number;
  row: number;
  px: number;
  py: number;
  dc: number;
  dr: number;
  frac: number;
  entered: boolean;
  stepT: number;
  dead: boolean;
}

export interface Zone {
  col: number;
  row: number;
  life: number;
}

function mulberry32(a: number) {
  return () => {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function pickSpawnEdge(
  map: number[][],
  border: number,
  rnd: () => number,
): { col: number; row: number; dc: number; dr: number } | null {
  const rows = map.length;
  const cols = map[0].length;
  const edges: { col: number; row: number; dc: number; dr: number }[] = [];
  for (let c = 0; c < cols; c++) {
    if (edgeSpawnOpen(map, border, c, 0)) edges.push({ col: c, row: 0, dc: 0, dr: 1 });
    if (edgeSpawnOpen(map, border, c, rows - 1)) edges.push({ col: c, row: rows - 1, dc: 0, dr: -1 });
  }
  for (let r = 0; r < rows; r++) {
    if (edgeSpawnOpen(map, border, 0, r)) edges.push({ col: 0, row: r, dc: 1, dr: 0 });
    if (edgeSpawnOpen(map, border, cols - 1, r)) edges.push({ col: cols - 1, row: r, dc: -1, dr: 0 });
  }
  if (!edges.length) return null;
  return edges[(rnd() * edges.length) | 0];
}

export function trySpawnThreat(
  map: number[][],
  border: number,
  floor: number,
  existing: Threat[],
  seed: number,
): Threat | null {
  if (existing.filter((t) => !t.dead).length >= threatCap(floor)) return null;
  const rnd = mulberry32(seed);
  const pool = unlockedKinds(floor);
  if (!pool.length) return null;
  // Dup only hr|client
  const candidates = pool.filter((k) => {
    const count = existing.filter((t) => !t.dead && t.kind.id === k.id).length;
    if (k.id === "hr" || k.id === "client") return count < 2;
    return count < 1;
  });
  if (!candidates.length) return null;
  const kind = candidates[(rnd() * candidates.length) | 0];
  const edge = pickSpawnEdge(map, border, rnd);
  if (!edge) return null;
  return {
    id: `${kind.id}_${seed}`,
    kind,
    col: edge.col,
    row: edge.row,
    px: edge.col,
    py: edge.row,
    dc: edge.dc,
    dr: edge.dr,
    frac: 0,
    entered: false,
    stepT: 0,
    dead: false,
  };
}

function stepOk(map: number[][], border: number, cols: number, rows: number, col: number, row: number, ghost: boolean): boolean {
  if (col < 0 || row < 0 || col >= cols || row >= rows) return false;
  if (!inPlayArea(cols, rows, border, col, row)) return false;
  if (ghost) return true;
  return map[row][col] === 0;
}

/** Simple step toward player — pattern flavors without overbuilding. */
export function advanceThreat(
  t: Threat,
  map: number[][],
  border: number,
  playerCol: number,
  playerRow: number,
  dt: number,
  floor: number,
  speedMul: number,
): void {
  if (t.dead) return;
  const rows = map.length;
  const cols = map[0].length;
  const ghost = t.kind.pattern === "ghost";
  const base = 1.6 * speedMul * floorSpeedMul(floor);
  t.stepT += dt * base;

  // Enter from fog into play
  if (!t.entered) {
    if (t.stepT >= 1) {
      t.stepT = 0;
      const nc = t.col + t.dc;
      const nr = t.row + t.dr;
      if (inPlayArea(cols, rows, border, nc, nr) && (ghost || map[nr][nc] === 0)) {
        t.col = nc;
        t.row = nr;
        t.px = nc;
        t.py = nr;
        t.entered = true;
      } else if (edgeSpawnOpen(map, border, nc, nr)) {
        t.col = nc;
        t.row = nr;
      }
    }
    return;
  }

  if (t.stepT < 1) {
    // interpolate
    t.px = t.col;
    t.py = t.row;
    return;
  }
  t.stepT = 0;

  let dc = Math.sign(playerCol - t.col);
  let dr = Math.sign(playerRow - t.row);
  if (t.kind.pattern === "chaos") {
    const dirs = [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ];
    const d = dirs[(Math.random() * 4) | 0];
    dc = d[0];
    dr = d[1];
  } else if (t.kind.pattern === "patrol") {
    if (Math.abs(playerCol - t.col) > Math.abs(playerRow - t.row)) dr = 0;
    else dc = 0;
  } else if (t.kind.pattern === "peek" && Math.random() < 0.35) {
    dc = 0;
    dr = 0;
  }

  const tryDirs = [
    [dc, dr],
    [dc, 0],
    [0, dr],
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ];
  for (const [tdc, tdr] of tryDirs) {
    if (!tdc && !tdr) continue;
    const nc = t.col + tdc;
    const nr = t.row + tdr;
    if (stepOk(map, border, cols, rows, nc, nr, ghost)) {
      t.col = nc;
      t.row = nr;
      t.px = nc;
      t.py = nr;
      t.dc = tdc;
      t.dr = tdr;
      return;
    }
  }
}

export function threatHitsPlayer(t: Threat, px: number, py: number): boolean {
  if (t.dead || !t.entered) return false;
  const r = HIT_BODY * (t.kind.pattern === "wide" ? 1.35 : 1);
  return Math.abs(t.px - px) < r && Math.abs(t.py - py) < r;
}

export function kindById(id: string): KindDef {
  return KINDS.find((k) => k.id === id) || KINDS[0];
}

export { walkable };
