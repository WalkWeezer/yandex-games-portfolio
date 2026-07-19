# SPRITE_ANIM_PROMPTS — idle-forge

**Роль:** спрайт/анимационный агент. Спеки: `DESIGN_LLM.md` §6.  
**Выход:** `refs/sprites/` → `public/assets/sprites/`.

## Master lock
```
Pixel-clean stylized 2D game sprites, cozy dark fantasy, thick outline, consistent 45-degree key light from forge (left-warm), transparent background, no text
```

## S1 — Worker sheet `char_worker_sheet.png`
```
{lock}
Sprite sheet 64x64 cells, 8 columns, 3 rows: row0 idle 4fr, row1 walk 6fr, row2 mine 6fr, cute dwarf worker with pickaxe, chibi, aligned feet bottom-center, even spacing, no bleed between frames
```

**Import Phaser:**
```ts
{ frameWidth: 64, frameHeight: 64 }
anims: idle 6fps loop, walk 10fps loop, mine 12fps loop
```

## S2 — Anvil `prop_anvil_sheet.png`
```
{lock}
Sprite sheet 96x96, dwarven anvil with glowing heat, frames: idle subtle pulse 2, hit sparks 4, transparent bg
```

## S3 — Master smith (optional hub)
```
{lock}
Single idle character 128x128, dwarf forge master arms crossed, for menu mascot, transparent
```

## S4 — VFX sheets
| File | Spec |
|------|------|
| `vfx_ore_spark_sheet.png` | 32×32 ×8, orange sparks on black (additive) |
| `vfx_prestige_burst_sheet.png` | 128×128 ×10, green-gold rune burst |
| `vfx_coin_pop_sheet.png` | 32×32 ×6, gold glints |

## Timing table (implement exactly)

| Anim | FPS | Loop | On complete |
|------|-----|------|-------------|
| worker.idle | 6 | yes | — |
| worker.walk | 10 | yes | — |
| worker.mine | 12 | yes | — |
| anvil.hit | 16 | no | → idle |
| spark | 20 | no | destroy |
| prestige_burst | 18 | no | hide |

## Acceptance
- [ ] No frame size mismatch
- [ ] Feet aligned across walk cycle
- [ ] Additive VFX authored on black where noted
