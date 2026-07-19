# LEVEL_PROMPTS — auto-towers

**Роль:** волны/пути/боссы.  
**Читать:** DESIGN_LLM §2 recipes R1–R7, §13–14.  
**Ground truth:** `refs/levels/layout-main.png`.  
**Выход:** `refs/levels/` сейчас; `public/assets/data/` после CONFIRMED.  
**coding_allowed:** false until CONFIRMED.

## Path grammar
- 8–14 waypoints; min corner radius 80px  
- Slots 40–60px off path, no overlap  
- Export `path_chN.json`: `{points, slots}`  
- Portrait safe: path not under HUD top 96px / bottom 140px shop  
- Visual align to `refs/levels/layout-main.png`

## Wave authoring — must include recipes
| Recipe | Source |
|--------|--------|
| `ch1_w1_swarm` | R1 |
| `ch1_w3_armor` | R2 |
| `ch1_w8_fly` | R3 |
| `ch1_w10_boss` | R4 |
| `shop_reroll` economy note | R5 |
| `syn_hunt2` placement test | R6 |
| `ch2_scaled` | R7 |

Use DESIGN_LLM §13 Ch1 table as baseline.  
Ch2: ×1.25 HP, add flyer earlier, boss_ruin.  
Ch3: ×1.5 HP, boss_crown add spawns.

```json
{"wave":1,"entries":[{"enemy":"swarm","count":8,"intervalMs":500}],"clearBonus":20}
```

## Boss cards
| Ch | Boss | Mechanic script |
|----|------|-----------------|
| 1 | Grove Titan | tank only |
| 2 | Ruin Warden | at 50% armor+10 for 5s |
| 3 | Crown Horror | every 20% HP spawn swarm×6 |

## Path sketch prompt
```
Top-down fairy tale winding path level layout matching refs/levels/layout-main.png chapter 1, build slots as circles beside path, portrait, soft colors, no text
```

## Balance LLM
```
Симулируй главу 1 со статами DESIGN_LLM. Цель winrate 55–70% random-shop бота.
Править HP врагов ±15% макс. Не добавлять freeplace building.
```

## Acceptance
- [ ] 30 waves numeric
- [ ] No unfair full-block path
- [ ] Chapter session 8–12 мин estimate
- [ ] ≥5 concrete recipes exported
