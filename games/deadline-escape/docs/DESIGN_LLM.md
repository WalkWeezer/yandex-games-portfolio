# Работник месяца — DESIGN_LLM (исполняемая спецификация)

> **СТАТУС:** `REVIEW`  
> **⛔ НЕ КОДИРОВАТЬ `src/**`, пока статус ≠ `CONFIRMED`**  
> **SoT feel:** `management/demos/demos-01-02.js` → `FEEL_DEMOS["deadline-escape"]`  
> **Human GDD:** `docs/DESIGN.md` · **STATUS:** `docs/STATUS.md`  
> После CONFIRM этот файл — единственный machine SoT для агентов.

---

## 0. Project Contract

### 0.1 Identity

| Ключ | Значение |
|------|----------|
| `slug` | `deadline-escape` |
| `displayName.ru` | Работник месяца |
| `displayName.en` | Employee of the Month |
| `engine` | Phaser 3.80+ (план) |
| `language` | TypeScript 5.x strict |
| `bundler` | Vite 5.x |
| `platform` | Yandex Games HTML5 |
| `orientation` | **portrait-primary** 720×1280 logical; scale FIT |
| `targetFPS` | 60 |
| `tileSize` | 32×32 |
| `feelDemo` | `management/demos/demos-01-02.js` key `"deadline-escape"` |

### 0.2 Folder layout

```
games/deadline-escape/
  docs/ DESIGN.md DESIGN_LLM.md STATUS.md REFS.md GAP_VS_CHAS_PIK.md
  prompts/ ART_ UI_ SPRITE_ANIM_ LEVEL_ CODE_AGENT_
  refs/ art|ui|levels|sprites/
  archive/2026-07-17-pre-feel-sync/   # legacy — не SoT
  public/assets/{textures,audio,levels}/   # после G0
  src/                                 # ⛔ до CONFIRMED
```

### 0.3 Naming

| Тип | Правило | Пример |
|-----|---------|--------|
| TS | PascalCase scenes/systems | `RunScene.ts`, `GridMove.ts` |
| Assets | `domain_subject_variant` | `char_hero_walk_s`, `boss_hr_idle` |
| SFX keys | как в демке | `step`, `caught`, `promote` |
| Floor IDs | `floor_<n>` | `floor_1` |

### 0.4 Invariants (INV)

| ID | Правило |
|----|---------|
| INV-DE-01 | Portrait 720×1280 logical; no landscape-only MVP |
| INV-DE-02 | **Full office grid** dodge (base 7×9 + props); NOT free-move chase; NOT hide/LOS MVP; NOT «только колонки 1/3/5» |
| INV-DE-03 | Win = survive clock **09:00→18:00** (`totalMin=540`); Fail = contact threat/zone without shield |
| INV-DE-04 | Coffee = **world slow-mo** (scale 0.42, 3s); Badge = **1-hit shield** from floor drop |
| INV-DE-05 | Hit = immediate **body overlap** (player `px/py` ↔ threat fractional pos, `HIT_BODY`); not shared grid cell |
| INV-DE-06 | SDK: `LoadingAPI.ready()`, `GameplayAPI.start/stop` as methods (post-G0) |
| INV-DE-07 | Feel file = `demos-01-02.js` FEEL_DEMOS key — **не** отдельный `deadline-escape.js` |
| INV-DE-08 | No `src/` writes while `designStatus != CONFIRMED` |

---

## 1. Scenes / flow

```
Boot → Menu → Hub ⇄ DailySelect → Run
                      ↕ Pause
                 CaughtRevive → Result → Shop | Hub
```

Wireframe UI inventory: `management/demos/deadline-wireframes.js`.

| Scene | Job | Exit |
|-------|-----|------|
| Boot | splash / SDK init | → Menu |
| Menu | Play, Settings | → Hub |
| Hub | floor grid, Daily card, Shop | → Run / Daily / Shop |
| DailySelect | 1/day mission pick | → Run |
| Run | grid dodge day | → Caught / Result(win) / Pause |
| Pause | resume / quit hub | → Run / Hub |
| CaughtRevive | ЗАСТАВИЛИ + RV / skip | → Run(i-frames) / Result |
| Result | ПОВЫШЕНИЕ or fail stats | → Hub / next floor Run |
| Shop | cosmetics / IAP | → Hub |

**AC:** Daily entry only from Hub card, never forced modal before every floor.

---

## 2. Systems + AC (MVP)

### 2.1 GridMove

- 4-dir; one step per input edge; blocked by non-floor cells.
- Slide duration base `0.095 / floorSpeedMul`.
- Inputs: tap-cell stepToward, swipe, stick latch, WASD latch.

**AC:** cannot enter desk/props; holding key does not auto-repeat without release.

### 2.2 DayClock

- `gameMin += minutesPerSecond * dt * TIME_SCALE` (`18 * 0.5`).
- Phases: Утро/Работа/Аврал/Переработка (см. DESIGN.md §3).
- `gameMin >= 540` → win promote.

**AC:** real day length ≈ 60s ±10% at default pace.

### 2.3 ThreatSpawn / ThreatAI

- Spawn off-map, enter from 4 edges.
- Cap: `3 + floor((floor-1)/15)`.
- Unlock table + patterns: DESIGN.md §5 (must match KINDS in feel demo).
- Dup only `hr`|`client`.
- Fairness: reject spawn if no escape path for player.

**AC:** director ghost moves slower inside obstacles; account drops ОТЧ zones that kill without shield.

### 2.4 Bonuses

| System | Trigger | Effect |
|--------|---------|--------|
| Coffee | approach ally colleague (same cell; not lane-hit) | `worldScale=0.42` for 3s |
| BadgeDrop | colleague with shield walks 1–2 floor cells | pickup on floor |
| Shield | hold badge | next hit → `shield_break`, i-frames ~0.65s |
| Coin | overlap pickup | +1 soft |

Colleague = ally (slow, offer pause, mint ring) — not a threat mob.  
**AC:** coffee does **not** speed player step; badge is **not** invisibility.

### 2.5 FloorProgression

- `gridSizeForFloor`: base 7×9; every 25 floors alternate +col/+row.
- Layout seeded by floor; connected floors.
- On win: `floor++`, new day layout.

### 2.6 MetaSave (prod)

- Persist bestFloor, unlocked floors, coins, dailyClaim date, settings mute.
- Hub floor select; death returns to startFloor (default 1) unless promote chain.

---

## 3. Level grammar

Cell codes: `0` floor · `1` desk 1×1 · `2` wall · `3` plant · `4` cooler · `5`/`6` desk 2×1 (W/E) · `7` window.

```
. = floor / passage
# = wall
W = window
D = desk 1×1
DD = desk 2×1
P = plant
C = cooler
```

**Rules:** perimeter ~80% passages / ~20% wall+window segments (seeded like furniture); props 1–2 cells interior; enemies enter **only from passages** from fog; aisles connected; no soft-lock spawn. Hit = body overlap, not cell equality.

**Forbidden in MVP maps:** hideZones, LOS cones as primary verb, free-move navmesh chase.

Encounter = spawn recipe (kind + edge + pattern + phase pressure), not only tint.

---

## 4. UI copy (RU)

| ID | Text |
|----|------|
| `hud_clock` | `HH:MM` from day clock |
| `caught_title` | ЗАСТАВИЛИ РАБОТАТЬ |
| `promote_title` | ПОВЫШЕНИЕ! |
| `btn_play` | Играть |
| `btn_rv` | Продолжить (реклама) |
| `btn_skip` | В меню |
| `hub_daily` | Daily · побег из планёрки |
| `tut_1` | Ходи по светлым · избегай боссов · доживи до 18:00 |

Tone: office comedy, short, no horror.

---

## 5. Art bible

| Lock | Value |
|------|-------|
| Style | cartoon office satire, bright, meme-readable top-down |
| Palette | carpet `#C8D2E0`, cubicle `#6B7C93`, sticky `#F4D35E`, danger `#E63946`, player `#1D3557`, UI `#E8EEF5`, CTA `#E9C46A` |
| No | horror, gore, purple glow spam, cream+terracotta serif cliché, hide-shimmer as core VFX identity |
| Priority | hero → HR+director → tiles → pickups → other bosses → VFX |
| **ART_STATUS** | `FROZEN_CONCEPTS` — paint-over only; no open-ended regen |
| MVP scope | hero idle+walk+caught; HR idle+walk; other bosses **4-dir only** |

Sprite inventory: `management/demos/deadline-sprites.js`.  
Look SoT: `docs/STYLE_LOCK.md` + `docs/REFS.md` (`art/boss-hr.png`, `art/concept-boss-*`).  
CONFIRM = feel playtest, not perfect roster art.

---

## 6. Audio IDs

SFX MVP: `step`, `coin`, `coffee`, `badge`, `drop`, `shield_break`, `caught`, `promote`, `ui_click`  
Nice: `near_miss`  
BGM: `office_loop` (rate←phase speedMul; slow←coffee)

Lib preview: `management/demos/deadline-sfx-lib.js`.

---

## 7. Asset paths (post-G0 targets)

```
public/assets/textures/keyart/keyart_deadline_escape.png
public/assets/textures/characters/char_hero_*.png
public/assets/textures/enemies/boss_<id>_sheet.png
public/assets/textures/tiles/tile_office_sheet.png
public/assets/textures/items/pu_{coin,coffee,badge}.png
public/assets/textures/ui/ui_kit.png
public/assets/audio/sfx/sfx_*.wav|mp3
public/assets/audio/music/bgm_office_loop.mp3
```

Until G0: only `refs/` + procedural demo audio.

---

## 8. SDK / store (post-CONFIRM)

- `ysdk.features.LoadingAPI.ready()`
- GameplayAPI start/stop on Run enter/exit
- RV on Caught; interstitial after 1–2 runs
- IAP: `remove_ads`, `starter_pack`, `skin_<id>`

---

## 9. Feel + Retention freeze (F2)

### Feel AC

- [ ] Understand dodge in &lt;10s without text wall
- [ ] Day ≈60s; promote readable; fail copy ЗАСТАВИЛИ
- [ ] Walls block; threats from multiple edges
- [ ] Coffee slows world; badge absorbs one hit
- [ ] Restart / next floor &lt;1s feel

### Retention hooks (design)

- [ ] Daily 1/day from Hub
- [ ] Best floor visible
- [ ] Floor unlock progression
- [ ] Cosmetics hook (shop row)

**coding_allowed:** false until human sets `CONFIRMED` in `STATUS.md` / dashboard.

---

## 10. Agent playbook

| Role | Reads | Writes |
|------|-------|--------|
| Art | §5, REFS, ART_PROMPTS | `refs/`, later `public/assets/textures` |
| Sprite | SPRITE_ANIM_PROMPTS | sheets |
| UI | §4, UI_PROMPTS, wireframes | UI kit |
| Level | §3, LEVEL_PROMPTS | layout JSON / ASCII |
| Code | §1–2, CODE_AGENT_PROMPT | `src/` **only if CONFIRMED** |

Orchestrator answers only: **ACCEPT / REWORK / CUT**.
