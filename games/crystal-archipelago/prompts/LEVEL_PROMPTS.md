# LEVEL_PROMPTS — Кристаллы Архипелага

> 50 уровней + индекс + daily. Канон: DESIGN_LLM §3.  
> Выход: `refs/levels/` → `public/assets/data/levels/`.

## Prompt — batch 50 levels

```text
Сгенерируй 50 match-3 level JSON для Crystal Archipelago (Phaser).
Schema: id lvl_{island}_{nn}, island 1..3, board w/h/mask strings, spawnColors 5, moves, goals[], blockers[], difficulty 0..4, starMoves[3], tutorial flag.
Кривая: 1-5 trivial no blockers; 6-15 stone1; 16-30 vine/stone2; 31-50 shells mix.
First-try WR intent: early 70%+, mid 60%+, late 50%+.
Levels 1-20 must be solvable without boosters.
Цели: collect_color / break_blocker; разнообразие цветов.
Маски: mostly full 8x8 early; shaped boards from lvl 12+.
Русские notes опционально.
Верни index.json список id + files.
```

## Prompt — tutorial levels 1–3

```text
lvl_01_01 scripted: forced match swap cells highlighted.
lvl_01_02 teach match-4 rocket.
lvl_01_03 teach goal collect.
Include hint cells coordinates.
```

## Prompt — daily template

```text
daily_template.json: modifiers fewer_moves, extra_stone, color_focus.
Seed by YYYY-MM-DD. Rewards soft + pass xp.
```

## Prompt — balance audit

```text
Проанализируй 50 levels: moves vs goals estimate, flag walls (need boosters before lvl20), suggest moves+/-.
Output markdown table PASS/FAIL per 10-level band.
```

## Example level

```json
{
  "id": "lvl_01_07",
  "island": 1,
  "index": 7,
  "board": {
    "w": 8,
    "h": 8,
    "mask": [
      "11111111",
      "11111111",
      "11111111",
      "11111111",
      "11111111",
      "11111111",
      "11111111",
      "11111111"
    ]
  },
  "spawnColors": ["red", "blue", "green", "purple", "yellow"],
  "moves": 28,
  "goals": [{ "type": "collect_color", "color": "red", "count": 20 }],
  "blockers": [{ "x": 3, "y": 3, "type": "block_stone", "hp": 1 }],
  "difficulty": 1,
  "starMoves": [12, 6, 0]
}
```

## Island split

| Island | Levels | Theme BG |
|--------|--------|----------|
| 1 Lagoon | 01–18 | bg_island_lagoon |
| 2 Temple | 19–36 | bg_island_temple |
| 3 Peaks | 37–50 | bg_island_peaks |

## Acceptance
- [ ] 50 JSON + index  
- [ ] Tutorial 1–3  
- [ ] Curve audit PASS early  
- [ ] No booster-required before 21  
- [ ] Chests every 5 in map meta file  

## Delivery
```text
refs/levels/index.json
refs/levels/lvl_01_01.json ... lvl_03_14.json
refs/levels/daily_template.json
refs/levels/BALANCE_AUDIT.md
```
