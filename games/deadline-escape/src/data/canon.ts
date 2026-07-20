/** Feel-locked canon — DESIGN.md §3 / DESIGN_LLM. Do not invent numbers. */
export const LOGICAL_W = 720;
export const LOGICAL_H = 1280;
export const TILE = 32;

export const TIME_SCALE = 0.5;
export const MINUTES_PER_SECOND = 18;
export const TOTAL_MIN = 540; // 09:00 → 18:00
export const MOVE_DUR = 0.095;
export const HIT_BODY = 0.36;
export const FOG_BORDER = 1;
export const START_IFRAMES = 1.45;
export const COFFEE_SCALE = 0.42;
export const COFFEE_SEC = 3.0;
export const SHIELD_IFRAMES = 0.65;

export const PHASES = [
  { id: "morning", label: "Утро", at: 0, speedMul: 1.0, spawnMul: 1.45 },
  { id: "work", label: "Работа", at: 80, speedMul: 1.08, spawnMul: 1.12 },
  { id: "crunch", label: "Аврал", at: 280, speedMul: 1.16, spawnMul: 0.92 },
  { id: "ot", label: "Переработка", at: 430, speedMul: 1.25, spawnMul: 0.78 },
] as const;

export type KindId =
  | "hr" | "director" | "looker" | "urgent" | "meeting" | "guard"
  | "intern" | "account" | "kpi" | "client" | "it" | "secretary";

export interface KindDef {
  id: KindId;
  label: string;
  pattern: string;
  color: number;
  from: number;
}

/** DESIGN.md §5 + feel KINDS colors */
export const KINDS: KindDef[] = [
  { id: "hr", label: "HR", pattern: "weave", color: 0xf472b6, from: 1 },
  { id: "director", label: "Дир", pattern: "ghost", color: 0xef4444, from: 3 },
  { id: "looker", label: "ГЛЯД", pattern: "peek", color: 0x4338ca, from: 5 },
  { id: "urgent", label: "СРОЧ", pattern: "dash", color: 0xea580c, from: 9 },
  { id: "meeting", label: "ВСТР", pattern: "hold", color: 0x38bdf8, from: 13 },
  { id: "guard", label: "ОХР", pattern: "patrol", color: 0x64748b, from: 17 },
  { id: "intern", label: "СТАЖ", pattern: "chaos", color: 0xa3e635, from: 21 },
  { id: "account", label: "БУХ", pattern: "report", color: 0x0d9488, from: 25 },
  { id: "kpi", label: "KPI", pattern: "hunt", color: 0xdc2626, from: 29 },
  { id: "client", label: "КЛИ", pattern: "pincer", color: 0xeab308, from: 33 },
  { id: "it", label: "IT", pattern: "blink", color: 0x4ade80, from: 37 },
  { id: "secretary", label: "СЕКР", pattern: "wide", color: 0xc084fc, from: 41 },
];

/** Cell codes — DESIGN.md §4 */
export const CELL = {
  FLOOR: 0,
  DESK: 1,
  WALL: 2,
  PLANT: 3,
  COOLER: 4,
  DESK2_W: 5,
  DESK2_E: 6,
  WINDOW: 7,
} as const;

export const PALETTE = {
  carpet: 0xc8d2e0,
  carpetAlt: 0xb8c4d4,
  desk: 0x6b7c93,
  wall: 0x4a5568,
  window: 0x7dd3fc,
  plant: 0x22c55e,
  cooler: 0x38bdf8,
  fog: 0x94a3b8,
  player: 0x1d3557,
  ally: 0x2a9d8f,
  coin: 0xe9c46a,
  coffee: 0xf4d35e,
  badge: 0x7dd3fc,
  danger: 0xe63946,
  uiPanel: 0xe8eef5,
  uiCta: 0xe9c46a,
  uiInk: 0x1d3557,
  uiMuted: 0x5b6b82,
} as const;

export const COPY = {
  brand: "РАБОТНИК МЕСЯЦА",
  play: "Играть",
  settings: "Настройки",
  shop: "Магазин",
  toWork: "На работу",
  toHub: "В хаб",
  caught: "ЗАСТАВИЛИ РАБОТАТЬ",
  promote: "ПОВЫШЕНИЕ!",
  failTitle: "Смена сорвана",
  rv: "Продолжить (реклама)",
  skip: "В меню",
  resume: "Продолжить",
  pause: "ПАУЗА",
  nextFloor: "Следующий этаж",
  again: "Ещё раз",
  daily: "Daily · побег из планёрки",
  tut: "Ходи по светлым · избегай боссов · доживи до 18:00",
  placeholder: "заглушка",
} as const;

export function phaseOf(gameMin: number): (typeof PHASES)[number] {
  let p: (typeof PHASES)[number] = PHASES[0];
  for (const x of PHASES) if (gameMin >= x.at) p = x;
  return p;
}

export function clockOf(gameMin: number): string {
  const total = 9 * 60 + Math.min(TOTAL_MIN, Math.floor(gameMin));
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function floorSpeedMul(floor: number): number {
  return 1 + (Math.max(1, floor) - 1) * 0.01;
}

export function threatCap(floor: number): number {
  return 3 + Math.floor((Math.max(1, floor) - 1) / 15);
}

export function unlockedKinds(floor: number): KindDef[] {
  return KINDS.filter((k) => floor >= k.from);
}
