# Море Реликвий — SPRITE_ANIM_PROMPTS

**Канон:** `DESIGN_LLM.md` §8.

## Контекст
```
Phaser sheets. Ships side-view 96x64. Boss 192x96. VFX 128x128.
Pivot: ship mid-hull. Transparent BG.
```

## Player/enemy ships

Files: `public/assets/textures/ships/ship_<brig|longship|galleon|arcanist>_sheet.png`  
Layout: 6×3 frames 96×64

| anim | frames | fps | loop |
|------|--------|-----|------|
| idle | 0–3 | 6 | y |
| fire | 4–7 | 12 | n |
| hit | 8–10 | 10 | n |
| sink | 11–17 | 8 | n |

**Промпт:**
```
Spritesheet 6x3 frames of 96x64 side-view fantasy SHIP_CLASS, idle bob 4, fire 4, hit 3, sink 7, transparent, consistent silhouette, painted game sprite
```

## Foes

Same layout under `public/assets/textures/enemies/foe_<id>_sheet.png`  
IDs: `pirate_sloop`, `pirate_brig`, `wraith_skiff`, `kraken_spawn`, `imperial_frigate`, `deep_cult`

## Boss

`foe_boss_leviathan_sheet.png` — 192×96, rows = phases:
- phase1 idle/attack  
- phase2 rage  
- phase3 final  

fps attack 10, idle 5, death 8

## Relic VFX

| file | frames | fps |
|------|--------|-----|
| `vfx_rel_storm_sheet.png` | 8 | 14 |
| `vfx_rel_tentacles_sheet.png` | 8 | 12 |
| `vfx_rel_fire_sheet.png` | 6 | 16 |
| `vfx_rel_fog_sheet.png` | 6 | 10 |
| `vfx_rel_mend_sheet.png` | 6 | 12 |
| `vfx_cannon_sheet.png` | 4 | 16 |

## Icons (static atlas)

`rel_icons_atlas.png`, `ui_icons_atlas.png`, `ui_map_nodes_atlas.png` — 64×64 cells

## DoD
All paths; sink readable; idle loop seamless bob.

## Запреты
Top-down ships if combat is side-view (keep consistent with DESIGN_LLM side-view); random frame sizes.
