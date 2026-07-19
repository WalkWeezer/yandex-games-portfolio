# Море Реликвий — ART_PROMPTS

**Канон:** `docs/DESIGN_LLM.md` §6–7. Не писать `src/`.

## Контекст
```
Art agent Tide of Relics (slug: tide-of-relics).
Naval fantasy FTL-like. Palette: deep #071B2A, sea #0B3C5D, foam #7EC8E3,
gold #D4A017, wood #6B3F24, sail #E8DCC8, danger #C44536, heal #3A9B7A,
parchment #D9C7A1, curse #5C4D8A sparingly.
Key art painterly; gameplay icons crisp. NO cyber neon purple spam, NO photoreal.
```

## JOB A — Key art
```
Cinematic key art Tide of Relics: enchanted galleon on cursed teal sea, gold relics glowing, distant leviathan silhouette, storm light, painterly fantasy, 1920x1080, no text no logo no UI
```
→ `public/assets/textures/keyart/keyart_tide_of_relics.png`

## JOB B — Environments
- Sea chart map BG → `refs/art/map_bg.png` + production `public/assets/textures/tiles/bg_map.png`
- Combat water layers → `public/assets/textures/tiles/bg_combat_water.png`

## JOB C — Ships roster
Design sheet 4 classes → `refs/art/ships_roster.png`  
Production sheets via SPRITE_ANIM.

## JOB D — Enemies & boss
Pirate sloop/brig, wraith, kraken spawn, imperial frigate, deep cult, leviathan stages → `refs/art/foes_roster.png`

## JOB E — Relics, system icons, VFX stills
Atlas-ready 64×64 icons; VFX motif sheets.

## JOB F — UI kit + map nodes
```
Naval fantasy UI kit deep sea gold foam: panels, system buttons, relic slots, event panel, shop rows, rewarded CTA, map node icons combat elite event shop treasure boss, 9-slice, no device mockup
```
→ `public/assets/textures/ui/ui_kit.png`, `ui_map_nodes_atlas.png`, `ui_icons_atlas.png`

## DoD
Palette lock; readable ships at combat scale; paths correct.

## Запреты
Hotline neon; purple-on-white SaaS look; text baked into key art.
