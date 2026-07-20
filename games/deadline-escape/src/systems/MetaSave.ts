const KEY = "deadline-escape-meta-v1";

export interface MetaSave {
  coins: number;
  bestFloor: number;
  floor: number;
  unlocked: number;
  mute: boolean;
  dailyClaimed: boolean;
  dailyDate: string;
  runsSinceInterstitial: number;
  removeAds: boolean;
  tutSeen: boolean;
}

export function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

export function defaultMeta(): MetaSave {
  return {
    coins: 0,
    bestFloor: 1,
    floor: 1,
    unlocked: 1,
    mute: false,
    dailyClaimed: false,
    dailyDate: "",
    runsSinceInterstitial: 0,
    removeAds: false,
    tutSeen: false,
  };
}

export function loadMeta(): MetaSave {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultMeta();
    const parsed = { ...defaultMeta(), ...JSON.parse(raw) } as MetaSave;
    if (parsed.dailyDate !== todayKey()) {
      parsed.dailyClaimed = false;
      parsed.dailyDate = todayKey();
    }
    return parsed;
  } catch {
    return defaultMeta();
  }
}

export function saveMeta(meta: MetaSave): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(meta));
  } catch {
    /* ignore */
  }
}
