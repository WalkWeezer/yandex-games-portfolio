# LEVEL_PROMPTS — night-courier

**Роль:** spawn patterns / districts / daily.  
**Читать:** DESIGN_LLM §2 (recipes R1–R7), §13, §16.  
**Ground truth:** `refs/levels/layout-main.png`.  
**coding_allowed:** false until CONFIRMED.

## Pattern bible → `refs/levels/patterns.md`
Скопируй таблицу DESIGN_LLM §13. Для каждого pattern:
- ASCII 3-lane diagram (legend §2.5)
- length meters / unlockDist
- parcel yes/no
- validation: safe lane OR hop option

## Concrete recipe pack (must author all)
| ID | Notes |
|----|-------|
| `teach_gap_parcel` | R1 early |
| `teach_delivery` | R2 gate |
| `hop_intro` | R3 |
| `weave_mid` | R4 |
| `fragile_pressure` | R5 |
| `late_dense` | R6 |
| `post_continue` | R7 forced after RV |

## Director
```
brackets:
  0-200: easy gaps + parcels teach
  200-800: weave + rush + drone intro
  800+: dense but never block_all
after_continue: gap_mid ×2 forced + clearFront(400)
```

## Districts
Downtown / Harbor / Campus — visual only; same pattern pool.

## Daily templates → `refs/levels/daily_templates.json`
distance_500, deliveries_10, near_miss_5, rush_3, combo_8, fragile_2.

## Viz prompt
```
Diagram-like top view three lanes endless runner segment matching refs/levels/layout-main.png, obstacles as simple blocks, one safe lane highlighted, neon night colors, no text
```

## Fairness LLM
```
Проверь patterns night-courier: always ≥1 safe lane или hop. Найди unfair комбинации dense_gap + drone same z. Предложи blacklist.
```

## Acceptance
- [ ] No block_all
- [ ] Continue fairness documented
- [ ] Daily goals ≥3
- [ ] Speed/density curve written
- [ ] ≥5 concrete recipes exported
