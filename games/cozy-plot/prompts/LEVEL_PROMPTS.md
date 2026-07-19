# LEVEL_PROMPTS — cozy-plot

**Роль:** контент/баланс/зоны. «Уровни» = zones + order arc + rep milestones + decor sets.  
**Ground truth:** `refs/levels/layout-main.png`.  
**Читать:** DESIGN_LLM §2 recipes R1–R7.  
**coding_allowed:** false until CONFIRMED.

## L1 — Zone cards → `refs/levels/`
### zone_a.md
- Size walkable 12×10, soil 4×3 at (3,4)
- House (9,2), pier (1,8), chicken pen (9,6)
- Unlock: start
- Ambient: birds day

### zone_b.md
- Across bridge east, soil 4×3
- Unlock: rep≥80 AND coins≥200 (NO IAP)
- Unique decor: lantern_river, boat_dock

## L2 — Order arc 15 templates
Progress: raw → single cook → multi-ingredient → timed soft rush (still 60% late pay).
Export `refs/levels/orders_15.json` matching DESIGN_LLM schemas.

## L3 — Reputation milestones
| Rep | Unlock |
|-----|--------|
| 10 | mailbox dialogue |
| 20 | chicken |
| 35 | kitchen shows cheese/omelet |
| 50 | goat |
| 80 | Zone B |
| 120 | firefly_jar decor |

## L4 — Layout sketch prompt
```
Top-down cozy farm layout sketch zone A, river bottom-left, 4x3 plots center-left, cottage right, clear paths, soft pastel, labeled only with shapes not text
```

## L5 — Balance LLM
```
Ты баланс-дизайнер cozy-plot. F2P открывает Zone B за 40–90 минут без IAP и без energy wall.
Мягкий дедлайн заказов 4ч → late 60% coins.
Верни правки цен семян/наград заказов таблицей. Не добавляй stamina.
```

## Acceptance
- [ ] Zone B без paywall
- [ ] 15 orders / 20 decor / 8 crops documented
- [ ] First session recipe R1 playable on paper
