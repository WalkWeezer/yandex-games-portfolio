# LEVEL_PROMPTS — Базар Слияний

> Контент: цепочки, заказы, уровни лавки, экономика. Канон: DESIGN_LLM §3, §10.  
> Выход: `refs/levels/*.json` → `public/assets/data/`.

## Prompt — chains.json

```text
Сгенерируй chains.json для merge-tycoon Базар Слияний.
3 цепочки: fruit (10 tiers), potion (10), plant (8).
Поля tier, id item_{chain}_{tier}, name_ru, sellSoft (формула round(1.6^(tier-1))), unlockPlayerLevel.
Визуальные имена по key-art лестнице (яблоко→золотая чаша; флакон→лунный кувшин; росток→spirit bonsai).
```

## Prompt — generators.json

```text
2-3 генератора с chargesMax, cooldownSec, energyCostPerTap=1, spawnTable весов в сторону tier1-2.
Анлок по shop level.
```

## Prompt — orders.json (20)

```text
20 заказов с нарастающей сложностью.
Early: 1 item tier2-3. Mid: tier4-5 or two items. Late: tier6+ or multi-chain.
npc, needs[], rewardSoft, rewardXp, timeBonusSec.
Русские короткие flavor-строки.
```

## Prompt — shop-levels.json

```text
Levels 1-20: xpToNext, unlocks[] (board_7x6, gen_potion, chain_plant, stash, decor_slot...).
Pacing: board upgrade ~level 8, third chain ~level 6, stash ~level 5.
```

## Prompt — economy.json

```text
energy cap/regen, RV packs, IAP SKUs, pass xp curve.
Validate: first 30 minutes F2P playable without mandatory IAP; merge never costs energy.
```

## Prompt — tutorial script

```text
JSON steps T1-T5: merge apples, see result, tap gen, complete order, explain energy.
Each tip_ru ≤ 50 chars. Board preset with 2 apples adjacent.
```

## Board preset grammar

```json
{
  "id": "tutorial_board",
  "cols": 6,
  "rows": 5,
  "cells": [
    { "x": 2, "y": 2, "itemId": "item_fruit_01" },
    { "x": 3, "y": 2, "itemId": "item_fruit_01" },
    { "x": 1, "y": 1, "genId": "gen_fruit" }
  ]
}
```

## Acceptance
- [ ] 3 chains complete naming  
- [ ] ≥26 tier items  
- [ ] 20 orders  
- [ ] 20 shop levels  
- [ ] tutorial preset  
- [ ] economy F2P PASS  

## Delivery paths
`refs/levels/chains.draft.json`, `generators.draft.json`, `orders.draft.json`, `shop-levels.draft.json`, `economy.draft.json`, `tutorial.draft.json`
