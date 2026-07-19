# SPRITE_ANIM_PROMPTS — auto-towers

**Роль:** спрайт-агент.  
**Читать:** DESIGN_LLM §6.  
**Ground truth:** `refs/sprites/sheet-main.png`.  
**coding_allowed:** false until CONFIRMED.

## Lock
```
Cute fantasy TD sprites, thick outline, transparent bg, tower/hero 96px, enemy 64px, consistent light top-left, no text
```

## Sheets & timing

| File | Cell | Anims | FPS |
|------|------|-------|-----|
| `tower_{id}_sheet.png` | 96 | idle4 loop, attack4 oneshot | 6 / 12 |
| `hero_{id}_sheet.png` | 96 | idle4, cast6 oneshot | 6 / 12 |
| `enemy_{id}_sheet.png` | 64 | walk6 loop, die4 oneshot | 10 / 14 |
| `proj_{id}_sheet.png` | 32 | fly2–4, hit3 | 16 |
| `vfx_slow_sheet.png` | 48 | 6 | 12 |
| `vfx_aoe_ring_sheet.png` | 128 | 8 | 16 |
| `vfx_skill_burst_sheet.png` | 128 | 10 | 18 |

Attack frame 2 = projectile spawn. Bosses use enemy sheet with 96 cell optional.

## Prompt
```
{lock}
Sprite sheet grid evenly spaced [SPEC] matching refs/sprites/sheet-main.png, no frame bleed, anchored feet bottom-center
```

## Runtime juice (ms)
Place 160 · Wave banner 900 · Skill zoom 400 · Boss intro 1500 · Win 2000

## Acceptance
- [ ] Die anim doesn't shift hitbox anchor wildly
- [ ] Projectile readable on grass path
- [ ] Skill burst ≤10 frames
- [ ] Frame counts match DESIGN_LLM §6.1
