# Работник месяца — DESIGN (GDD)

> **Статус:** `REVIEW` · slug `deadline-escape` · EN: Employee of the Month  
> **SoT feel:** `management/demos/demos-01-02.js` → `FEEL_DEMOS["deadline-escape"]`  
> **Не кодировать** `src/`, пока статус ≠ `CONFIRMED` (см. `STATUS.md`).  
> Архив старого пакета: `archive/2026-07-17-pre-feel-sync/`.

---

## 1. Pitch

Офисный **top-down dodge на сетке**: доживи рабочий день **09:00→18:00**, уворачиваясь от начальства, которое заходит со всех сторон. Юмор корпоративного абсурда, короткие portrait-сессии для Яндекс Игр.

**Core fantasy:** «ещё один день — и повышение на этаж».  
**Не MVP:** free-move chase, hide/LOS/stealth, endless score-runner без дня.

---

## 2. Core loop

```
Hub (этаж / Daily) → Run
  → ходи по светлым клеткам ↑↓←→
  → боссы с краёв карты
  → 18:00 = ПОВЫШЕНИЕ (этаж+1)
  → удар = ЗАСТАВИЛИ РАБОТАТЬ → RV / Result → Hub
```

| | |
|--|--|
| **Win** | `gameMin ≥ 540` (часы 09→18) → баннер **ПОВЫШЕНИЕ!** → `floor += 1` |
| **Fail** | касание угрозы / зоны ОТЧ без щита → **ЗАСТАВИЛИ РАБОТАТЬ** |
| **Soft** | монеты с пола; мета: best floor, shop, daily |

---

## 3. Locked feel numbers

Источник: feel-демка. Менять только через re-freeze F2.

| Параметр | Значение |
|----------|----------|
| Ориентация | Portrait-primary (логич. 720×1280; демо 360×640) |
| `TIME_SCALE` | **0.5** |
| `minutesPerSecond` | **18** |
| `totalMin` | **540** → реальный день **≈60 с** |
| Базовый шаг | **0.095 с** slide ease-out |
| Скорость/этаж | **+1%** игроку и мобам: `1 + (floor−1)×0.01` |
| Старт i-frames | **~1.45–1.5 с** |
| Сетка база | **7×9**; рост: каждые **25** этажей +1 col **или** +1 row (по очереди) |
| Лимит мобов | `3 + ⌊(floor−1)/15⌋` |
| Дубли kinds | только `hr`, `client`; остальные max 1 на поле |

### Фазы дня

| Фаза | `gameMin` | `speedMul` | `spawnMul` |
|------|-----------|------------|------------|
| Утро | &lt; 80 | 1.00 | 1.45 |
| Работа | &lt; 280 | 1.08 | 1.12 |
| Аврал | &lt; 430 | 1.16 | 0.92 |
| Переработка | иначе | **1.25** | 0.78 |

---

## 4. Пространство и ввод

- Клетки: `0` пол · `1` стол 1×1 · `2` стена · `3` растение · `4` кулер · `5`/`6` стол 2×1 (запад/восток) · `7` окно.
- Play-зона база **7×9** (+рост); с каждой стороны всегда **+1** клетка **полосы тумана**.
- Игрок ходит только по play-полу; полоса тумана, пропы, стены и окна **непроходимы**.
- **Туман войны:** сильный градиент на полосе (снаружи ≈чёрный → к play alpha 0). Рисуется поверх сущностей — спавн читается силуэтом, «сюда нельзя» очевидно.
- **Стены/окна:** декоративные препятствия на полосе тумана (каркас офиса как в концепте); seed как у мебели; большая часть полосы открыта под спавн. Окна чаще на севере.
- Мобы входят из открытых клеток тумана; директор (`ghost`) может лезть сквозь препятствия (~×0.5 скорости).
- **Коллизия с мобом:** пересечение тел (непрерывные `px/py` игрока и позиция моба + `HIT_BODY`), **не** «общая клетка сетки».
- Layout детерминирован от этажа; граф play связный; спавн отвергается без пути побега (`hasEscape`).

| Ввод | Поведение |
|------|-----------|
| Mobile | тап по клетке / свайп / стик → **один шаг** на соседнюю ходимую |
| Desktop | WASD / стрелки → один шаг на нажатие (latch) |
| Tutorial | «ходи по светлым, избегай боссов, доживи до вечера» |

---

## 5. Боссы (12 kinds)

| id | с этажа | pattern | label | суть |
|----|---------|---------|-------|------|
| hr | 1 | weave | HR | обходит препятствия (BFS) |
| director | 3 | ghost | Дир | сквозь столы/пропы, медленнее внутри |
| looker | 5 | peek | ГЛЯД | зашёл → пауза → ушёл |
| urgent | 9 | dash | СРОЧ | рывок по линии |
| meeting | 13 | hold | ВСТР | удерживает клетку/зону |
| guard | 17 | patrol | ОХР | патруль коридора |
| intern | 21 | chaos | СТАЖ | хаотичные шаги |
| account | 25 | report | БУХ | зоны **ОТЧ** (урон без щита) |
| kpi | 29 | hunt | KPI | тянется к игроку |
| client | 33 | pincer | КЛИ | пара с флангов (дубли ок) |
| it | 37 | blink | IT | быстрый smooth dash на 2 клетки |
| secretary | 41 | wide | СЕКР | hitbox шире (2 клетки) |

---

## 6. Бонусы MVP

| ID | Как получить | Эффект |
|----|--------------|--------|
| **coffee** | подойти к **коллеге-союзнику** (клетка, не lane-hit) | world **slow-mo** `0.42`, **3.0 с** (не ускорение шага игрока) |
| **badge / shield** | коллега роняет на пол через 1–2 шага → подбор | **1 удар** поглощается (`shield_break`) |
| **coin** | пикап с пола | soft currency |

Коллега — друг (медленный, пауза-предложение, ally-маркер), не опасный моб.

---

## 7. Мета и экраны

Wireframe SoT: `management/demos/deadline-wireframes.js`.

```
boot → menu → hub → (daily) → run HUD ↔ pause
                 ↘ caught/RV → result → shop / hub
```

- **Hub:** сетка этажей + карточка **Daily** (1/день). Daily **не** модалка перед каждым этажом.
- **Caught:** «ЗАСТАВИЛИ РАБОТАТЬ» + RV / пропуск → Result.
- **Result:** повышение vs fail; следующий этаж / хаб.
- Retention: daily «побег из планёрки», рекорд этажа, unlock этажей, скины, streak.

Монетизация (после CONFIRM): RV revive, interstitial после 1–2 ранов, IAP remove ads / starter / skins.

---

## 8. Арт-направление

- Яркая **офисная сатира**, flat cartoon, читаемые силуэты top-down 32×32.
- Палитра: серо-голубой ковролин, кубиклы, жёлтые sticky, красные «СРОЧНО»; не horror, не purple-glow spam.
- UI: cool gray-blue панели, sticky-yellow CTA.
- Инвентарь кадров: `management/demos/deadline-sprites.js` + `prompts/SPRITE_ANIM_PROMPTS.md`.
- Style/pose lock: `docs/STYLE_LOCK.md` + `refs/sprites/rig/`.
- Vibe refs: `refs/art|sprites|ui|levels/` (см. `REFS.md`).

### Art freeze + MVP scope (`ART_STATUS = FROZEN_CONCEPTS`)

Стоп gen-loop. Look SoT — концепты в `refs/art/`; production = paint-over, не «ещё один промпт».

| Scope | Содержание |
|-------|------------|
| ГГ | idle + walk 6f + caught |
| HR | idle 4-dir + walk 6×4, **без special** (reart: `boss-hr.png` + камера ГГ) |
| 11 боссов | **4-dir only** до отдельного OK |
| Коллега | 4-dir turnaround |
| Пикапы | `pu_coin`, `pu_coffee`, `pu_badge` |
| Env-тайлы (feel) | см. ниже — **необходимые спрайты** |

### Необходимые env-спрайты (feel / MVP)

| Файл | Клетка / роль | Статус |
|------|----------------|--------|
| `frames/tile_floor_a.png` | пол A | scaffolding |
| `frames/tile_floor_b.png` | пол B | scaffolding |
| `frames/tile_desk.png` | `1` стол 1×1 | scaffolding |
| `frames/tile_desk2.png` | `5`/`6` стол 2×1 | scaffolding |
| `frames/tile_plant.png` | `3` растение | scaffolding |
| `frames/tile_cooler.png` | `4` кулер | scaffolding |
| `frames/tile_fog.png` | туман / FoW текстура | scaffolding |
| `frames/tile_wall_{n,s,e,w}.png` | `2` стена: на всю ширину/высоту, **вплотную к внешнему краю** | **есть** |
| `frames/tile_window_{n,s,e,w}.png` | `7` окно, та же геометрия | **есть** |
| `frames/tile_cabinet.png` | `8` шкаф 1×1 у стены (fog) | **есть** |
| `frames/tile_printer.png` | `9` принтер 1×1 у стены | **есть** |
| `frames/tile_trash.png` | `10` урна 1×1 у стены | **есть** |

- `n`/`s` — горизонтальная полоса (юг = вплотную **снизу** клетки)  
- `w`/`e` — **боковые** спрайты (вплотную слева/справа)  
- У стен на кольце тумана — **1×1** пропы (`3`/`4`/`8`/`9`/`10`), не шире клетки; ≥2 открытых спавна на стороне  
- Пока **без углов**. Сборка: `python management/tools/build_border_tiles.py` · `build_border_props.py`  
Концепт-якорь: `refs/levels/layout-feel.png`.

**CONFIRM дизайна** = human playtest feel на телефоне, не идеальный roster арта.

---

## 9. Аудио

Процедурный MVP в демке (`DEADLINE_SFX`):

| Ключ | Когда |
|------|-------|
| `step` | шаг |
| `coin` / `coffee` / `badge` / `drop` | пикапы / падение бейджа |
| `shield_break` / `caught` / `promote` | щит / смерть / повышение |
| `near_miss` | босс близко по телу (не по клетке) |
| `ui_click` | UI |
| BGM `office_loop` | луп в ране; rate от фазы; slow на кофе |

---

## 10. Gate

| Gate | Lock |
|------|------|
| F0 | vector (этот документ §1–2) |
| F1 | feel demo на дашборде |
| F2 | `DESIGN_LLM` Feel+Retention freeze + human **CONFIRMED** |
| G0+ | bootstrap `src/` |

Методология: `docs/METHODOLOGY.md`. Машинный контракт: `DESIGN_LLM.md`. Gap: `GAP_VS_CHAS_PIK.md`.
