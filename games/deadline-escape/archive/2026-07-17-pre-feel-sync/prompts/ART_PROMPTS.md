# Работник месяца — ART_PROMPTS

**Канон:** `docs/DESIGN_LLM.md` §6–7. **Не писать `src/`.**

## Контекст агенту

```
Арт-агент Employee of the Month (slug: deadline-escape).
Стиль: cartoon office satire, bright, meme-readable.
Palette: carpet #C8D2E0, cubicle #6B7C93, sticky #F4D35E, danger #E63946,
hide #2A9D8F, player #1D3557, UI panels #E8EEF5, CTA #E9C46A.
Top-down gameplay assets 32x32. Key art vertical 1080x1920.
NO horror, NO realistic gore, NO cream+#terracotta serif cliché, NO purple glow spam.
```

## JOB A — Key art
```
Vertical key art mobile game Employee of the Month: cartoon employee sprinting through cubicles chased by caricature managers with URGENT folders, satirical bright office, yellow sticky accents, comedy chase energy, full-bleed 1080x1920, no text no logo no UI
```
→ `public/assets/textures/keyart/keyart_deadline_escape.png` + `refs/art/`

## JOB B — Biome moods
`refs/art/env_openspace.png`, `env_accounting.png`, `env_it.png`, `env_board.png`  
Промпт-шаблон: `Top-down cartoon office biome MOODBOARD, BIOME_NAME, bright satirical corporate, readable shapes`

## JOB C — Tileset
```
32x32 top-down cartoon office tileset: carpet variants, cubicle walls, desks, chairs, cooler, printer, elevator, plants, toilet door, packed sheet, game-ready, no characters
```
→ `public/assets/textures/tiles/tile_office_sheet.png`

## JOB D — Characters / bosses stills
Hero + 3 bosses design sheets → `refs/art/` then production via SPRITE_ANIM.

## JOB E — Gadgets & VFX
Coffee, badge, VPN laptop, donut icons 32x32; sweat, speed lines, stun stars, noise !  

## JOB F — UI kit
```
Comedy office UI kit cool gray-blue #E8EEF5 yellow CTA #E9C46A: buttons, timer, score, rewarded revive, upgrade rows, floor select nodes, no phone mockup
```
→ `public/assets/textures/ui/ui_kit.png`

## DoD
- [ ] Paths correct  
- [ ] Bosses color-coded readable at 32px  
- [ ] Key art portrait full-bleed  

## Запреты
Вне папки игры; darksouls office; Inter-looking UI mock with purple gradient.
