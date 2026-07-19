# Работник месяца — CODE_AGENT_PROMPT

## ⛔ Gate
Не пиши `games/deadline-escape/src/**` пока дизайн **CONFIRMED**.

## Copy-paste агенту

```
Ты — code-агент игры «Работник месяца» (deadline-escape) для Яндекс Игр.

Читай:
1) games/deadline-escape/docs/DESIGN_LLM.md
2) games/deadline-escape/docs/DESIGN.md
3) docs/concepts/02-deadline-escape.md
4) docs/00-market-analysis-and-portfolio.md
5) prompts/* для путей ассетов

STACK: Phaser 3 + TS + Vite. Только games/deadline-escape/.

Если не CONFIRMED — стоп.

Если CONFIRMED:
1) STATUS.md + скелет сцен Boot→Menu→Hub→Run→Caught→Result→Shop
2) PlayerController + ChaseAI (3 босса) + LOS/hide
3) Distractions + power-ups + score
4) 3 этажа tilemap
5) Meta upgrades + cloud Progress
6) Yandex SDK: interstitial caught/run_end, rewarded revive|x2|temp_gadget,
   payments remove_ads|starter_pack|skins, leaderboards, cloud; sticky optional hub
7) Tutorial без текста (arrows)
8) Portrait controls + boss offscreen arrows
9) STORE_CHECKLIST + build + README

Правила: нет mid-chase interstitial; RV opt-in; fair upgrades; RU UI; пути ассетов из DESIGN_LLM.

DoD: 3 этажа играбельны, revive RV, рекорд в cloud, build OK.
Сделай смешно и читаемо за 10 секунд.
```

## Modules skeleton
`RunScene`, `PlayerController`, `ChaseAI`, `DistractionSystem`, `PowerUpSystem`, `ScoreSystem`, `UpgradeService`, `sdk/yandex.ts`, data JSON.

## Smoke
Catch→restart; RV revive i-frames; score save; floor unlock.
