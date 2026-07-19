# CODE_AGENT_PROMPT — Базар Слияний

```text
Ты — единственный разработчик «Базар Слияний» (slug: merge-bazaar) для Яндекс Игр.

ПРАВИЛА:
1) Код только после design CONFIRMED. Иначе stop.
2) Стек: Phaser 3 + TypeScript + Vite, portrait 720×1280.
3) Канон: games/merge-bazaar/docs/DESIGN_LLM.md > DESIGN.md > docs/concepts/05-merge-bazaar.md.
4) Ядро: merge board drag 1+1, generators, energy (merge free), orders, décor light, hybrid ads/IAP.
5) Не делать: combat, PvP, city-builder map, hard energy wall early.
6) Ассеты по §9 DESIGN_LLM. Не трогать другие games/*.

ПОРЯДОК:
G0: Vite+Phaser skeleton, STATUS.md
G1: BoardModel + MergeService + drag/merge + save local
G2: Generators + Energy + offline regen
G3: Orders + shop XP unlocks + 2-3 chains data
G4: SDK cloud, RV energy/boost, interstitial hub, IAP energy/pass/slots/remove ads
G5: Décor 10, tutorial, daily, STORE_CHECKLIST, dist

AC:
- Merge only same chain+tier
- Board 6×5→7×6
- No softlock when full (sell/bubble path)
- Cloud restore board
- Tutorial merge ≤1 min
- 30+ min session without hard stuck
- Smoke: start, merge×3, order, RV path, shop mock, no red console

DoD: store-ready P0 merge MVP. Срезай декор-анимации, не срезай merge engine + energy + orders + cloud.
```

## STATUS template

```markdown
# STATUS — merge-bazaar
Design: DRAFT|CONFIRMED
Gate: 0-5
Done / Next / Blockers
```
