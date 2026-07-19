# SPRITE_ANIM_PROMPTS — night-courier

**Роль:** спрайт/аним агент.  
**Читать:** DESIGN_LLM §6.  
**Ground truth:** `refs/sprites/sheet-main.png`.  
**coding_allowed:** false until CONFIRMED.

## Lock
```
Neon cyber-casual game sprites, thick outline, transparent bg, high contrast for night road, no text
```

## Specs & timing (normative)

| File | Cell | Anims | FPS | Loop |
|------|------|-------|-----|------|
| `bike_{id}_sheet.png` | 128×96 | run4, hop4, crash3 | 12/14/10 | run yes |
| `char_courier_{id}_sheet.png` | 64×64 | leanL2, leanR2, cheer3 | 8 | lean yes |
| `obs_car_sheet.png` | 96×96 | wheel2 | 8 | yes |
| `obs_drone_sheet.png` | 64×64 | hover4 | 8 | yes |
| `obs_barrier.png` | 96×64 | static | — | — |
| `obs_pothole.png` | 96×32 | static | — | — |
| `fx_delivery_gate_sheet.png` | 96×128 | pulse4 | 6 | yes |
| `vfx_near_miss_sheet.png` | 64×64 | 6 | 20 | no |
| `vfx_shield_sheet.png` | 128×128 | 8 | 16 | no |
| `vfx_combo_up_sheet.png` | 64×64 | 5 | 16 | no |

Hop apex = frame 2 centered. Lean L/R mirrors.

## Prompt
```
{lock}
Sprite sheet [SPEC] matching refs/sprites/sheet-main.png scale and outline, even grid, no bleed, courier/bike readable silhouette
```

## Juice timing (runtime)
| Event | ms |
|-------|-----|
| Lane tween | 100–120 |
| Hop | 280 |
| Crash slowmo | 300 |
| Continue i-frames | 1500 |
| Parcel pick | 180 |
| Delivery success | 400 |

## Acceptance
- [ ] Frame counts match DESIGN_LLM §6.1
- [ ] No hitbox pivot jumps on crash
- [ ] Output `refs/sprites/` then `public/assets/sprites/`
