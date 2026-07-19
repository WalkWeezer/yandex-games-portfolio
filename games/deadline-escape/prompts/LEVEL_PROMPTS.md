# Работник месяца — LEVEL_PROMPTS

**Канон:** `DESIGN_LLM.md` §3, feel `FEEL_DEMOS["deadline-escape"]`.  
**Не писать `src/`.** Forbidden: hideZones, LOS cones as primary, free-move chase maps.

## Grammar

```
Cell: 0 floor · 1 desk · 2 wall · 3 plant · 4 cooler
Base grid: 7 cols × 9 rows
Growth: every 25 floors alternate +1 col or +1 row
Border: walls
Interior: desks block player; aisles must stay connected
Spawn: threats start OFF map and enter from edges
Fairness: hasEscape — player must have a walkable path away from new threat entry
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
2222222
2.....2
2.1.1.2
2.....2
2.1.3.2
2.....2
2.1.1.2
2..4..2
2.....2
2222222
```

(Adjust to seeded generator; keep connectivity.)

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
