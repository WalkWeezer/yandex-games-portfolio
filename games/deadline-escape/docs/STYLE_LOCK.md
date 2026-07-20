# Работник месяца — STYLE LOCK

**SoT pipeline:** [`SPRITE_PIPELINE.md`](./SPRITE_PIPELINE.md) (seed → strip → normalize → GIF QA).  
**SoT look:** `refs/art/style-seed-hero.png` + одобренные шиты.  
**SoT motion:** [Slynyrd Pixelblog 55](https://www.slynyrd.com/blog/2025/3/24/pixelblog-55-top-down-character-animation) + `refs/sprites/rig/`.  
**Не писать `src/`** до `CONFIRMED`.

## ART_STATUS = PIPELINE_V1 (reset 2026-07-18)

Визуал ведём **с нуля по пайплайну**. Старые независимые gens/warp не SoT.  
Очередь: **P0/P1 style+hero** → HR → director → rest.  
Разморозка id: явная фраза «разморозить &lt;id&gt;». Пока seed не APPROVED — только P0/P1.

### Look SoT

| Что | SoT | Phase |
|-----|-----|-------|
| **Style / ГГ** | `refs/art/style-seed-hero.png` ← `frames/char_hero/idle_s.png` | **P1 — кнопка APPROVED на сайте (Спрайты)** |
| ГГ sheets | `char_hero_idle_sheet.png` / walk (после QA под pipeline) | P1–P4 |
| **HR** | `refs/art/seed-hr.png` + `hr-turnaround.png` · marker `seed-hr.APPROVED.json` | **P2 APPROVED** (idle 4-dir; next P3 walk) |
| ГЛЯД / ВСТР / KPI / IT | `refs/art/concept-boss-*.png` | после HR walk |
| Прочие боссы | текущие sheets до своего P1 | later |

### MVP art scope

| Asset | Scope |
|-------|--------|
| ГГ | idle + walk 6f + caught |
| HR | idle 4-dir + walk 6×4 (**без special**); один body idle↔walk; W=mirror E |
| 11 других боссов | **4-dir turnaround only** (без walk) |
| Коллега / пикапы | 4-dir · `pu_coin` / `pu_coffee` / `pu_badge` |
| Env-тайлы | floor/desk/plant/cooler/fog + **wall/window Option A** (mid/L/U/stub) |

## Style lock (look)

| File | Role |
|------|------|
| `refs/sprites/char_hero_idle_sheet.png` | канон пропорций / лица / одежды / top-down 2.5D |
| `refs/sprites/char_hero_walk_sheet.png` | walk после QA |
| `refs/sprites/chroma/char_hero_*_chroma.png` | magenta sources |

Правила look:
- top-down 3/4 (как Chrono Trigger / статья), НЕ портрет
- messy brown hair, blue sweater, collar, ID badge, khaki, brown shoes
- cel shading, readable outlines
- BG generation: `#FF00FF` → chroma → transparent frames

## Pose lock (motion) — Slynyrd 6-frame run

Канон: **6 кадров** на направление = шаг A (0–2) + шаг B (3–5).  
Playback **линейный** 0→5→0. За клетку в демо — один полушаг (3 кадра), следующий шаг — другая нога.  
Не ping-pong по 0…5: реверс ломает походку.

| Col | Phase | Высота | Ноги / руки |
|-----|-------|--------|-------------|
| 0 | contact A | lowest | ведущая нога extreme, руки opposite extreme |
| 1 | down A | lower | передняя стопа flat, задняя отрывается |
| 2 | pass A | **tallest** | ноги под торсом, руки mid |
| 3 | contact B | lowest | зеркало A |
| 4 | down B | lower | зеркало A |
| 5 | pass B | **tallest** | ноги под торсом |

Bob: variable bounce (down → down → up), не ровная синусоида.  
Pass = быстрый подъём. W = mirror E.

| File | Role |
|------|------|
| `rig/pose_walk_6x4.png` | 6×4 stick template |
| `rig/pose_idle_4x4.png` | idle breathe (hold extremities longer) |
| `rig/pose_caught_1x4.png` | fail strip |

См. также [Pixelblog 50 — Human Walk Cycle](https://www.slynyrd.com/blog/2024/5/24/pixelblog-50-human-walk-cycle) (contact/down/pass).

## Generation contract

1. `pose_template` (rig)  
2. `style_lock` (ГГ)  
3. Fallback → `compose_hero_walk.py`:
   - **S/N:** phases B = H-flip(A) — не доверяем ИИ «левой/правой ноге»
   - **E:** A/B halves only if raw foot-skew opposite; else regenerate
   - **W:** mirror each E cell (order kept)
   - Constant `target_body_h`; **bob_y = 0** (любой vertical bob = припрыжка)
4. Chroma + feet baseline + torso X (`normalize_sprite_set`)

HR look lock: `refs/art/seed-hr.png` + `hr-turnaround.png` (**APPROVED**).  
Канон: полная (plus-size) фигура; idle **без клипборда** (пустые руки); E/W = полный 90° профиль.  
Production: idle frames `frames/boss_hr/idle_{s,e,n,w}.png` → walk rows **того же тела** (не warp / не slim).  
Walk B: S/N = keep-upper / legs; W = mirror E.  
**Chroma HR:** pure `#00FF00` (зелёный) — розовый пиджак конфликтует с `#FF00FF`.

## Cut-up rig bake (ГГ · experiment REJECTED)

Пробовали parts → angles → bake. Качество для feel **не ок** (кукольные стыки/пропорции).  
Демка снова на `compose_hero_walk.py`.  

Артефакты R&D: `rig/cutup/hero/` + `hero_cutup_bake.py` — не SoT.  
Если возвращаться: только через Spine/DragonBones + ручная нарезка/стыки, не AI-parts + naive rotate.

## Методология анимационных спрайтов (из пайплайна)

1. **Locks first:** pose rig (Slynyrd) + style lock (ГГ idle) — без них ИИ разъезжается.  
2. **Генерировать по фазам, не «весь цикл сразу»:** contacts → downs → pass; проверять opposite limbs.  
3. **Не доверять ИИ ногам:** S/N → B = H-flip(A); E — только если foot-skew opposite на raw halves.  
4. **Один масштаб / одни ноги:** `normalize_sprite_set` + общий `target_body_h`; bob_y=0 (иначе припрыжка).  
5. **Playback = половине шага на клетку** (`walkStride` 0|1 → кадры 0–2 / 3–5); линейный цикл, не ping-pong 0…5.  
6. **Coherent rows > frankenstein:** один walk-row на dir; не склеивать contacts из разных gens.  
7. **QA:** mse f0≠f3, f2≠f5; GIF loop без hitch; demo hard-refresh (`?v=`).  
8. **Силуэт издалека:** у каждого босса свой цветовой/проп-якорь (KPI ≠ директор-красный; IT ≠ neon).

## QA

- [ ] 6 уникальных фаз, f0≠f3 ведущая нога, f2≠f5 pass  
- [ ] pass визуально выше contact (bob)  
- [ ] нет magenta в `frames/`  
- [ ] GIF loop без скачка  

Rebuild:  
`python management/tools/compose_hero_walk.py`  
`python management/tools/compose_hr_walk.py`  
Docs: `prompts/SPRITE_ANIM_PROMPTS.md`
