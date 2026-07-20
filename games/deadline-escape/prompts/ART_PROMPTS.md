# Работник месяца — ART_PROMPTS

**Канон:** `docs/DESIGN_LLM.md` §5 + `docs/REFS.md`. **Не писать `src/`.**  
**Запрет:** hide shimmer как идентичность; free-move chase fantasy; horror; purple glow spam.

## Контекст агенту

```
Art agent — Employee of the Month (slug: deadline-escape).
Genre: top-down office grid dodge (NOT stealth hide).
Style: bright cartoon office satire, meme-readable shapes.
Palette: carpet #C8D2E0, cubicle #6B7C93, sticky #F4D35E, danger #E63946,
player #1D3557, UI #E8EEF5, CTA #E9C46A.
Gameplay art 32x32 top-down. Key art vertical 1080x1920 full-bleed.
NO text, NO logo, NO UI chrome on key art.
```

## JOB A — Key art → `refs/art/key-art.png`

```
Vertical mobile game key art "Employee of the Month": cartoon office worker dodging between cubicle desks on a bright open-plan floor while caricature managers and HR with urgent folders approach from multiple sides, satirical corporate comedy, yellow sticky-note accents, energetic but readable, full-bleed portrait 1080x1920, no text no logo no UI
```

## JOB B — Mood top-down → `refs/art/mood-office-topdown.png`

```
Top-down cartoon office moodboard: gray-blue carpet grid, desks and cubicle walls forming aisles, plants and water cooler, bright satirical corporate, empty of UI, readable walkable lanes vs blocked desks, game concept art
```

## JOB C — Hero → `refs/art/char-hero.png`

```
Top-down 3/4 or orthographic cartoon office employee hero, blue sweater, readable silhouette, slightly panicked comedy expression, single character design sheet on plain light background, game-ready concept, no text
```

## JOB D — HR → `refs/art/seed-hr.png` (**APPROVED** P2)

SoT: `seed-hr.png` + `hr-turnaround.png` (idle empty hands, full body, 90° E/W).  
Chroma: `#00FF00`. Walk strips must keep the same body — do not slim / re-identity.

```
Top-down cartoon HR boss character, hot-pink blazer, plus-size, badge lanyard, empty hands idle, readable at small size, pure green #00FF00 background, no text
```

## JOB E — Director → `refs/art/boss-director.png`

```
Top-down cartoon office director boss, red accent, power suit and urgent folder, intimidating comedy caricature, readable silhouette, plain background, no text
```

## JOB F — Concept sheet → `refs/sprites/sheet-concept.png`

```
Game concept sprite sheet style board: top-down hero, HR, director, carpet tile, desk tile, coin, coffee cup, employee badge shield icon, bright cartoon office satire, labeled only by silhouette clarity not text if possible, white/light gray background
```

## JOB G — UI tone → `refs/ui/tone-ui.png`

```
Mobile game UI tone board cool gray-blue panels #E8EEF5 with sticky yellow CTA buttons #E9C46A, simple HUD clock bar and revive dialog frame, comedy office, flat clean, no phone mockup, no purple gradients
```

## JOB H — Layout feel → `refs/levels/layout-feel.png`

```
Top-down cartoon 7 by 9 office floor plan illustration: border walls, desks blocking some cells, open aisles for dodging, plants and cooler props, bright satirical corporate, no characters required, clear grid readability
```

## JOB I — Env tiles (fog-frame) → `refs/sprites/frames/`

Каркас полосы тумана. **APPROVED Option A:** cream panels + wood  
Masters: `refs/art/wall-option-a-cream-wood.png` · `wall-option-a-window.png`.

| Out | Role |
|-----|------|
| `tile_wall_{n,s,e,w}` | прямая стена flush |
| `tile_window_{n,s,e,w}` | то же с окном |
| `tile_wall_{nw,ne,sw,se}` | L (solid rim, без panel-cross) |
| `tile_wall_stub_*` | квадрат стыка угла карты |
| `tile_wall_{nwe,nsw,nse,swe}` | U |

Сборка: `python management/tools/build_layoutfeel_walls.py`  
Feel: `wallTileKey` ← `wallPictureOf`

## DoD

- [ ] Paths match REFS.md  
- [ ] HR pink / Director red readable  
- [ ] Key art portrait full-bleed, no text  
- [ ] No hide-zone green shimmer as brand  
- [ ] `tile_wall` + `tile_window` listed in DESIGN.md §8 / REFS.md  

