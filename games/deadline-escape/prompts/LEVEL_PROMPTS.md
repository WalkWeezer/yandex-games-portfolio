# Работник месяца — LEVEL_PROMPTS

**Канон:** `DESIGN_LLM.md` §3, feel `FEEL_DEMOS["deadline-escape"]`.  
**Не писать `src/`.** Forbidden: hideZones, LOS cones as primary, free-move chase maps.

## Grammar

```
Cell: 0 floor · 1 desk · 2 wall · 3 plant · 4 cooler · 5/6 desk2×1 · 7 window
Play grid: 7×9 (+growth every 25 floors)
Fog band: always +1 cell each side (player cannot walk; FoW gradient outer→black)
Decor: wall/window segments on fog frame (beauty obstacles, seeded like furniture)
Required sprites: tile_wall_*/window_*/wall_end_*(ends=corners)/corner_* (+ floor/desk/plant/cooler/fog)
Interior: desks/props in play only; aisles connected
Spawn: from open fog-band edge cells; visible under FoW
Hit: body overlap (px/py), not shared cell
Fairness: hasEscape on play floor
```

## JOB A — Floor card template

```yaml
floor: N
cols: 7+|growth
rows: 9+|growth
seed: floor_N
biomes_tint: openspace|accounting|it|board  # visual only
props: desks, plants, cooler
encounters:
  - kinds_unlocked: [from KIND_UNLOCK where from <= N]
  - max_threats: 3 + floor((N-1)/15)
  - phase_pressure: morning|work|rush|overtime
notes: no hide zones; no soft-lock pockets
```

## JOB B — ASCII sketch (example floor 1)

```
(fog band 1 — example; walls frame play)
.2.7.2.
2.....2
..1.1..
.......
..1.3..
.......
..1.1..
...4...
2.....2
.2...7.
```

(Outer `.` = fog floor for spawn silhouettes; `2`/`7` = decor. Play aisles stay connected.)

## JOB C — Encounter recipes (not tint-only)

| Floor band | Signature | Encounter focus |
|------------|-----------|-----------------|
| 1–2 | Open aisles | HR weave only |
| 3–8 | More desks | + director ghost |
| 9–16 | Longer corridors | + urgent dash / looker peek |
| 17–24 | Guarded lanes | + patrol / meeting hold |
| 25+ | Dense props | + account report zones, later pincer/IT/wide |

## JOB D — Layout feel ref

Compose / illustrate → `refs/levels/layout-feel.png` (see ART_PROMPTS JOB H).  
Playable truth remains the feel demo generator.

## DoD

- [ ] No hideZones in any card  
- [ ] Cap and unlock match DESIGN.md §5  
- [ ] Escape path check described  
