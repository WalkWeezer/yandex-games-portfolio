# Neon Bullet — CODE_AGENT_PROMPT

**Статус-гейт:** ⛔ Не начинай писать `games/neon-bullet/src/**`, пока дизайн = **CONFIRMED**.  
Если статус `DRAFT`/`REVIEW` — только уточняй docs/STATUS, не код.

---

## Сообщение агенту (copy-paste целиком)

```
Ты — code-агент игры Neon Bullet для Яндекс Игр.

SOURCE OF TRUTH (читай в этом порядке):
1) games/neon-bullet/docs/DESIGN_LLM.md
2) games/neon-bullet/docs/DESIGN.md
3) docs/concepts/01-neon-bullet.md
4) docs/00-market-analysis-and-portfolio.md
5) Промпт-пакеты в games/neon-bullet/prompts/ (ассеты уже должны лежать в public/assets по контрактам)

STACK: Phaser 3 + TypeScript + Vite. Папка: games/neon-bullet/ только.
Не трогай другие игры.

GATE: Если дизайн не CONFIRMED — остановись и напиши это явно.

КОГДА CONFIRMED — порядок работ:
1) STATUS.md фазы + скелет Vite/Phaser (Boot→Menu→Hub→Loadout→Mission→Result)
2) PlayerController, WeaponSystem, EnemyAI по AC из DESIGN_LLM §3
3) Загрузка tilemap уровней из public/assets/levels
4) Combo + Rank + Progress cloud schema
5) UI screens по §5
6) Yandex SDK wrapper: interstitial(result/death), rewarded(continue|x2|trial_mask),
   payments(remove_ads|packs|premium_mask), leaderboards, cloud
7) Mobile sticks + soft aim assist
8) Tutorial ≤90s
9) Juice: hitstop, shake, VFX keys
10) STORE_CHECKLIST.md + npm run build + README

ЖЁСТКИЕ ПРАВИЛА:
- Нет interstitial mid-fight
- Rewarded только opt-in
- Нет P2W урона
- Asset keys и пути строго по DESIGN_LLM §0.4 и §10
- Delta-time movement
- Русский UI

Definition of Done:
- 12 миссий проходимы на touch
- Ads/IAP/LB/cloud через SDK или DEV_MOCK с тем же API
- build зелёный, STATUS=DONE кандидатом к стору
```

---

## Минимальный список модулей `src/`

```
src/main.ts
src/game/scenes/BootScene.ts
src/game/scenes/MainMenuScene.ts
src/game/scenes/CityHubScene.ts
src/game/scenes/LoadoutScene.ts
src/game/scenes/MissionScene.ts
src/game/scenes/ResultScene.ts
src/game/scenes/ShopScene.ts
src/game/systems/PlayerController.ts
src/game/systems/WeaponSystem.ts
src/game/systems/EnemyAI.ts
src/game/systems/ComboSystem.ts
src/game/systems/MissionFlow.ts
src/game/systems/ProgressService.ts
src/game/ui/...
src/game/sdk/yandex.ts
src/data/weapons.json
src/data/masks.json
src/data/missions.json
```

---

## Acceptance smoke (после кода)

- [ ] Boot loads packs  
- [ ] Clear lvl_apt_01  
- [ ] Death → restart  
- [ ] RV mock continue  
- [ ] Result rank + coins  
- [ ] Cloud roundtrip mock  

---

## Запреты

- Менять дизайн-экономику без обновления DESIGN_LLM  
- Добавлять стелс-сим симулятор  
- Серверный бэкенд
