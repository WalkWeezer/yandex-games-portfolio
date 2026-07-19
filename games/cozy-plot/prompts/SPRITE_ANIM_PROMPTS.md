# SPRITE_ANIM_PROMPTS — cozy-plot

**Роль:** спрайт-агент. Спеки `DESIGN_LLM.md` §6.  
**Ground truth:** `refs/sprites/sheet-main.png`.  
**Выход:** `refs/sprites/` → `public/assets/sprites/`.  
**coding_allowed:** false until CONFIRMED.

## Master lock
```
Cozy storybook 2D game sprites, soft thick outline, warm key light top-left, transparent background, consistent ground shadow, no text
```

## Sheets

### Player `char_player_sheet.png` — 64×64, 8 cols
| Row | Anim | Frames | FPS | Loop |
|-----|------|--------|-----|------|
| 0 | idle_down/left/right/up | 2 each | 4 | yes |
| 1 | walk_* 4dir | 4 each | 8 | yes |
| 2 | sow + harvest | 4 + 4 | 10 | no |

### NPC sheets `npc_{lada\|tikhon\|zoya}_sheet.png` — 64×64
idle bob 2 @3fps; talk 3 @6fps.

### Animals
- `animal_chicken_sheet.png` 48×48: idle4@6, peck4@8, happy3@8
- `animal_goat_sheet.png` 64×48: idle4@5, walk4@8

### Crops `crop_{id}_sheet.png` — 64×64 ×4 stages (seed, sprout, grow, ready)
Static frames; code picks index by grow%.

### VFX
`vfx_harvest_sheet.png` 32×32 ×6 @16fps  
`vfx_order_done_sheet.png` 64×64 ×8 @14fps  
`vfx_expand_bridge_sheet.png` 128×128 ×10 @12fps

## Prompt template
```
{lock}
Sprite sheet [FILE SPEC], even grid no bleed, feet aligned, transparent
```

## Acceptance
- [ ] Ready crop stage readable at 64px
- [ ] Walk cycle no foot slide
- [ ] Animals loop seamless
