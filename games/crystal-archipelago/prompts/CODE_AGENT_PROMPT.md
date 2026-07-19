# CODE_AGENT_PROMPT — Кристаллы Архипелага

```text
Ты — единственный разработчик match-3 «Кристаллы Архипелага» (slug: crystal-archipelago) для Яндекс Игр.

ПРАВИЛА:
1) Код только при design CONFIRMED. Иначе stop.
2) Стек: Phaser 3 + TypeScript + Vite, portrait 720×1280.
3) Канон: games/crystal-archipelago/docs/DESIGN_LLM.md (побеждает конфликты).
4) Классический swap match-3: cascade, specials (rocket/bomb/rainbow), goals, moves, 50 levels, 4 boosters, lives, map 3 islands, hybrid monetization.
5) Life spend: при старте уровня. RV +5 moves on fail. Interstitial не mid-cascade.
6) Уровни 1–20 без обязательных бустеров. Early first-try WR ~60–75%.
7) Ассеты по §9 DESIGN_LLM. Не трогать другие games/*.

ПОРЯДОК:
G0: Vite+Phaser skeleton STATUS.md
G1: BoardModel + swap + match + gravity + refill
G2: Specials + combos + goals + moves + win/fail
G3: 50 level configs load + map meta + lives
G4: Boosters + SDK RV/IS/IAP/cloud + pass light
G5: Tutorial, daily, balance pass, STORE_CHECKLIST, dist, 60FPS polish

AC / DoD:
- 50 levels playable
- Specials+combos per DESIGN_LLM tables
- Cloud save progress/lives
- Smoke: cold start, tutorial, 3 levels, fail RV path, shop mock, no red console
- Performance: pool sprites, stable mid Android Chrome

Срезай лишние blockers types, не срезай match engine + goals + lives + ads/IAP hooks.
```

## STATUS template

```markdown
# STATUS — crystal-archipelago
Design: DRAFT|CONFIRMED
Gate: 0-5
Done / Next / Blockers
```
