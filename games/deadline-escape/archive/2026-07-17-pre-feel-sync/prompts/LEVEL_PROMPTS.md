# Работник месяца — LEVEL_PROMPTS

**Канон:** `DESIGN_LLM.md` §4.  
**Выход:** `public/assets/levels/flr_*.json`, `refs/levels/`, `src/data/floors.json` (манифест после кода / можно заготовить JSON data).

## Контекст
```
Top-down office tilemaps 32px. Layers: ground, props, collision, meta.
Objects: playerSpawn, bossSpawn, hideZone, toiletSafe, puSpawn, collectibleSpawn,
distractCooler, distractElevator, distractPrinter.
MVP floors: flr_openspace_01, flr_openspace_plus_01, flr_accounting_01.
Play: loops around cubicle islands; 2–3 hide zones; distractions on path edges;
collectibles on risky mid-lanes. Portrait camera.
```

## JOB — Floor cards

### flr_openspace_01
```
size 50x40, hideZones 3, distractions 3 types x1+, puSpawns 4, toiletSafe 1,
sightlines wide, escalate warm_up→hr_intro→crossfire
median catch target 40s new player
```

### flr_openspace_plus_01
```
fewer hides (2), wider chase lanes, faster escalation +10%, denser collectibles
```

### flr_accounting_01
```
maze cubicles, great LOS breaks, shorter sight, boss_hr favored, size 46x36
```

## LLM prompt template
```
Спроектируй офисный escape-уровень id=flr_openspace_01 для игры Работник месяца.
Grid 50x40, ASCII (# wall, C cubicle, . floor, H hide, T toilet, P player,
M boss spawn, K cooler, E elevator, R printer, O pto collectible, U pu spawn).
Требования: 2 кольцевых маршрута, 3 hide, не тупики без выхода, touch-friendly corridors ≥2 tiles.
Верни ASCII + список object coordinates.
```

## Validation
- [ ] Нет 1-tile choke >6 length  
- [ ] toiletSafe reachable in <4s from center  
- [ ] Boss spawn ≥12 tiles from player  
- [ ] At least one distraction per quadrant  

## Paths
```
public/assets/levels/flr_openspace_01.json
public/assets/levels/flr_openspace_plus_01.json
public/assets/levels/flr_accounting_01.json
```

## Запреты
Procedural-only MVP; stealth mandatory puzzles; horror lighting.
