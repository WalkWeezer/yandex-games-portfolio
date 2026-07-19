# Neon Bullet — SPRITE_ANIM_PROMPTS

**Назначение:** спрайт-листы и тайминги анимаций.  
**Канон:** `DESIGN_LLM.md` §8.  
**Запрет:** не писать игровой код.

---

## Контекст для агента

```
Игра Neon Bullet, Phaser 3, tile 32px, top-down orthographic sprites.
Pivot: center of feet ≈ (16, 22) внутри кадра 32x32.
Имена файлов и anim keys строго по schema: char_*, en_*, vfx_*.
Export: PNG sheet + optional JSON frame names.
Timing table ниже — закон для Animations.create в Phaser (когда код разрешён).
```

---

## Player sheet

**Файл:** `public/assets/textures/characters/char_player_sheet.png`  
**Layout:** frame 32×32, **8 columns × 6 rows**

| Anim key | Frames (col-major index) | Count | fps | loop |
|----------|--------------------------|-------|-----|------|
| `char_player_idle` | 0–3 | 4 | 6 | yes |
| `char_player_walk` | 4–11 | 8 | 12 | yes |
| `char_player_melee` | 12–15 | 4 | 16 | no |
| `char_player_shoot` | 16–18 | 3 | 20 | no |
| `char_player_death` | 19–23 | 5 | 10 | no |

**Промпт генерации:**
```
Spritesheet 8x6 grid of 32x32 frames, top-down neon masked mercenary, row-major: idle 4, walk 8, melee 4, shoot 3, death 5, remaining empty, transparent background, consistent pivot, cyan mask glow, black jacket, pixel-crisp
```

---

## Mask overlays

Для каждой маски: `char_mask_<id>_sheet.png` — только голова/маска 32×32, те же idle/walk кадры (4+8) или static glow.

IDs: `default` (в теле), `speed`, `ghost`, `ammo`, `armor`, `lucky`

**Промпт:**
```
Top-down 32x32 mask overlay spritesheet, glowing neon mask variants (speed streaks, ghost translucent, ammo marks, armor plates, lucky charm), aligned for character head pivot, transparent, no body
```

---

## Enemy sheets

Файлы:
- `public/assets/textures/enemies/en_thug_sheet.png`
- `public/assets/textures/enemies/en_gunner_sheet.png`
- `public/assets/textures/enemies/en_brute_sheet.png`

Layout: 32×32, 8 cols × 4 rows

| Anim | frames | count | fps | loop |
|------|--------|-------|-----|------|
| idle | 0–3 | 4 | 6 | yes |
| walk | 4–11 | 8 | 10 | yes |
| attack | 12–15 | 4 | 12 | no |
| death | 16–20 | 5 | 10 | no |

**Промпт (подставь TYPE):**
```
Spritesheet top-down 32x32 enemy TYPE for Neon Bullet, 8 columns: idle4 walk8 attack4 death5, distinct silhouette, neon noir, transparent, no gore, consistent scale with 32px tile characters
```

TYPE ∈ {street thug with bat, gunner with pistol, bulky brute}

---

## Boss (MVP) `en_boss_maskmaker_sheet.png`

Frame **64×64**, 6 cols × 4 rows: idle4, walk6, attack6, special4, death6.

fps: idle6 / walk8 / attack10 / special12 / death8

---

## Weapon muzzle / held

`public/assets/textures/weapons/wpn_<id>_sheet.png` — optional angled holds 8 directions × 1 frame (32×32) OR rotate in engine (предпочтительно rotate single sprite).

Muzzle VFX: `vfx_muzzle_sheet.png` 64×64, 4 frames @ 24fps oneshot.

---

## VFX sheets

| File | Frame | Anims |
|------|-------|-------|
| `vfx_blood_sheet.png` | 64×64 | splat A 5f @14, splat B 5f @14 |
| `vfx_muzzle_sheet.png` | 64×64 | flash 3f @24 |
| `vfx_hit_sheet.png` | 32×32 | spark 4f @20 |
| `vfx_combo_sheet.png` | 64×64 | burst 6f @16 |

**Промпт:**
```
Pixel VFX spritesheet transparent: stylized magenta blood splat frames, cyan muzzle flash, hit sparks, combo burst, neon noir game, no photoreal gore
```

---

## DoD

- [ ] Все sheets в контрактных путях
- [ ] Кадры не обрезают силуэт
- [ ] Pivot визуально стабилен между кадрами walk
- [ ] Death oneshot читается за ≤0.5s
- [ ] JSON atlas optional; если есть — рядом с PNG

## Запреты

- Не isometric
- Не 3/4 perspective в gameplay sprites
- Не менять frame size без обновления DESIGN_LLM
