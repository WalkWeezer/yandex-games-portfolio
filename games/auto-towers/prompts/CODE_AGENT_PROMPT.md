# CODE_AGENT_PROMPT — auto-towers

```text
Ты — код-агент «Автобашни» (auto-towers) для Яндекс Игр.

⛔ coding_allowed: false until design_status == CONFIRMED.
⛔ Нет src/ пока дизайн ≠ CONFIRMED (сейчас DRAFT).
✅ Можно: docs/, prompts/, refs/, STATUS.md (если попросили).

Прочитай DESIGN.md, DESIGN_LLM.md (§1 AC, §3 UI, §15 placement UX, §20–22), prompts/*,
docs/concepts/09-auto-towers.md, control-methodology.md.

Стек Phaser3+TS+Vite. Только games/auto-towers/.

После CONFIRMED:
1) STATUS + battle scene path+slots
2) Wave spawner + enemy leak lives
3) 6 towers combat + gold shop between waves
4) 3 heroes + 1 skill/wave + synergies
5) 3 chapters ×10 waves data-driven
6) Meta dust tree
7) SDK RV retry/x2/trial; interstitial after chapter; IAP; cloud
8) Touch placement без мискликов, STORE_CHECKLIST, dist, README

DoD: одна глава = сессия; early easy; build green; ads fair.
Asset IDs/paths: DESIGN_LLM §0 / §21.
```
