# Работник месяца — REFS

Визуальные якоря. **SoT геймплея** — feel/beta демка.  
**SoT look/motion** — [`STYLE_LOCK.md`](STYLE_LOCK.md) + [`SPRITE_PIPELINE.md`](SPRITE_PIPELINE.md).

## Active (Pipeline v1)

| File | Role |
|------|------|
| `refs/art/style-seed-hero.png` | **Style seed** — P1 gate |
| `refs/art/style-seed-hero-board.png` | seed + idle sheet |
| `refs/art/style-seed-hero.APPROVED.json` | маркер после кнопки APPROVED (Спрайты) |
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
| `frames/tile_wall_{n,s,e,w}.png` | стена у внешнего края клетки |
| `frames/tile_window_{n,s,e,w}.png` | окно у внешнего края |
| `frames/tile_cabinet.png` · `tile_printer.png` · `tile_trash.png` | 1×1 пропы у стен (fog) |
| `border_wall_preview.png` | превью n/s/w/e |
| `border_props_preview.png` | превью cabinet/printer/trash |
| `frames/pu_*` · `vfx_*` | пикапы / VFX scaffolding |

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
| `refs/levels/layout-feel.png` | сетка 7×9 mood |

## Rebuild

```bash
python management/tools/sync-deadline-docs-bundle.py
```
