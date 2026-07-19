# SPRITE_ANIM_PROMPTS — Легенды Поля

> Для анимации/атласов. Канон: `docs/DESIGN_LLM.md` §7, §9.  
> Выход: `refs/sprites/` → `public/assets/atlases/`.  
> Формат: PNG sheet + JSON hash (Phaser) или отдельные кадры + описание сборки.

## Global rules

- Transparent background.  
- Power-of-two atlas ≤ 2048².  
- Padding 2px, no rotation.  
- Naming: `{animName}_{frameIndex0padded}` e.g. `vfx_goal_burst_00`.  
- Document pivot in MANIFEST.

---

## 1. Card FX atlas — `atlas_cards_fx`

### Prompt — shimmer SR
```text
Sprite sheet animation 8 frames on transparent, vertical card-shaped holographic shimmer purple neon edge pulse, football CCG card glow, consistent 256x384 frame boxes in a row, no text, clean edges
```

### Prompt — shimmer UR
```text
Sprite sheet 12 frames transparent, vertical card gold holographic shimmer with sparkle particles, 256x384 cells, football CCG ultra rare glow, no text
```

### Prompt — place drop
```text
6 frames transparent, card landing squash and neon dust, 256x384 cells, subtle, mobile game
```

### Prompt — damage flash
```text
4 frames transparent, card white flash then red edge hit, 256x384, readable silhouette preserved
```

### Timing

| Anim | Frames | FPS | Loop |
|------|--------|-----|------|
| card_idle_shimmer_sr | 8 | 12 | yes |
| card_idle_shimmer_ur | 12 | 12 | yes |
| card_place_drop | 6 | 16 | no |
| card_damage_flash | 4 | 20 | no |

---

## 2. Battle VFX atlas — `atlas_vfx_battle`

### Prompt — ball streak
```text
8 frames transparent 128x128 cells, cyan neon football energy streak moving right, motion blur, cyber sports VFX, no text
```

### Prompt — goal burst
```text
10 frames transparent 256x256, neon goal explosion with cyan and gold particles, center pivot, stadium light feel, mobile VFX
```

### Prompt — synergy pulse
```text
8 frames transparent 512x128, horizontal neon green energy link pulsing, tactical connection, soft glow
```

### Prompt — skill cast ring
```text
8 frames 256x256 transparent, circular runic neon ring expanding around center, purple-cyan, for skill cast
```

### Prompt — intervention flash
```text
6 frames 256x128, UI-friendly gold whistle flash / timeout burst, flat readable
```

### Timing

| Anim | Frames | FPS | Loop | Trigger |
|------|--------|-----|------|---------|
| vfx_ball_streak | 8 | 24 | no | pass/attack token |
| vfx_goal_burst | 10 | 20 | no | goal |
| pitch_syn_pulse | 8 | 10 | yes | active synergy ≥2 |
| vfx_skill_ring | 8 | 16 | no | skill cast |
| vfx_timeout_flash | 6 | 18 | no | intervention |

---

## 3. UI micro-animations — `atlas_ui_fx`

### Prompt
```text
UI VFX sprite sheet transparent: currency coin collect 6 frames, gem sparkle 6 frames, button ripple 4 frames, pack glow pulse 8 frames, cyber navy-gold neon, 128x128 cells
```

| Anim | Frames | FPS |
|------|--------|-----|
| fx_ui_coin_collect | 6 | 16 |
| fx_ui_gem_sparkle | 6 | 12 |
| fx_ui_btn_ripple | 4 | 20 |
| fx_ui_pack_pulse | 8 | 10 |

---

## 4. Pack open — `atlas_pack_open`

```text
12 frames transparent 512x512, holographic card pack bursting open with light and floating card silhouettes, gold-cyan, mobile gacha-like reveal but tasteful, no text no skulls
```

| Anim | Frames | FPS | Loop |
|------|--------|-----|------|
| ui_pack_open | 12 | 16 | no |

---

## 5. Phaser atlas JSON contract

```json
{
  "atlasKey": "atlas_vfx_battle",
  "texture": "assets/atlases/atlas_vfx_battle.png",
  "data": "assets/atlases/atlas_vfx_battle.json",
  "anims": [
    { "key": "vfx_goal_burst", "prefix": "vfx_goal_burst_", "start": 0, "end": 9, "frameRate": 20, "repeat": 0 }
  ]
}
```

---

## 6. Delivery checklist

- [ ] Sheets ≤ 2048  
- [ ] Frame sizes match DESIGN_LLM  
- [ ] MANIFEST with pivots + timings  
- [ ] Preview GIF/MP4 optional в `refs/sprites/preview/`  
- [ ] No baked text
