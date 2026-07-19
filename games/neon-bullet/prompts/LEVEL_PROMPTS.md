# Neon Bullet — LEVEL_PROMPTS

**Назначение:** level-агент (Tiled JSON + encounter placement).  
**Канон:** `DESIGN_LLM.md` §4.  
**Выход:** `public/assets/levels/lvl_*.json` + превью в `refs/levels/`.

---

## Контекст

```
Neon Bullet levels: Phaser Tilemap JSON from Tiled, tile 32x32.
Layers: ground, props, collision, meta (objects).
Object types: playerSpawn, enemySpawn{enemyId}, pickup{pickupId}, door, extractZone.
alertMode default: "radius".
Biomes: apt, club, park, wh, boss.
Difficulty tiers T1–T3 per DESIGN_LLM.
Проходимо на touch; no softlock doors.
```

---

## JOB — Generate mission pack MVP (12)

Для каждой миссии создай:

1. Tiled map JSON  
2. `refs/levels/<id>_preview.png` (screenshot или paint overview)  
3. Короткую карточку рецепта в комментарии JSON `properties.designNotes`

### Шаблон карточки (копируй)

```
LEVEL CARD
id: lvl_apt_01
biome: apartment
tier: T1
rooms: 3
enemyPoints: 4
recipes: tutorial_corridor + patrol_cross
parTimeSec: 45
pickups: pickup_ammo x1
teach: move + knife OR pistol
AC: clearable without taking damage by skilled player
```

### Список обязательных ID

`lvl_apt_01..03`, `lvl_club_01..03`, `lvl_park_01..02`, `lvl_wh_01..03`, `lvl_boss_01`

### Encounter recipe macros

```
recipe_ambush: 2 gunner behind cover near entrance + 1 thug
recipe_patrol_cross: 3 thug crossing waypoints
recipe_brute_guard: 1 brute + 1 gunner sightline
recipe_open_killbox: low cover, 4 gunner
recipe_tutorial: 2 thug, wide corridors, no gunner
recipe_boss_maskmaker: arena pillars, adds wave thug x4 at 50% HP
```

---

## Промпт для LLM-level дизайнера (текстовые layouts)

```
Спроектируй top-down уровень Neon Bullet id=lvl_club_02.
Ограничения: grid 48x32 tiles, 5 rooms, enemyPoints=9, coverDensity=med,
recipes: ambush + patrol_cross, neon club biome.
Верни: ASCII карты (# wall, . floor, D door, P player, T thug, G gunner, B brute, A ammo),
список roomId bounds, waypoints для патрулей, parTime 70.
Не блокируй проход ключами. Обеспечь 2 фланговых пути в центральную комнату.
```

Повтори для каждого ID, меняя tier/biome.

---

## Tile placement rules (агент обязан)

- Стены только на `collision`
- Player spawn не в enemy LOS первой комнаты ближе 6 тайлов (T1) / 4 (T2+)
- Минимум 1 pickup ammo на миссиях с gunner≥3
- Boss arena: открытый центр + 4 pillar cover

---

## Difficulty validation checklist

- [ ] T1: deaths expected ≤2 для новичка  
- [ ] T3: требует peek & clear  
- [ ] S-rank возможен без RV  
- [ ] Нет узких 1-tile коридоров длиннее 8 (touch pain)

---

## Integration paths

```
public/assets/levels/lvl_apt_01.json
...
public/assets/levels/lvl_boss_01.json
src/data/missions.json  # манифест id→file, unlock, parTime, biome
```

`missions.json` schema:

```json
{
  "id": "lvl_apt_01",
  "file": "lvl_apt_01.json",
  "biome": "apt",
  "tier": 1,
  "parTimeSec": 45,
  "unlockAfter": null,
  "leaderboard": "lb_district_apt"
}
```

---

## DoD

- [ ] 12 JSON валидны для Phaser tilemap  
- [ ] Каждый уровень имеет designNotes  
- [ ] Манифест missions.json полный  
- [ ] Превью в refs/levels  

## Запреты

- Случайная генерация без рецептов в MVP  
- Стелс-пазлы обязательные  
- Уровни >64×48 без причины
