# SPRITE_ANIM_PROMPTS — Базар Слияний

> Канон: `docs/DESIGN_LLM.md` §7. Выход: `refs/sprites/` → `public/assets/atlases/`.

## Rules
Transparent, ≤2048 atlas, 2px pad, names `{anim}_{##}`.

---

## 1. `atlas_merge_vfx`

### Merge pop low tiers
```text
Sprite sheet 8 frames 128x128 transparent, cozy sparkle pop two items fuse into one, warm gold dust, soft, mobile merge game
```

### Merge magic high tiers
```text
10 frames 192x192 transparent, magical purple-gold burst merge, moon sparkles, cozy fantasy not dark
```

### Energy refill
```text
6 frames 64x64 teal energy bolt absorb, clean UI VFX
```

### Order complete coins
```text
10 frames 256x128 coins arc upward puff, cozy gold
```

### Bubble pop
```text
6 frames 128 soap bubble pop revealing item silhouette placeholder
```

| Anim | Frames | FPS | Loop |
|------|--------|-----|------|
| vfx_merge_pop | 8 | 16 | no |
| vfx_merge_magic | 10 | 16 | no |
| energy_refill | 6 | 12 | no |
| order_complete | 10 | 16 | no |
| bubble_pop | 6 | 18 | no |

---

## 2. `atlas_gen_fx`

```text
Generator ready pulse 6 frames 128 loop soft green-gold glow ring; spawn puff 5 frames when item appears
```

| Anim | Frames | FPS | Loop |
|------|--------|-----|------|
| gen_ready_pulse | 6 | 8 | yes |
| gen_spawn_puff | 5 | 16 | no |

---

## 3. `atlas_mascot`

```text
Ginger cat sprite sheet cozy style transparent: idle 6 frames, happy 8 frames, sleep 4 frames, 128x128 cells
```

| Anim | Frames | FPS | Loop |
|------|--------|-----|------|
| cat_idle | 6 | 6 | yes |
| cat_happy | 8 | 10 | no |
| cat_sleep | 4 | 4 | yes |

---

## 4. Timing juice (game)

| Event | Duration |
|-------|----------|
| Merge squash | 120 ms |
| Merge VFX | 400–600 ms |
| Order claim | 800 ms |
| Level-up modal in | 250 ms |

## Delivery
Phaser hash atlas JSON + MANIFEST pivots.
