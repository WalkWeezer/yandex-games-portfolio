# Живи Футболом — DESIGN_LLM (исполняемая спецификация)

> **Аудитория:** LLM-агенты (арт, UI, код).  
> **Правило:** код (`src/`) **запрещён**, пока `design_status` ≠ `CONFIRMED`.  
> **GDD:** `docs/DESIGN.md`. При конфликте побеждает этот файл.  
> **Концепт:** `docs/concepts/04-soccer-life.md`.

---

## 0. Мета-контракт

| Поле | Значение |
|------|----------|
| slug | `soccer-life` |
| title_ru | Живи Футболом |
| title_en | Soccer Life |
| engine | Phaser 3 + TypeScript + Vite |
| platform | Яндекс Игры |
| orientation_primary | portrait (720×1280 logical) |
| design_status | `DRAFT` |
| coding_allowed | `false` until `CONFIRMED` |
| concept_ref | `docs/concepts/04-soccer-life.md` |
| key_art | `games/soccer-life/refs/art/key-art.png` |
| replaces | `legends-of-the-pitch` (CANCELLED) |

### 0.1 Формула продукта (не нарушать)

```text
SoccerLife shell + FM-lite tactics/match + live-control USP
```

### 0.2 Запреты скоупа

1. Нет CCG, карт, гачи, autochess, ★-merge, синергий-стаков.  
2. Нет физической симуляции мяча / камеры FIFA.  
3. Нет полного Football Manager (контракты Excel, 50 экранов).  
4. Нет реальных клубов/имён/гербов в MVP.  
5. Нет букмекера / ставок.  
6. Нет realtime PvP в MVP.

---

## 1. Repo layout

```text
games/soccer-life/
├── docs/
│   ├── DESIGN.md
│   ├── DESIGN_LLM.md
│   └── REFS.md
├── prompts/
│   ├── ART_PROMPTS.md
│   ├── SPRITE_ANIM_PROMPTS.md
│   ├── UI_PROMPTS.md
│   ├── LEVEL_PROMPTS.md
│   └── CODE_AGENT_PROMPT.md
├── refs/
│   ├── art/
│   ├── ui/
│   ├── levels/
│   └── sprites/
├── public/assets/{images,atlases,audio,data}/
├── src/                    ← НЕ до CONFIRMED
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── STATUS.md
└── STORE_CHECKLIST.md
```

### 1.1 Naming

| Сущность | Правило | Пример |
|----------|---------|--------|
| Scene key | `SC_{Name}` | `SC_Hub` |
| Events | `EVT_{Domain}_{Action}` | `EVT_Match_Goal` |
| Save | `slf_{snake}` | `slf_club_v1` |
| Asset ID | `{domain}_{name}` | `ui_btn_live_press` |
| Data JSON | kebab-case | `league-clubs.json` |

domains: `ui_`, `bg_`, `pitch_`, `player_`, `club_`, `fx_`, `icon_`

---

## 2. IA — экраны MVP

| Scene | Назначение | CTA |
|-------|------------|-----|
| `SC_Boot` | load + SDK | — |
| `SC_Tutorial` | 1 матч-обучение | Далее |
| `SC_Hub` | Home: следующий матч, таблица, daily | Играть |
| `SC_Squad` | список игроков | Карточка / в состав |
| `SC_Tactics` | формация + инструкции + роли | Сохранить |
| `SC_Match` | таймлайн + live | Live-кнопки |
| `SC_Report` | отчёт матча | В хаб |
| `SC_Club` | здания / трансфер / shop | Купить / апгрейд |
| `SC_Shop` | VIP / tokens / pass / ads-off | IAP |

Корневых вкладок ≤5: Home, Squad, Tactics, Match/Report, Club.

---

## 3. Data model (MVP)

### 3.1 Player

```ts
type Player = {
  id: string;
  name: string;
  pos: "GK"|"CB"|"FB"|"DM"|"CM"|"AM"|"W"|"ST";
  age: number;
  attrs: { pac: number; sht: number; pas: number; def: number; phy: number; men: number }; // 1..20
  form: number;      // 0..100
  fatigue: number;   // 0..100
  role?: RoleId;
  value: number;
};
```

### 3.2 Club

```ts
type Club = {
  id: string;
  name: string;
  colors: [string, string];
  cash: number;
  stadiumLvl: number;
  trainingLvl: number;
  academyLvl: number;
  players: Player[];
  tactics: Tactics;
};
```

### 3.3 Tactics

```ts
type FormationId = "433" | "442" | "352";
type InstrLevel = 0 | 1 | 2; // low med high
type Tactics = {
  formation: FormationId;
  press: InstrLevel;
  width: InstrLevel;
  tempo: InstrLevel;
  risk: InstrLevel;
  lineup: string[]; // 11 player ids
  bench: string[];  // up to 7
};
```

### 3.4 Match event

```ts
type MatchEvent =
  | { t: number; type: "chance"; side: "home"|"away"; xg: number; scorerId?: string; outcome: "goal"|"save"|"miss"|"block" }
  | { t: number; type: "card"|"injury"|"sub"; side: "home"|"away"; playerId: string }
  | { t: number; type: "live"; side: "home"|"away"; action: "instr"|"sub"|"emotion" };
```

---

## 4. Match engine contract

### 4.1 Tick

- Match length: 90 ticks (1 tick ≈ 1 min). UI может ускорять x2/x4.  
- Каждый тик: обновить fatigue; с шансом `pChance` создать момент.

### 4.2 Chance probability (целевая чувственность)

```text
attackPower = line(FWD attrs) * tempoMult * riskMult * formMult
defensePower = line(DEF attrs) * pressMult_opponent * homeMult
pChance ≈ clamp(0.02 .. 0.18, attack/(attack+defense) * base)
xg ≈ f(SHT, DEF_opp, chanceType)
pGoal ≈ xg
```

Инструкции дают **мультипликаторы 0.85–1.20**, не ломают матч одним тапом.

### 4.3 Live actions

| Action | Effect | Cost |
|--------|--------|------|
| Change instruction | set one InstrLevel | 1 live charge |
| Substitution | swap lineup↔bench | 1 live charge |
| Emotion bus/all-out | risk=0 or 2 for 12 ticks | 1 live charge |

Default charges: **3**. VIP: **4**.

### 4.4 Report must answer

1. Счёт + xG.  
2. Лучший игрок.  
3. Три события.  
4. Одна строка совета (`press too low`, `no width`, `stamina collapse`…).

---

## 5. Meta systems

### 5.1 Training (1 plan / day)

Plans: Attack / Defense / Fitness.  
Effect: +form to 3 players OR −fatigue squad (числа в `data/training.json`).

### 5.2 Transfers lite

- Рынок: 8–12 листингов, реролл 1/day free, RV extra.  
- Buy if `cash >= value`. Tokens: sniper bid skip wait (convenience).

### 5.3 Buildings

| Building | Effect per level |
|----------|------------------|
| Training | +training yield |
| Stadium | +match income |
| Academy | +youth soft player раз в N дней |

Max level 5 in MVP.

### 5.4 Season

- 16 clubs, double round-robin truncated **OR** 14 matchdays — выбрать одно в data: default **14 matchdays** (каждый играет каждого почти раз).  
- Points 3/1/0. Table on Hub.  
- Season reset → keep buildings −1 floor soft, keep VIP cosmetics.

---

## 6. Economy & IAP ids

| SKU | Type | Grant |
|-----|------|-------|
| `tokens_100` | IAP | 100 tokens |
| `tokens_550` | IAP | 550 tokens |
| `vip_7` | IAP | VIP 7d |
| `vip_30` | IAP | VIP 30d |
| `pass_season` | IAP | battle pass |
| `ads_off` | IAP | remove interstitial |

RV rewards: `scout_report`, `captain_form`, `daily_x2`.

Soft `cash` never sold 1:1 as pure power; only bundles with tokens OK if cosmetic-weighted.

---

## 7. SDK hooks (Yandex)

- `init` → player auth optional, cloud save `slf_club_v1`.  
- Interstitial: after `SC_Report` confirm / leaving `SC_Club` market (rate-limit).  
- Rewarded: only on explicit buttons.  
- Purchases: consume + restore on boot.  
- Leaderboard: `season_points`.

---

## 8. Art / UI direction

- Palette CSS vars: `--pitch-green`, `--club-navy`, `--ink`, `--accent-amber` (не фиолетовый неон).  
- Hub: герб + next opponent large; no card-game frames.  
- Match: top-down abstract pitch OR event feed + mini pitch; prefer **event feed + scoreboard** for MVP readability.  
- Typography: expressive sports sans (not Inter/Roboto as brand voice in mockups).

---

## 9. Content bank MVP

| Content | Count |
|---------|-------|
| Clubs | 16 |
| Players generated | ~20×16 ≈ 320 |
| Formations | 3 |
| Roles | 6 |
| Instructions | 4 |
| Training plans | 3 |
| Buildings | 3 |

Names: fictional RU/EN pool in `data/names.json`.

---

## 10. Gates (code, after CONFIRMED)

| Gate | Deliverable |
|------|-------------|
| G0 | Vite+Phaser skeleton, STATUS.md |
| G1 | Club/Player data + Hub table + calendar stub |
| G2 | Squad + Tactics UI save |
| G3 | MatchEngine ticks + report + 3 live |
| G4 | Training, transfers, buildings |
| G5 | SDK cloud/ads/IAP VIP, tutorial, STORE_CHECKLIST |

### AC (smoke)

- Start → Hub → set tactics → play match → report → cash changes.  
- Live instruction changes subsequent chance rates.  
- Cloud restore club.  
- No red console; 20 matches vs AI without crash.

---

## 11. Anti-regression vs cancelled project

Если агент предлагает карты, колоду, магазин бойцов, ★-merge, TFT-трейты, 6v6 сетку — **STOP**. Это `legends-of-the-pitch`, проект отменён. Вернуться к формуле §0.1.
