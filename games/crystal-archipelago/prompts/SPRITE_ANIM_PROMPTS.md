# SPRITE_ANIM_PROMPTS — Кристаллы Архипелага

> Канон: DESIGN_LLM §7. Выход: `refs/sprites/` → `public/assets/atlases/`.

## Rules
Transparent, atlas ≤2048, 2px pad, cell sizes match 72/144/256.

---

## 1. `atlas_gems` (optional micro-anim)

```text
Per-color gem land squash 4 frames 72x72 transparent; idle sparkle 6 frames subtle for yellow/red only if needed
```

| Anim | Frames | FPS | Loop |
|------|--------|-----|------|
| gem_land | 4 | 20 | no |
| gem_sparkle | 6 | 10 | yes |

---

## 2. `atlas_specials_vfx`

### Clear
```text
6 frames 72x72 gem shatter to shards multicolor templates, transparent
```

### Rocket
```text
8 frames 72x256 or strip, neon gold rocket trail horizontal; separate vertical set
```

### Bomb
```text
10 frames 144x144 circular explosion gold-cyan shards
```

### Rainbow
```text
12 frames 256x256 rainbow beam spiral clear effect, bright cheerful
```

| Anim | Frames | FPS |
|------|--------|-----|
| gem_clear | 6 | 20 |
| rocket_fly_h | 8 | 24 |
| rocket_fly_v | 8 | 24 |
| bomb_explode | 10 | 20 |
| rainbow_beam | 12 | 24 |

---

## 3. `atlas_ui_fx`

```text
Star gain 8 frames, life lose heart break 6 frames, goal check pop 5 frames, win confetti 12 frames tropical petals not generic glitter spam
```

| Anim | Frames | FPS |
|------|--------|-----|
| ui_star_gain | 8 | 16 |
| ui_life_lose | 6 | 16 |
| ui_goal_check | 5 | 18 |
| ui_win_confetti | 12 | 18 |

---

## Timing contract

| Event | ms |
|-------|-----|
| swap | 120 |
| match highlight | 80 |
| clear | 180 |
| gravity per row | 90 |
| special | 350–500 |
| win banner | 900 |

## Delivery
Phaser atlas JSON + MANIFEST pivots (center default).
