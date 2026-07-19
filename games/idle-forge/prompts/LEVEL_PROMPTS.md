# LEVEL_PROMPTS — idle-forge

**Роль:** контент/баланс/«уровни» (этажи, milestones, quests).  
Idle не имеет классических уровней — контент = floors + milestone curve + quest recipes.  
Пиши JSON в `public/assets/data/` **только после CONFIRMED**; сейчас — таблицы в `refs/levels/`.

## L1 — Floor content cards
Для каждого этажа 1–5 создай карточку:
```
floor_id, name_ru, unlock_rule, mult_effects[], ambient_color, bg_asset, music_stem, worker_tint
```

## L2 — Milestone table M1–M20
Правило кривой lifetime ore:
```
M(n) = 50 * 10^((n-1)/2)   # tune in sheet
rewards rotate: gems 5–50, artifact_fixed, cosmetic_fx
```
Выгрузи `refs/levels/milestones.csv`.

## L3 — Daily quest recipes
Пулл из 12 шаблонов, ежедневно 3:
1. Добудь {X} руды  
2. Купи {N} апгрейдов  
3. Найми рабочего  
4. Скрафти слитки {X}  
5. Открой сундук  
6. Забери оффлайн  
7. Экипируй артефакт  
8. Достигни этажа {F}  
9. Сделай {N} тапов  
10. Потрать {X} руды  
11. Получи crit ×{N}  
12. Зайди N дней подряд (login)

## L4 — Prestige thresholds
| Epoch → | Lifetime ore need |
|---------|-------------------|
| 0→1 | 5e6 |
| 1→2 | 5e8 |
| 2→3 | 5e10 |
| n→n+1 | prev * 50 |

## L5 — Economy validation prompt (for balance LLM)
```
Ты баланс-дизайнер idle-forge. Проверь, что F2P достигает первого prestige за 45–90 минут активной игры без RV.
Используй upgrades.json формулы. Верни: таблицу ore/sec по минутам 0/10/30/60/90 и список правок costPow (±0.02 max).
Не предлагай energy system.
```

## L6 — Art direction for floor thumbnails
```
Square map thumbnail 256x256, dwarven floor [N] iconographic, [theme], cozy dark fantasy, no text
```
→ `refs/levels/thumb_floor_0N.png`

## Acceptance
- [ ] 5 floors documented
- [ ] 20 milestones numeric
- [ ] 12 quest templates
- [ ] prestige curve written
- [ ] no paywall before floor 2
