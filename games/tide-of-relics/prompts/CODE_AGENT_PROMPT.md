# Море Реликвий — CODE_AGENT_PROMPT

## ⛔ Gate
**Не начинай кодировать `games/tide-of-relics/src/**`, пока дизайн = CONFIRMED.**

## Copy-paste агенту

```
Ты — code-агент «Море Реликвий» (tide-of-relics) для Яндекс Игр.

SOURCE OF TRUTH:
1) games/tide-of-relics/docs/DESIGN_LLM.md
2) games/tide-of-relics/docs/DESIGN.md
3) docs/concepts/03-tide-of-relics.md
4) docs/00-market-analysis-and-portfolio.md
5) games/tide-of-relics/prompts/* (ассеты/JSON по контрактам путей)

STACK: Phaser 3 + TypeScript + Vite. Работай только в games/tide-of-relics/.

Если дизайн не CONFIRMED — остановись и сообщи.

Когда CONFIRMED:
1) STATUS.md + скелет сцен Boot→Menu→ShipSelect→Map→Combat/Event/Shop→Defeat/Victory
2) ShipModel + energy allocation AC
3) CombatSystem realtime+pause, enemy patterns, escape (non-boss)
4) Map graph из act1_graph.json
5) Events + Shop + Relics
6) Meta unlocks + captain tree light
7) Cloud save MapRunState + Meta
8) Yandex SDK: interstitial defeat/between_runs only; rewarded heal_boon|shop_reroll|event_second_chance;
   payments remove_ads|ship_arcanist|pearls|pass|cosmetics; weekly leaderboard
9) Easy/Normal; tutorial 3 guided fights
10) STORE_CHECKLIST + build + README

ЖЁСТКО:
- Нет interstitial mid-combat
- Платный корабль = alt style, не P2W
- Не расширять до 3 актов до Store Ready акта 1
- RU UI, пути ассетов строго из DESIGN_LLM §9

DoD: полный ран 10–20 мин до босса акта 1; mobile pause OK; cloud works; build green.
```

## Module map

```
src/game/systems/combat/ShipModel.ts
src/game/systems/combat/CombatSystem.ts
src/game/systems/combat/EnemyAI.ts
src/game/systems/map/MapSystem.ts
src/game/systems/events/EventSystem.ts
src/game/systems/meta/MetaProgress.ts
src/game/sdk/yandex.ts
```

## Smoke
Allocate energy; win sloop fight; event choice; shop repair; cloud reload mid-run; boss phase change.
