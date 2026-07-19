# Neon Bullet — ART_PROMPTS

**Назначение:** атомарный пакет для арт-агента / image-gen.  
**Канон:** `games/neon-bullet/docs/DESIGN_LLM.md` §6–7.  
**Выход:** файлы строго в путях §Integration ниже.  
**Запрет:** не писать код `src/`.

---

## Контекст (вставь в начало любого сообщения агенту)

```
Ты — арт-агент игры Neon Bullet (slug: neon-bullet).
Стек визуала: top-down neon noir, palette:
BG #07060C, Floor #12101A, Wall #1C1830, Pink #FF2BD6, Cyan #00F0FF,
Purple #8B5CFF, Danger #FF3B4A, Blood VFX #FF4FA3, Text #F5F2FF.
Стиль: hard silhouettes, 2–3 shade bands, stylized magenta blood (no gore),
80s retro-futurism. НЕ делай generic purple-on-white AI aesthetic.
Все ассеты game-ready, transparent where needed.
Интеграция: public/assets/textures/...
```

---

## JOB A — Key art

**Промпт:**
```
Key art poster for HTML5 game Neon Bullet: masked mercenary cyan-pink glowing mask, black jacket, neon rainy alley, magenta and cyan signs, wet asphalt, Hotline Miami energy but ORIGINAL character, stylized non-gory, cinematic 1920x1080, high contrast, no text no logo no UI, dark void corners
```

**Выход:** `public/assets/textures/keyart/keyart_neon_bullet.png`  
**Также:** `refs/art/keyart_ref.png` (копия для референса)

---

## JOB B — Environment moods (референсы биомов)

Прогони 4 промпта → `refs/art/env_<biome>.png`:

1. **apartment:** top-down neon noir apartment crime scene, dark carpet, neon wall trim, sofa silhouette, readable for game level moodboard
2. **club:** top-down neon nightclub interior, dance floor glow cyan pink, bar counter, VIP booths moodboard
3. **parking:** top-down night parking garage, cars as cover blocks, cyan strip lights, wet concrete
4. **warehouse:** top-down industrial warehouse neon accents, long aisles, crates cover, magenta emergency lights

---

## JOB C — Tileset production

**Промпт:**
```
32x32 game tileset sheet neon noir: floors walls doors cover furniture autotile candidates, dark purple base #1C1830, emissive pink #FF2BD6 and cyan #00F0FF edges, packed grid, pixel-crisp HD-pixel hybrid, no characters, no text
```

**Выход:**  
- `public/assets/textures/tiles/tile_apt_sheet.png`  
- `public/assets/textures/tiles/tile_club_sheet.png`  
- `public/assets/textures/tiles/tile_park_sheet.png`  
- `public/assets/textures/tiles/tile_wh_sheet.png`

Каждый лист: минимум floor×4, wall autotile set, door open/closed, 3 cover props.

---

## JOB D — Characters & enemies (static hero frames + sheet bases)

См. также `SPRITE_ANIM_PROMPTS.md` для анимаций. Здесь — hero poses / turnarounds:

```
Top-down orthographic 32x32 character design sheet: neon masked mercenary, idle pose, readable weapon holster, cyan mask, black outfit, transparent background, game sprite
```

```
Top-down orthographic enemy design sheet: thug bat, gunner pistol, brute thick silhouette, distinct read at 32px, neon noir wardrobe, transparent, no gore
```

**Выход refs:** `refs/art/char_player_turnaround.png`, `refs/art/enemies_roster.png`  
**Production sheets:** по `SPRITE_ANIM_PROMPTS.md`

---

## JOB E — Weapons & VFX stills

```
Top-down pixel weapons icons knife pistol shotgun SMG, 32x32, neon accents, transparent, crisp edges
```

```
Stylized pixel VFX stickers: magenta blood splat, cyan muzzle, sparks, combo star burst, transparent
```

**Выход:** `public/assets/textures/weapons/`, `public/assets/textures/vfx/`

---

## JOB F — UI kit art

```
Neon noir game UI kit on #07060C: buttons primary/secondary, hearts, ammo frame, pause, rank badges S A B C in neon, shop card frame, rewarded button with play glyph, 9-slice friendly pads, magenta cyan accents, no phone mockup
```

**Выход:** `public/assets/textures/ui/ui_kit.png` + slices в `refs/ui/`

---

## DoD арта

- [ ] Palette соблюдена (±5 RGB на emissive ок)
- [ ] Нет реалистичного gore
- [ ] Все production PNG в контрактных путях
- [ ] Key art без текста
- [ ] Tiles читаются как top-down game tiles, не isometric

## Запреты

- Не менять DESIGN_LLM palette без эскалации
- Не генерировать mid-fight HUD в key art
- Не класть файлы вне `games/neon-bullet/`
