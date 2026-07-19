# Работник месяца — SPRITE_ANIM_PROMPTS

**Канон:** `DESIGN_LLM.md` §8.

## Контекст
```
Phaser sprites top-down 32x32 (CEO 48x48). Pivot feet center.
Files under public/assets/textures/...
```

## Hero — `char_hero_sheet.png` (8×4, 32×32)

| key | frames | fps | loop |
|-----|--------|-----|------|
| `char_hero_idle` | 0–3 | 6 | y |
| `char_hero_run` | 4–11 | 12 | y |
| `char_hero_panic` | 12–15 | 10 | y |
| `char_hero_caught` | 16–20 | 8 | n |

**Промпт:**
```
Spritesheet 8x4 of 32x32 top-down cartoon office hero: idle4 run8 panic4 caught5, blue sweater, transparent, consistent pivot, comedy style
```

## Bosses

`boss_manager_sheet.png`, `boss_hr_sheet.png` — 32×32 8×4  
`boss_ceo_sheet.png` — 48×48 6×4

| anim | frames | fps |
|------|--------|-----|
| idle | 4 | 6 |
| walk/chase | 8 | 10 |
| special | 4 | 12 |
| catch | 4 | 8 |

**Промпт:**
```
Top-down spritesheet caricature BOSS_TYPE office villain, chase comedy, idle walk special catch frames, transparent, readable silhouette
```

## Props activate

`prop_cooler_sheet.png`: idle1 + activate3 @10fps  
То же для printer, elevator light.

## Power-ups

Static icons `pu_coffee.png`, `pu_badge.png`, `pu_vpn.png`, `pu_donut.png` + bob handled in code.

## VFX

`vfx_sweat_sheet.png` 32×32 4f@12  
`vfx_stun_sheet.png` 32×32 4f@10  
`vfx_noise_sheet.png` 32×32 3f@10  
`vfx_hide_sheet.png` 32×32 4f@8 loop soft

## DoD
Sheets in contract paths; walk cycle stable; catch readable.

## Запреты
Isometric; horror blood; changing frame sizes silently.
