# Работник месяца — REFS

Визуальные якоря. **SoT геймплея** — feel/beta демка.  
**SoT look/motion** — [`STYLE_LOCK.md`](STYLE_LOCK.md) + [`SPRITE_PIPELINE.md`](SPRITE_PIPELINE.md).

## Active (Pipeline v1)

| File | Role |
|------|------|
| `refs/art/style-seed-hero.png` | **Style seed** — P1 gate |
| `refs/art/style-seed-hero-board.png` | seed + idle sheet |
| `refs/art/style-seed-hero.APPROVED.json` | маркер после кнопки APPROVED (Спрайты) |
| `refs/art/seed-hr.png` | **HR seed** (idle_s, empty hands) |
| `refs/art/hr-turnaround.png` | **HR P2** idle turnaround S/E/N/W |
| `refs/art/seed-hr.APPROVED.json` | маркер APPROVED HR P2 |
| `sprites/boss_hr_idle_sheet.png` | idle sheet preview |
| `chroma/boss_hr_idle_*_chroma.png` | HR green-chroma SoT |
| `frames/boss_hr/idle_{s,e,n,w}.png` | HR idle frames (256²) |
| `char_hero_idle_sheet.png` | носитель стиля / idle |
| `char_hero_walk_sheet.png` | walk ГГ |
| `char_hero_caught_sheet.png` | caught |
| `char_hero_sheet.png` | legacy turnaround (= idle₀) |
| `rig/pose_walk_6x4.png` | POSE LOCK walk (Slynyrd 6f) |
| `rig/pose_idle_4x4.png` | POSE LOCK idle |
| `rig/pose_caught_1x4.png` | POSE LOCK caught |
| `frames/char_hero/*` | кадры ГГ для демки |
| `frames/tile_floor_a.png` · `tile_floor_b.png` | пол |
| `frames/tile_desk.png` · `tile_desk2.png` | столы |
| `frames/tile_plant.png` · `tile_cooler.png` | пропы |
| `frames/tile_fog.png` | текстура FoW |
| `frames/tile_wall_{n,s,e,w}.png` | прямая стена (Option A, полоса к play) |
| `frames/tile_window_{n,s,e,w}.png` | окно на прямой |
| `frames/tile_wall_{nw,ne,sw,se}.png` | L-угол (solid rim) |
| `frames/tile_wall_{nwe,nsw,nse,swe}.png` | U |
| `frames/tile_wall_stub_{nw,ne,sw,se}.png` | stub угла карты |
| `art/wall-option-a-cream-wood.png` · `wall-option-a-window.png` | **APPROVED** masters стен |
| `frames/pu_*` · `vfx_*` | пикапы / VFX scaffolding |
| `art/ai-wall-n-layoutfeel.png` · `ai-window-n-layoutfeel.png` | AI masters стен (legacy) |

Motion tutorial: [Slynyrd Pixelblog 55](https://www.slynyrd.com/blog/2025/3/24/pixelblog-55-top-down-character-animation)

## Archive (не SoT)

| Path | Contents |
|------|----------|
| `archive/2026-07-18-pipeline-v1-reset/` | концепты, HR, боссы, chroma/sheets — вынесены из `refs/` |
| `archive/2026-07-18-sprites-cleanup/` | более ранний cleanup |
| `archive/2026-07-17-pre-feel-sync/` | pre-feel пакет |

## UI / levels (не character art)

| File | Role |
|------|------|
| `refs/ui/tone-ui.png` | UI tone |
| `refs/levels/layout-feel.png` | сетка 7×9 mood · якорь стен |

## Rebuild

```bash
python management/tools/build_layoutfeel_walls.py
python management/tools/sync-deadline-docs-bundle.py
```