# ART_PROMPTS — Легенды Поля

> Для арт-агента. Канон: `docs/DESIGN_LLM.md` §5–6, §9.  
> Выход: `refs/art/` → после аппрува копировать в `public/assets/images/`.  
> Не писать код. Не менять скоуп геймплея.

## Style lock (вставлять в каждый промпт)

```text
Style lock: cyber-fantasy football CCG, cinematic night stadium, holographic glowing player cards, neon tactical lines, volumetric floodlights, high contrast, mobile game art, fictional athletes only, no real club logos, no trademarks, no watermarks, no UI text unless asked
```

## Palette lock

`#0B1B33 #1F6B3A #3DFF9A #3DE7FF #FFC84A #A85CFF #FF4B5C #4B7BFF #F2F7FF`

---

## A. Key art / marketing

### A1. Key art master (референс уже есть: `refs/art/key-art.png`)
```text
Cinematic night football stadium low angle, seven tall holographic player cards standing on green pitch as tactical units with purple blue gold green red auras, neon synergy lines on grass, cyan energy football trail, crowd silhouettes foreground, manager hands holding transparent holographic tablet with mini-map, cyber-fantasy sports, ultra detailed mobile key art, 16:9 and 9:16 crops friendly, no logos no text
```

### A2. Store icon 512
```text
App icon, centered glowing football with neon cyan trail and tiny holographic card silhouette behind, dark navy background, simple readable at 48px, cyber sports, no text
```

### A3. Yandex Games cover 16:9
```text
Wide banner night stadium holographic cards on pitch, neon green tactical grid, title-safe empty center third for logo overlay, cyber-fantasy football, no text
```

---

## B. Environments

### B1. `bg_stadium_night_01` (battle)
```text
Mobile game background 9:16, slight top perspective football pitch at night, dark green grass, subtle neon cyan and green tactical grid, bright stadium lights bloom, empty no players, dark crowd bokeh, space reserved center for UI card slots, cyber sports, no text no logos
```

### B2. `bg_hub_club_01`
```text
Mobile game hub background 9:16, luxury club lounge overlooking night stadium pitch through glass, holographic screens, navy and gold accents, cozy management mood, soft bokeh, no text no logos
```

### B3. `bg_market_01`
```text
Transfer market screen background, neon sports marketplace booths with holographic card displays, night indoor arena concourse, cyber fantasy, 9:16, no text
```

### B4. `bg_results_win` / `bg_results_lose`
```text
Abstract stadium confetti neon gold victory atmosphere 9:16 empty center for UI; AND muted blue rain of light defeat atmosphere version, no text
```

---

## C. Characters / cards (портреты)

Шаблон (подставить ROLE, NAME vibe, RARITY COLOR):

```text
Vertical collectible card portrait 2:3, fictional football {ROLE}, dynamic pose, cyber-fantasy jersey without crest, {RARITY} aura glow {COLOR}, dramatic rim light, clean silhouette, dark gradient backdrop, face readable, not a real celebrity, centered, mobile game asset
```

### C-MVP batch list (создать 40 портретов по IDs из DESIGN_LLM)

Роли ×8: `gk_*`, `def_*`, `mid_*`, `fwd_*`, `flex_*`  
Редкости распределить: ~20 N, 12 R, 6 SR, 2 UR в портретных версиях (остальные rarity = frame swap).

Примеры ID:
- `card_gk_aegis_sr` — aura purple, defensive stance
- `card_fwd_blaze_sr` — aura red/gold, striking pose
- `card_mid_maestro_ur` — aura gold, conductor-like kick pose
- `card_def_wall_r` — aura blue, arms wide block
- `card_flex_spark_n` — aura gray-cyan, versatile ready pose

### C2. Manager hand prop (optional)
```text
First-person hands holding transparent holographic tablet showing football pitch mini-map blue vs orange icons, cyber UI glow, isolated on transparent, mobile game asset
```

---

## D. Items / frames / icons

### D1. Card frames
```text
Set of 4 vertical card frames on transparent: Normal steel-gray, Rare blue neon, Super Rare purple holographic ornate, Ultra Rare gold ornate with gem socket bottom center, cyber sports, identical safe-area for portrait, no text
```

### D2. Role badges
```text
Five circular badges on transparent labeled visually without text: GK gloves, DEF shield, MID compass, FWD flame, FLEX star, neon cyber style
```

### D3. Currency icons
```text
Three mobile game currency icons on transparent: gold coins stack, cyan diamond gem, silver dust jar, cyber sports UI, crisp 256px
```

### D4. Pack art
```text
Three card pack designs: daily simple steel, premium purple holographic, mega gold legendary, football CCG, closed packs, no text
```

---

## E. VFX stills (для нарезки в sheets)

```text
VFX elements on transparent black: neon goal explosion, cyan ball streak frames concept, purple skill sigil around card silhouette, green synergy chain links, gold UR sparkle burst, football cyber fantasy, separated objects
```

---

## F. Delivery checklist

- [ ] PNG, sRGB, без водяных знаков  
- [ ] Имена файлов = Asset ID  
- [ ] Портреты 1024×1536 или 768×1152  
- [ ] BG 1080×1920  
- [ ] Иконки 256 / 512  
- [ ] Положить в `refs/art/` с подпапками `bg/`, `cards/`, `ui/`, `vfx/`  
- [ ] Обновить список в `refs/art/MANIFEST.md` (создать при сдаче)
