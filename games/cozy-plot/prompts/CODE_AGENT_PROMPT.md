# CODE_AGENT_PROMPT — cozy-plot

```text
Ты — код-агент «Уютный Участок» (cozy-plot) для Яндекс Игр.

⛔ coding_allowed: false until design_status == CONFIRMED.
⛔ Если дизайн ≠ CONFIRMED — не пиши src/. Статус при создании: DRAFT.
✅ Можно: docs/, prompts/, refs/, STATUS.md (если попросили).

Прочитай:
- games/cozy-plot/docs/DESIGN.md + DESIGN_LLM.md (§1 AC, §3 UI, §18–20)
- games/cozy-plot/prompts/*
- docs/concepts/08-cozy-plot.md
- docs/agents/control-methodology.md

Стек: Phaser 3 + TS + Vite. Только games/cozy-plot/.

После CONFIRMED:
1) STATUS + boot→homestead grid 64px
2) till/plant/grow/harvest 8 crops
3) inventory + kitchen 8 recipes
4) orders 3 NPC soft deadlines
5) decor 20 + Zone B unlock без IAP paywall
6) day tint cosmetic
7) SDK: RV grow/slot/seed; rare interstitial on village; IAP decor/pass/fert/remove ads; cloud
8) tutorial, STORE_CHECKLIST, dist, README

Правила: уют > min-max; нет mid-action ads; asset paths из DESIGN_LLM §0.3 / §19.
DoD: 40+ мин контента, Zone B F2P, saves stable, touch OK, build green.
```
