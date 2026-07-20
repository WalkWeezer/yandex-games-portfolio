import { CELL, FOG_BORDER } from "../data/canon";

export interface GridSize {
  playCols: number;
  playRows: number;
  border: number;
  cols: number;
  rows: number;
}

export function gridSizeForFloor(floor: number): GridSize {
  const expansions = Math.max(0, Math.floor(floor / 25));
  let playCols = 5;
  let playRows = 7;
  for (let i = 0; i < expansions; i++) {
    if (i % 2 === 0) playCols += 1;
    else playRows += 1;
  }
  const border = FOG_BORDER;
  return {
    playCols,
    playRows,
    border,
    cols: playCols + border * 2,
    rows: playRows + border * 2,
  };
}

function floorRng(floor: number): () => number {
  let s = (floor * 1103515245 + 12345) >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return (s >>> 0) / 0xffffffff;
  };
}

function mapConnected(map: number[][], b: number): boolean {
  const rows = map.length;
  const cols = map[0].length;
  let start: { c: number; r: number } | null = null;
  for (let r = b; r < rows - b && !start; r++) {
    for (let c = b; c < cols - b; c++) {
      if (map[r][c] === 0) {
        start = { c, r };
        break;
      }
    }
  }
  if (!start) return false;
  const seen = new Set<string>();
  const q = [start];
  seen.add(`${start.c},${start.r}`);
  let n = 0;
  while (q.length) {
    const cur = q.pop()!;
    n += 1;
    for (const [dc, dr] of [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ]) {
      const c = cur.c + dc;
      const r = cur.r + dr;
      if (c < b || r < b || c >= cols - b || r >= rows - b) continue;
      if (map[r][c] !== 0) continue;
      const k = `${c},${r}`;
      if (seen.has(k)) continue;
      seen.add(k);
      q.push({ c, r });
    }
  }
  let floors = 0;
  for (let r = b; r < rows - b; r++) {
    for (let c = b; c < cols - b; c++) if (map[r][c] === 0) floors += 1;
  }
  return n === floors && floors > 0;
}

function isPerimeter(c: number, r: number, b: number, cols: number, rows: number): boolean {
  return c === b || r === b || c === cols - b - 1 || r === rows - b - 1;
}

function placeFogFrame(map: number[][], b: number, rnd: () => number): void {
  const rows = map.length;
  const cols = map[0].length;
  // Fog band: mostly open transit, sprinkle walls/windows on edges
  for (let c = 0; c < cols; c++) {
    for (const r of [0, rows - 1]) {
      if (rnd() < 0.28) map[r][c] = rnd() < 0.55 ? CELL.WALL : CELL.WINDOW;
      else map[r][c] = CELL.FLOOR;
    }
  }
  for (let r = 1; r < rows - 1; r++) {
    for (const c of [0, cols - 1]) {
      if (rnd() < 0.22) map[r][c] = CELL.WALL;
      else map[r][c] = CELL.FLOOR;
    }
  }
  // Keep mid-edge openings for spawn
  const midC = (cols / 2) | 0;
  const midR = (rows / 2) | 0;
  map[0][midC] = 0;
  map[rows - 1][midC] = 0;
  map[midR][0] = 0;
  map[midR][cols - 1] = 0;
  void b;
}

export function buildMap(floor: number, grid: GridSize): number[][] {
  const { cols, rows, border: b, playCols, playRows } = grid;
  const rnd = floorRng(floor);
  const map = Array.from({ length: rows }, () => Array.from({ length: cols }, () => 0));
  placeFogFrame(map, b, rnd);

  const desk2 = 1 + (floor > 10 ? 1 : 0);
  const desk1 = 2 + (floor > 5 ? 1 : 0);
  const props: number[] = [];
  for (let i = 0; i < desk2; i++) props.push(CELL.DESK2_W);
  for (let i = 0; i < desk1; i++) props.push(CELL.DESK);
  if (rnd() < 0.8) props.push(CELL.PLANT);
  if (rnd() < 0.7) props.push(CELL.COOLER);

  const candidates: { c: number; r: number }[] = [];
  for (let r = b + 1; r < rows - b - 1; r++) {
    for (let c = b + 1; c < cols - b - 1; c++) candidates.push({ c, r });
  }
  for (let i = candidates.length - 1; i > 0; i--) {
    const j = (rnd() * (i + 1)) | 0;
    [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
  }

  for (const kind of props) {
    for (const cell of candidates) {
      if (kind === CELL.DESK2_W) {
        if (cell.c + 1 >= cols - b) continue;
        if (map[cell.r][cell.c] !== 0 || map[cell.r][cell.c + 1] !== 0) continue;
        if (isPerimeter(cell.c, cell.r, b, cols, rows) || isPerimeter(cell.c + 1, cell.r, b, cols, rows)) continue;
        map[cell.r][cell.c] = CELL.DESK2_W;
        map[cell.r][cell.c + 1] = CELL.DESK2_E;
        if (!mapConnected(map, b)) {
          map[cell.r][cell.c] = 0;
          map[cell.r][cell.c + 1] = 0;
          continue;
        }
        break;
      }
      if (map[cell.r][cell.c] !== 0) continue;
      if (isPerimeter(cell.c, cell.r, b, cols, rows)) continue;
      map[cell.r][cell.c] = kind;
      if (!mapConnected(map, b)) {
        map[cell.r][cell.c] = 0;
        continue;
      }
      break;
    }
  }

  // Clear entry neighbors
  for (let c = b; c < cols - b; c++) {
    if (map[b][c] === 0) map[b][c] = 0;
    if (map[rows - b - 1][c] === 0) map[rows - b - 1][c] = 0;
  }

  if (!mapConnected(map, b)) {
    for (let r = b; r < rows - b; r++) {
      for (let c = b; c < cols - b; c++) map[r][c] = 0;
    }
  }
  void playCols;
  void playRows;
  return map;
}

export function findStart(map: number[][], border: number): { col: number; row: number } {
  const rows = map.length;
  const cols = map[0].length;
  const b = border;
  for (let r = rows - b - 1; r >= b; r--) {
    const c = (cols / 2) | 0;
    if (map[r][c] === 0) return { col: c, row: r };
  }
  for (let r = b; r < rows - b; r++) {
    for (let c = b; c < cols - b; c++) {
      if (map[r][c] === 0) return { col: c, row: r };
    }
  }
  return { col: b + 2, row: b + 4 };
}

export function inPlayArea(cols: number, rows: number, border: number, col: number, row: number): boolean {
  const b = border;
  return col >= b && col < cols - b && row >= b && row < rows - b;
}

export function walkable(map: number[][], border: number, col: number, row: number): boolean {
  const rows = map.length;
  const cols = map[0].length;
  if (row < 0 || col < 0 || row >= rows || col >= cols) return false;
  if (!inPlayArea(cols, rows, border, col, row)) return false;
  return map[row][col] === 0;
}

export function edgeSpawnOpen(map: number[][], border: number, col: number, row: number): boolean {
  const rows = map.length;
  const cols = map[0].length;
  if (col < 0 || row < 0 || col >= cols || row >= rows) return false;
  const b = border;
  const fog = col < b || row < b || col >= cols - b || row >= rows - b;
  return fog && map[row][col] === 0;
}
