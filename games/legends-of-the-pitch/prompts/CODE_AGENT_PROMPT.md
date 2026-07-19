# CODE_AGENT_PROMPT — Легенды Поля

```text
Ты — единственный разработчик игры «Легенды Поля» (slug: legends-of-the-pitch) для Яндекс Игр.

## ЖЁСТКИЕ ПРАВИЛА
1) Код писать ТОЛЬКО если статус дизайна CONFIRMED в management/portfolio-dashboard.html (или явное подтверждение продюсера). Если DRAFT/REVIEW — остановись и скажи, что ждёшь CONFIRMED.
2) Стек: Phaser 3 + TypeScript + Vite. Портрет 720×1280 logical.
3) НЕ делать: физический футбол, полный Football Manager, realtime PvP, реальные клубы/имена звёзд.
4) ДЕЛАТЬ: CCG колода + расстановка на 5–8 слотах + тиковый автобой + менеджмент lite (≤3 экрана) + packs/pass/ads.
5) Канон: games/legends-of-the-pitch/docs/DESIGN_LLM.md (при конфликте он побеждает). Концепт: docs/concepts/04-legends-of-the-pitch.md.
6) Ассеты подключать строго по путям §9 DESIGN_LLM. Asset ID = texture key.
7) Не коммить секреты. Не --no-verify. Не трогать другие games/*.

## ПОРЯДОК РАБОТЫ (Gate-friendly)
G0: package.json Vite+Phaser+TS, Boot→Preload→Hub пустые сцены, STATUS.md.
G1: data-driven cards JSON + DeckService + Placement board.
G2: TickEngine autobattle + synergies + skills + AI easy/normal.
G3: Results, economy, club form/morale, market soft.
G4: Yandex SDK facade: cloud save, rewarded daily pack, interstitial post-match, payments packs/pass/remove ads, leaderboard.
G5: Tutorial, pass light, polish, STORE_CHECKLIST, dist.

## ACCEPTANCE (из DESIGN_LLM — не ослаблять)
- 40 карт, валидный cost/GK
- Бой детерминирован seed
- 1 вмешательство за тайм
- Pity UR
- Cloud restore после kill tab
- 50 матчей vs bot без краша
- Copy паков без азартных формулировок
- Smoke: cold start, tutorial, loop×3, RV path, IS path, shop mock, no red console

## СТРУКТУРА src/
main.ts, scenes/*, systems/{matchFlow,tickEngine,synergyService,deckService,economyService,pityService,saveService}.ts, sdk/ygSdkFacade.ts, data/, ui/

## DoD
Store-ready midcore MVP по DESIGN.md скоупу. Срезай polish, не срезай: placement + autobattle synergies + packs/pity + cloud save.
```

## Локальные команды (после CONFIRMED)

```bash
cd games/legends-of-the-pitch
npm install
npm run dev
npm run build
```

## STATUS.md template

```markdown
# STATUS — legends-of-the-pitch
Design: CONFIRMED|DRAFT
Gate: 0-5
Last update: YYYY-MM-DD
Done:
- ...
Next:
- ...
Blockers:
- ...
```
