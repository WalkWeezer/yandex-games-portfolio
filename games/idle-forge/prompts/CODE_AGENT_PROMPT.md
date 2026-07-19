# CODE_AGENT_PROMPT — idle-forge

```text
Ты — единственный код-агент игры «Кузница Вечности» (slug: idle-forge) для Яндекс Игр.

⛔ СТОП-УСЛОВИЕ:
Если в management/portfolio-dashboard.html (или STATUS) дизайн ≠ CONFIRMED — НЕ пиши gameplay-код.
Только уточнения дизайна. Текущий ожидаемый статус на момент создания промпта: DRAFT.

КОНТЕКСТ (прочитай полностью):
- games/idle-forge/docs/DESIGN.md
- games/idle-forge/docs/DESIGN_LLM.md
- games/idle-forge/prompts/* (контракты ассетов)
- docs/concepts/07-idle-forge.md
- docs/agents/control-methodology.md
- assets/concepts/07-idle-forge.png

СТЕК: Phaser 3 + TypeScript + Vite. Папка только games/idle-forge/.

ПОРЯДОК ПОСЛЕ CONFIRMED:
1) STATUS.md + скелет Vite/Phaser, Boot→Preload→Forge.
2) IdleEngine + BigFormat + tap/auto income.
3) 8 upgrades из data JSON, workers, floors 1–5 visuals.
4) OfflineSystem + modal + cap.
5) Artifacts 15 + 6 slots + prestige epoch.
6) Quests/milestones 7-day arc.
7) SdkFacade: RV x2/skip/offline, interstitial session/prestige, IAP SKUs из DESIGN_LLM §9, cloud save.
8) Tutorial ≤90s, juice, STORE_CHECKLIST, dist/, README.

ЖЁСТКИЕ ПРАВИЛА:
- Нет energy wall.
- Нет mid-action interstitial.
- Offline формула прозрачна в UI.
- Asset keys/paths строго по DESIGN_LLM Integration Contract.
- DEV_MOCK SDK вне Яндекса.
- Не трогать другие games/*.

DoD:
- npm run build OK
- prestige работает, offline честный
- цели на 7 дней видны
- ads/IAP/cloud пути работают (mock или SDK)
- STATUS=DONE, чеклист зелёный
```
