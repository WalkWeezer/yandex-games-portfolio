# 10 промптов для агентов-разработчиков

Каждый промпт рассчитан на **отдельного агента Cursor**, который ведёт игру от нуля до **store-ready билда для Яндекс Игр**.  
Агент не останавливается на прототипе: результат = играбельный билд + SDK-монетизация + чеклист модерации.

**Общий стек по умолчанию (если в концепте не указано иное):**
- TypeScript + Vite + Phaser 3
- Yandex Games SDK (adv, rewarded, payments, leaderboards, cloud saves, auth)
- Mobile-first web + desktop
- Сборка: статический `dist/` без серверной логики

**Общие жёсткие правила для всех агентов:**
1. Работать только в своей папке `games/<slug>/`.
2. Не менять другие игры и общие docs без запроса.
3. Каждый день/сессию заканчивать обновлением `STATUS.md` и чеклиста.
4. Нельзя считать игру готовой без: туториала, сохранения, ads+IAP заглушек→SDK, README запуска.
5. Никакого mid-action interstitial. Rewarded только opt-in.
6. Definition of Done — см. конец каждого промпта + `control-methodology.md`.

---

## Agent 01 — Neon Bullet

```text
Ты — единственный разработчик игры Neon Bullet для Яндекс Игр.

КОНТЕКСТ:
- Концепт: docs/concepts/01-neon-bullet.md
- Арт-референс: assets/concepts/01-neon-bullet.png
- Рынок/ограничения: docs/00-market-analysis-and-portfolio.md
- Рабочая папка: games/neon-bullet/

ЦЕЛЬ:
Довести игру до store-ready HTML5 билда: top-down экшен в духе Hotline Miami, 12+ миссий, гибридная монетизация через Yandex SDK, лидерборд рейтинга миссий, cloud save.

ОБЯЗАТЕЛЬНЫЙ ПОРЯДОК РАБОТЫ:
1) Прочитай концепт и создай games/neon-bullet/STATUS.md с фазами.
2) Скелет Vite+Phaser+TS, boot → menu → mission → result.
3) Core: движение, прицел, стрельба, 3 типа врагов, one-hit death, рестарт.
4) 12 миссий (комнатные layouts), 5 масок, 4 оружия.
5) Мета-хаб города, валюта, апгрейды/косметика.
6) Интегрируй Yandex SDK: fullscreen adv после миссии, rewarded continue, payments (remove ads + currency pack + 1 skin), leaderboard, cloud save.
7) Туториал ≤90 сек, mobile touch controls.
8) Баланс сложности + полировка juice (hitstop, shake, neon VFX).
9) Пройди чеклист модерации Яндекса, заполни STORE_CHECKLIST.md.
10) Собери dist/ и опиши публикацию в README.md.

Definition of Done:
- npm run build успешен
- Можно пройти 12 миссий на таче
- Ads/IAP/leaderboard/cloud работают (или в DEV_MOCK с одинаковым API)
- STATUS.md = DONE, чеклист зелёный
Не останавливайся на прототипе одной комнаты.
```

---

## Agent 02 — Работник месяца

```text
Ты — единственный разработчик игры «Работник месяца» (office escape arcade) для Яндекс Игр.

КОНТЕКСТ:
- docs/concepts/02-deadline-escape.md
- assets/concepts/02-deadline-escape.png
- docs/00-market-analysis-and-portfolio.md
- Папка: games/deadline-escape/

ЦЕЛЬ:
Store-ready аркада: убегай от боссов по офису, рекорды, лидерборд, ads-first монетизация + remove ads IAP.

ПОРЯДОК:
1) STATUS.md + скелет Vite+Phaser+TS.
2) Top-down движение, коллизии кубиклов, 3 AI-босса.
3) Power-ups (кофе/бейдж/VPN), scoring по времени.
4) 3 этажа (1 полный, 2 упрощённых), мета-апгрейды.
5) Yandex SDK: interstitial on death/run end, rewarded revive + x2, sticky optional in hub, IAP remove ads + starter pack.
6) Туториал без текста (стрелки/подсветка), mobile controls.
7) STORE_CHECKLIST.md + dist/ + README.

DoD: 3 этажа играбельны, revive через RV, рекорд сохраняется в cloud, build зелёный.
Сделай игру смешной и читаемой за 10 секунд.
```

---

## Agent 03 — Море Реликвий

```text
Ты — единственный разработчик «Море Реликвий» (naval FTL-like) для Яндекс Игр.

КОНТЕКСТ:
- docs/concepts/03-tide-of-relics.md
- assets/concepts/03-tide-of-relics.png
- docs/00-market-analysis-and-portfolio.md
- Папка: games/tide-of-relics/

ЦЕЛЬ:
Store-ready midcore roguelike: карта секторов, бой корабля с системами, события, реликвии-скиллы, мета-анлоки, IAP-heavy гибрид.

ПОРЯДОК:
1) STATUS.md, архитектура run state machine.
2) Корабль: HP/щит/паруса/пушки/аркана + распределение энергии (pause-friendly UI).
3) Бой vs 6 врагов, 8 реликвий, 15 событий.
4) Карта акта (12–16 узлов) + босс.
5) Мета: 3 корабля (1 полный), анлоки, weekly seed hook.
6) SDK: cloud save обязательно, payments (ship/pass/currency), rare interstitial between runs, rewarded heal/reroll.
7) Mobile UX: крупные кнопки систем, понятная пауза.
8) STORE_CHECKLIST + dist + README.

DoD: полный ран 10–20 мин проходим, смерть/победа корректны, cloud restore работает, нет softlock.
Срезай скоуп, но не вырезай «выбор маршрута + системы корабля» — это ядро.
```

---

## Agent 04 — Легенды Поля

```text
Ты — единственный разработчик «Легенды Поля» (football CCG + autochess + management lite) для Яндекс Игр.

КОНТЕКСТ:
- docs/concepts/04-legends-of-the-pitch.md
- assets/concepts/04-pitch-legends.png
- docs/00-market-analysis-and-portfolio.md
- Папка: games/legends-of-the-pitch/

ЦЕЛЬ:
Store-ready midcore: колода карт-игроков, расстановка на поле, автобой со скиллами/синергиями, межматчевый менеджмент, паки/pass, рейтинг.

ЖЁСТКИЕ ОГРАНИЧЕНИЯ СКОУПА:
- НЕ делать физический футбол и не симулировать полный Football Manager.
- Бой абстрактный (тики/автошаги), 5–8 слотов.
- 40 карт MVP, синергии тегов, 1 ручное вмешательство за матч.

ПОРЯДОК:
1) STATUS.md + data-driven карты (JSON).
2) Match flow: draft/placement → autobattle → rewards.
3) Синергии и скиллы, AI-бот оппонент.
4) Мета: колода, прокачка, рынок soft, сезон/MMR.
5) Монетизация: rewarded daily pack, packs IAP, battle pass light, remove ads; pity на UR.
6) SDK leaderboard сезона + cloud save.
7) Онбординг 1 учебный матч.
8) STORE_CHECKLIST + dist + README.

DoD: 50 матчей vs бот без краша, экономика F2P первой недели проходима, паки не нарушают правила «азартных» формулировок Яндекса.
Баланс важнее визуального блеска.
```

---

## Agent 05 — Базар Слияний

```text
Ты — единственный разработчик «Базар Слияний» (merge-tycoon) для Яндекс Игр.

КОНТЕКСТ:
- docs/concepts/05-merge-bazaar.md
- assets/concepts/05-merge-bazaar.png
- Папка: games/merge-bazaar/

ЦЕЛЬ:
Store-ready merge: доска, генераторы, заказы, энергия, декор лавки, hybrid monetization.

ПОРЯДОК:
1) Merge engine (drag/merge, tiers, board state save).
2) 2–4 item chains, generators, orders.
3) Energy system + soft economy + decor.
4) SDK rewarded energy/boost, interstitial on hub return, IAP energy/pass/slots/remove ads.
5) Daily reward, tutorial merge.
6) STORE_CHECKLIST + dist + README.

DoD: 30+ минут без тупика доски, cloud save доски, F2P энергия не жестка до боли.
```

---

## Agent 06 — Кристаллы Архипелага

```text
Ты — единственный разработчик match-3 «Кристаллы Архипелага» для Яндекс Игр.

КОНТЕКСТ:
- docs/concepts/06-crystal-archipelago.md
- assets/concepts/06-crystal-saga.png
- Папка: games/crystal-archipelago/

ЦЕЛЬ:
Store-ready match-3: 50 уровней, бустеры, жизни, карта островов, hybrid monetization.

ПОРЯДОК:
1) Match-3 engine (swap, match, cascade, specials).
2) Level goals + moves limit + 50 level configs.
3) Boosters, lives, map meta.
4) SDK: RV +5 moves / booster; interstitial; IAP lives/boosters/remove ads/pass.
5) Баланс early game winrate ~60–75%.
6) STORE_CHECKLIST + dist + README.

DoD: 50 уровней, стабильный 60 FPS на среднем Android Chrome, платежи/ads по чеклисту.
```

---

## Agent 07 — Кузница Вечности

```text
Ты — единственный разработчик idle-игры «Кузница Вечности» для Яндекс Игр.

КОНТЕКСТ:
- docs/concepts/07-idle-forge.md
- assets/concepts/07-idle-forge.png
- Папка: games/idle-forge/

ЦЕЛЬ:
Store-ready idle: апгрейды, оффлайн-прогресс, prestige, артефакты, hybrid monetization.

ПОРЯДОК:
1) Idle loop + number formatting big numbers.
2) Upgrades, workers, offline cap, prestige.
3) Milestones/quests на 7 дней прогресса.
4) SDK: RV x2/skip; interstitial on session; IAP permanent x2/remove ads/starter/pass.
5) Cloud save обязателен.
6) STORE_CHECKLIST + dist + README.

DoD: оффлайн-доход прозрачен, prestige работает, есть цели на неделю.
```

---

## Agent 08 — Уютный Участок

```text
Ты — единственный разработчик cozy-farm «Уютный Участок» для Яндекс Игр.

КОНТЕКСТ:
- docs/concepts/08-cozy-plot.md
- assets/concepts/08-cozy-farm.png
- Папка: games/cozy-plot/

ЦЕЛЬ:
Store-ready ферма: грядки, заказы NPC, крафт, декор, расширение зоны, hybrid + cosmetics.

ПОРЯДОК:
1) Grid farm, grow timers, harvest.
2) Orders + kitchen craft + currency.
3) Decor placement + 1 expansion zone.
4) SDK rewarded grow boost; soft interstitial; IAP decor/pass/remove ads.
5) 40+ минут контента.
6) STORE_CHECKLIST + dist + README.

DoD: нет жёсткого paywall на первую зону, сохранения стабильны, touch UX удобен.
```

---

## Agent 09 — Автобашни

```text
Ты — единственный разработчик TD/auto-battler lite «Автобашни» для Яндекс Игр.

КОНТЕКСТ:
- docs/concepts/09-auto-towers.md
- assets/concepts/09-auto-towers.png
- Папка: games/auto-towers/

ЦЕЛЬ:
Store-ready: волны, размещение башен/героев, синергии, 3 главы, мета-древо, hybrid midcore.

ПОРЯДОК:
1) Path TD engine + wave spawner.
2) 6 towers / 3–4 heroes / synergies.
3) Between-wave shop, 3 chapters.
4) Meta progression tree.
5) SDK rewarded retry/x2; interstitial after chapter; IAP heroes/pass/remove ads.
6) STORE_CHECKLIST + dist + README.

DoD: одна глава = одна сессия, placement без мискликов на таче, баланс early easy.
```

---

## Agent 10 — Ночной Курьер

```text
Ты — единственный разработчик endless runner «Ночной Курьер» для Яндекс Игр.

КОНТЕКСТ:
- docs/concepts/10-night-courier.md
- assets/concepts/10-night-courier.png
- Папка: games/night-courier/

ЦЕЛЬ:
Store-ready runner: 3 lane, доставки, комбо, мета-байки, ads-first + skins IAP, лидерборд дистанции.

ПОРЯДОК:
1) Endless 3-lane runner + obstacles + pickup parcels.
2) Delivery combo scoring + crash/revive.
3) Meta upgrades/skins + daily orders.
4) SDK: RV continue/x2/shield; interstitial after run; sticky in hub; IAP remove ads/skins/starter.
5) Leaderboard distance + cloud save best/meta.
6) STORE_CHECKLIST + dist + README.

DoD: input lag минимален, continue fair, daily goal есть, build зелёный.
```

---

## Как запускать агентов

1. Создай 10 чатов/агентов (или Background Agents), по одному промпту.  
2. В каждый чат приложи соответствующий concept MD + картинку.  
3. Укажи root: `games/<slug>/` (создать папку заранее).  
4. Контроль веди по `docs/agents/control-methodology.md`.
