# Работник месяца — Sprite Pipeline v1

**Цель:** единый стиль + анимации без «каши» из независимых генов.  
**SoT motion:** [Slynyrd Pixelblog 55](https://www.slynyrd.com/blog/2025/3/24/pixelblog-55-top-down-character-animation) + `refs/sprites/rig/`.  
**SoT look:** этот документ + `STYLE_LOCK.md` + утверждённый **seed**.  
**Не писать `src/`** до `CONFIRMED`.

---

## Закон пайплайна (не нарушать)

1. **Сначала якорь, потом движение.** Новый look/анимация только от утверждённого seed — не «с нуля» каждый кадр.  
2. **Один персонаж = один body.** Idle и walk/attack — один силуэт, палитра, камера. Если walk «другой человек» — reject, не compose-франкенштейн.  
3. **Один strip за раз.** Генерируем горизонтальную полосу (или I2V→кадры), не 6 независимых PNG.  
4. **Normalize обязателен.** Общий `target_body_h`, feet baseline, torso X — до демо.  
5. **GIF QA до интеграции.** Нет GIF / fail QA → в демку не кладём.  
6. **Запрещено чинить стиль скриптом** (warp ног, graft торса, recolor волос «чтобы сошлось»). Скрипт только: chroma, slice, normalize, mirror W, opposite-B если authored B = A.

---

## Фазы (с нуля для визуала)

```text
P0 Style Bible     → камера, палитра, line weight, пропорции (игра)
P1 Character seed  → 1 кадр idle_s (или turnaround) APPROVED
P2 Turnaround      → S E N W от seed (один проход)
P3 Motion strips   → walk / idle-breathe / attack… от seed+turnaround
P4 Normalize+GIF   → frames, sheets, QA gate
P5 Demo wire       → cache-bust, sprites tab
P6 Freeze          → персонаж в STYLE_LOCK; дальше только paint-over
```

Roster: **сначала ГГ (style carrier)**, потом HR, директор, остальные 4-dir.

---

## P0 — Style Bible (игра)

| Параметр | Канон |
|----------|--------|
| Камера | top-down 3/4 (Chrono Trigger / Slynyrd), не портрет, не extreme bird-eye |
| Пропорции | читаемый «game chibi»: крупная голова, короткие ноги, силуэт на 64–128px |
| Шейдинг | cel / soft cel, чёткие контуры, без фотореала |
| Фон гена | pure `#FF00FF` → chroma → RGBA |
| Якорь стиля | `refs/art/style-seed-hero.png` (= idle_s ГГ после export) |
| Палитра офиса | яркие accent-цвета ролей (ГГ blue, HR hot-pink, Director red…) на нейтральном полу |

**Stable prompt block** (копировать во все ген-запросы; менять только Variable):

```text
[STABLE]
Top-down 3/4 cartoon office game sprite, same camera and proportions as style-seed-hero,
cel shading, clean dark outlines, readable silhouette at small size,
full body uncropped, pure magenta #FF00FF background, no text, no ground shadow, no UI
```

```text
[VARIABLE — only one per run]
identity: <who>
action strip: <idle turnaround | walk S 6f | walk E 6f | …>
```

---

## P1 — Character seed

1. Сделать / выбрать **один** кадр: обычно `idle_s`, полный силуэт.  
2. Экспорт: `refs/art/seed-<id>.png` + chroma-safe копия.  
3. Человек говорит **APPROVED** (или reject → один paint-over, не карусель).  
4. Пока seed не APPROVED — анимации не генерируем.

ГГ seed: `refs/art/style-seed-hero.png` (он же style carrier для всей игры).

---

## P2 — Turnaround

От seed, **один** шит 4 фигуры L→R: **S, E, N, W**.

- E смотрит вправо, W влево  
- Асимметрия (планшет, сумка) на **одной** стороне тела во всех ракурсах  
- Полные силуэты, без crop по краю клетки  

Инструмент: reference = seed + style-seed-hero.  
Rebuild: `rebuild_*` / `build_deadline_sprites` → `frames/<id>/idle_{s,e,n,w}.png`.

---

## P3 — Motion strips

| Strip | Кадры | Правило |
|-------|-------|---------|
| walk S/E/N | 6 (Slynyrd A0–2 + B3–5) | от seed/turnaround того же body; W = mirror E |
| idle breathe | 4 (опц.) | hold extremities; или hold idle |
| attack / special | отдельно | только если в MVP; тот же seed |

Предпочтительно:

1. **Image-edit / I2V от seed** → полоса кадров, или  
2. **ControlNet pose** + тот же identity (если есть Comfy),  

**Нельзя:** новый txt2img «HR walking» без reference seed.

Opposite limbs: если B≈A на S/N — `opposite_keep_upper` (ноги flip, верх стабилен). Не полный H-flip персонажа с пропом.

---

## P4 — Normalize + GIF QA

```bash
# пример HR; у каждого персонажа свой rebuild
python management/tools/rebuild_hr_sprites.py
python management/tools/qa_hr_sprites.py   # exit 1 = стоп
```

Общие проверки (все персонажи):

- [ ] idle не обрезан по canvas  
- [ ] idle↔walk: height ±8px, width не «другой человек»  
- [ ] волосы/палитра не съехали (нет ложного tint)  
- [ ] E/W ориентация верная  
- [ ] проп не телепортируется на half-stride B  
- [ ] GIF walk/idle читается в движении  

Fail → **reject strip**, не «подкрутить warp».

---

## P5 — Demo wire

- Кадры в `refs/sprites/frames/…`  
- Cache-bust в `management/demos/demos-01-02.js`  
- Превью в `deadline-sprites.js`  
- `python management/tools/sync-deadline-docs-bundle.py` после правок md  

---

## P6 — Freeze

После APPROVED на seed+strips: строка в `STYLE_LOCK.md`, `ART_STATUS` для id = frozen.  
Дальше только paint-over по SoT. Разморозка: явная фраза «разморозить &lt;id&gt;».

---

## Очередь (старт с нуля)

| # | ID | Scope сейчас |
|---|-----|----------------|
| 0 | **style / hero** | P0–P1: утвердить style-seed-hero; затем QA walk ГГ под пайплайн |
| 1 | hr | **P2 APPROVED** (`seed-hr` + turnaround) → **P3 walk** того же body |
| 2 | director | 4-dir (+ walk later) |
| 3 | looker / meeting / kpi / it | concepts → 4-dir |
| 4 | rest bosses | 4-dir only |
| 5 | colleague / tiles / pickups | после героя стабилен |

---

## Анти-паттерны (уже обожглись)

| Не делать | Почему |
|-----------|--------|
| Отдельный gen idle + отдельный gen walk | разный body |
| Graft / warp ног от idle | франкенштейн |
| Recolor «под концепт» по всему кадру | розовые волосы и т.п. |
| Бесконечный regen без seed APPROVED | карусель |
| Ping-pong playback 0…5…0 на Slynyrd 6f | ломает шаг |

---

## Инструменты репо

| Tool | Role |
|------|------|
| `build_deadline_sprites.py` | chroma → frames, normalize |
| `compose_hero_walk.py` | walk ГГ от contacts/rows |
| `rebuild_hr_sprites.py` | idle+walk HR от chroma strips |
| `qa_hr_sprites.py` | QA gate (расширять → `qa_<id>_sprites.py`) |
| `refs/sprites/rig/` | Slynyrd pose templates |

---

## Статус пайплайна

| Поле | Значение |
|------|----------|
| **pipeline** | `v1` (2026-07-18) |
| **phase** | **P1** style-seed ГГ (сайт) · **HR = P2 APPROVED** → next **P3 walk** |
| **next human gate** | кнопка **APPROVED** на style-seed (Спрайты); HR walk strips от `seed-hr` |
| **marker** | `refs/art/style-seed-hero.APPROVED.json` · `refs/art/seed-hr.APPROVED.json` |
| **archive** | `archive/2026-07-18-pipeline-v1-reset/` — старые концепты/HR/боссы, не SoT |
