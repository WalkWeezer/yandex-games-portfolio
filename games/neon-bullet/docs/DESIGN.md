# Neon Bullet — Game Design Document

| Поле | Значение |
|------|----------|
| **Slug** | `neon-bullet` |
| **Рабочее название** | Neon Bullet |
| **Жанр** | 2D top-down экшен (Hotline Miami-like) |
| **Платформа** | Яндекс Игры (HTML5) |
| **Стек** | Phaser 3 + TypeScript + Vite |
| **Сегмент ЦА** | A — экшен / «крутой» казуал, 14–35 |
| **Приоритет портфеля** | P1 |
| **Статус дизайна** | `DRAFT` — **не кодировать до `CONFIRMED`** |
| **Версия документа** | 1.1 |
| **Дата** | 2026-07-17 |

---

## Pass-2 — Feel lock (F1 демка)

> Зафиксировано 2026-07-17. Источник правды раунда: `management/demos/demos-01-02.js` → `FEEL_DEMOS["neon-bullet"]`.  
> Реф feel: JSooter/Neontron (cones + EXIT + restart); бренд/пейджер **не** копировать.

| Поле | Значение |
|------|----------|
| **Core verb** | Планируй маршрут → обходи vision cones → убивай → стой на EXIT |
| **Пространство** | 1–2 комнаты + стены (честные AABB); не open arena |
| **Win** | clear (все враги мертвы) **и** игрок в зоне EXIT |
| **Fail** | попадание / контакт → death → рестарт той же миссии **&lt;400ms** |
| **Ввод** | twin-stick: левый стик = move, правый стик/мышь = aim, кнопка/Space = огонь (на мобиле aim-stick также стреляет) |
| **VFX** | фигуры; смерть = dissolve (12+); **blood не канон** |
| **Анти-вектор** | wave-arena / endless spawn; fire-only-along-facing; win без EXIT; free-roam без стен |

**Feel targets (демка):** за 5–10с понятно «конусы → clear → EXIT».

| Число (как у Работника) | Значение |
|-------------------------|----------|
| Миссии | М1…М12; смерть = рестарт той же; победа → следующая |
| Пресеты комнат | 3 (Дверь / Коридор / Зал), цикл по миссии |
| Разлок ролей | patrol@1 → shotgun@2 → shield@3 |
| Лимит живых | 2 + ⌊(M−1)/2⌋, потолок **4** |
| Между миссиями | **+1%** скорость/агрессия за миссию |
| Внутри миссии (alarm) | до **+25%** turn/shoot после первого обнаружения |
| Feel | dash (Shift/Q/Рывок), combo window 2.2s, kill-rush +35% spd, slow-mo на киллах, cam-kick |
| Карта | мир **540×780** > окна 360×640, камера + миникарта; узкие щели 16px |
| Щит | **3 хита** в фронт → ломается; flinch + BLOCK popup |
| Обоймы | пист 6 · дробовик **2** · SMG 12; пусто → нож |
| Silent | нож тихий; **backstab** = SILENT + combo×2 |
| AI | chase + стрейф + слух выстрелов + каскад тревоги |
| Dev | DEV∞ + ghost-deaths · м−/м+ |

---

## 1. Vision

**One-liner:** Короткие неоновые combat-puzzle рейды сверху: зайди в комнаты, обойди конусы зрения, зачисть, выйди через EXIT — одна ошибка = смерть, рестарт мгновенный.

**Fantasy:** Неоновый нуар конца 80-х. Игрок — наёмник в маске, выполняющий «грязные» заказы в ночном городе. Уровни — квартиры, клубы, парковки, склады. Эстетика важнее реализма: розовый/циан неон, резкий контраст, ударный саунд, стилизованное насилие без расчленёнки.

**Эмоциональный хук:** «Я король комнаты» — чувство контроля через скорость, комбо и рискованный агрессивный стиль. Смерть мгновенна, но рестарт мгновенный. Каждая миссия — 60–120 секунд чистого напряжения.

**Почему Яндекс Игры:** короткий session loop идеально стыкуется с interstitial/RV; маски и оружие дают IAP/косметику; рейтинги миссий — лидерборды платформы; midcore-экшен закрывает сегмент A портфеля.

---

## 2. Design Pillars

1. **Tension through fragility** — 1–2 хита до смерти; ошибка наказывается мгновенно.
2. **Style over realism** — неон, hitstop, shake, blood splatter как VFX-язык, не gore.
3. **Readable chaos** — силуэты врагов и оружия читаются за 0.2 сек на мобильном.
4. **Restart is the loop** — смерть → (опционально RV continue) → мгновенный рестарт той же миссии.
5. **Fair monetization** — ads на паузах; RV = convenience; IAP = косметика/удобство, не урон.

---

## 3. Audience & Positioning

| | |
|--|--|
| **Primary** | 16–28, м+ж, любят аркадный экшен, Hotline/Katana Zero vibe |
| **Secondary** | 14–35 казуалы, пришедшие за «крутой» эстетикой и короткими ранами |
| **Не для** | игроков, ищущих длинный нарратив или сложный stealth-симулятор |
| **Конкуренты-референсы** | Hotline Miami (темп), Enter the Gungeon (комбо-juice), мобильные top-down shooters |
| **Дифференциатор** | свой неоновый IP + маски как пассивные скиллы + рейтинг стиля под Яндекс-лидерборд |

---

## 4. Core Loop

```
Хаб города → выбор маски + оружия → миссия (60–120с)
        ↓
Зачистка комнат (движение + прицел + стрельба/нож)
        ↓
Смерть ──→ RV Continue / мгновенный рестарт
Победа ──→ рейтинг S/A/B/C → soft currency + шанс скина
        ↓
Мета: районы, маски, оружие, daily contract
```

### Session structure

| Фаза | Длительность | Цель |
|------|--------------|------|
| Boot → Menu | ≤3 с | SDK init, cloud load |
| Hub / loadout | 10–30 с | выбор маски, оружия, миссии |
| Mission | 60–120 с | зачистка |
| Result | 5–15 с | оценка, currency, CTA (RV x2) |
| Interstitial | после result / death (не mid-fight) | ads |

---

## 5. Gameplay Systems (overview)

### 5.1 Movement & Aim

- WASD / виртуальный стик — движение.
- Мышь / правый стик / aim-relative touch — прицел.
- Скорость базы: ~180 px/s при tile 32px; sprint нет (маска может дать +move).
- Коллизии: стены, мебель (partial cover для врагов, не для игрока как «неуязвимость»).

### 5.2 Combat

| Оружие | ДПС / роль | Патроны | Особенность |
|--------|------------|---------|-------------|
| Нож | ближний, тихий старт | ∞ | 1 hit kill сзади/вблизи |
| Пистолет | универсал | 12 + pickup | средний урон, быстрый |
| Дробовик | комната | 6 | конус, высокий урон вблизи |
| SMG (временный) | зачистка | 40 | pickup на уровне |

Игрок: **1 HP** (база) или 2 HP с маской «броня». Враги: 1–3 HP по типу.

### 5.3 Enemies (MVP)

| ID | Имя | Поведение | HP |
|----|-----|-----------|-----|
| `en_thug` | Бандит | патруль → chase → melee | 1 |
| `en_gunner` | Стрелок | патруль → aim → shoot | 1 |
| `en_brute` | Громила | slow chase, 2 HP, melee knockback | 2 |
| Boss ×3 | см. контент | уникальные арены | — |

Alert states: `idle → suspicious → alert → combat`. Звук выстрела алертует комнату.

### 5.4 Combo & Ranking

- Убийства в окне ≤2.5 с увеличивают combo.
- Множители: скорость, no-damage, melee kills, weapon variety.
- Итог: **S / A / B / C** → множитель soft currency (×2 / ×1.5 / ×1.2 / ×1).
- Лучший ранг миссии → Yandex Leaderboard `lb_district_<id>`.

### 5.5 Masks (meta passives)

| Маска | Пассив |
|-------|--------|
| Default | — |
| Speed | +15% move |
| Ghost | quieter footsteps (меньше радиус alert) |
| Ammo | +25% ammo capacity |
| Armor | 2 HP |
| Lucky | +10% soft currency |

### 5.6 Death / Continue

- Смерть → overlay: Restart / **RV Continue** (1 раз за попытку миссии) / Hub.
- Continue: полный HP, враги на карте остаются, комбо сбрасывается.
- Interstitial: после отказа от continue / после result screen (частота по политике SDK).

---

## 6. Level Design Vision

- **Комнатный граф:** 3–7 комнат на миссию, двери/проходы, 1–2 pickup.
- **Читаемость:** тёмный пол, неоновые акценты на стенах/вывесках, враги — контрастные силуэты.
- **Flow:** вход → разведка/агро → пик плотности → выход/цель.
- **MVP:** 12 миссий + 3 босса; Store Ready: 15–25 миссий.
- Биомы: квартира, клуб, парковка, склад, офис мафии, крыша.

Детальная грамматика — в `DESIGN_LLM.md`.

---

## 7. Meta Progression

1. **Районы города** — хаб, разблокировка цепочек миссий.
2. **Маски и оружейный шкаф** — за soft / hard / RV trial.
3. **Daily contract** — 1 миссия дня с бонусом ×3 soft.
4. **Season pass** (post-MVP) — 30 уровней косметики.
5. **Cloud save** — прогресс, лучшие ранги, инвентарь.

---

## 8. Economy & Monetization (Yandex hybrid)

### Currencies

| Валюта | Источник | Sink |
|--------|----------|------|
| Soft (`coins`) | миссии, daily, achievements | маски (часть), апгрейды шкафа |
| Hard (`neon`) | IAP, редкие daily, season | премиум-маски, скины, battle pass |

### Ads

| Тип | Когда | Нельзя |
|-----|-------|--------|
| Interstitial | после result / death (не mid-fight) | во время боя, при прицеливании |
| Rewarded | Continue, ×2 награда, trial маска 1 ран | принудительно |
| Sticky | опционально в хабе | поверх HUD боя |

### IAP (MVP)

1. Remove Ads  
2. Soft currency pack  
3. Hard currency pack  
4. Premium mask (косметика + уникальный пассив, не pay-to-win DPS)  
5. Battle Pass (post-MVP ok)

**Запрещено:** paywall на базовый прогресс; покупка урона/неуязвимости.

---

## 9. UI / UX Overview

Экраны: Boot → Main Menu → City Hub → Loadout → Mission HUD → Pause → Death/Continue → Result → Shop.

Принципы: крупный touch (≥44px), прицел не перекрыт UI, неон-акценты CTA, русский UI по умолчанию.

---

## 10. Content List (MVP → Store)

| Контент | MVP | Store Ready |
|---------|-----|-------------|
| Миссии | 12 | 20+ |
| Боссы | 1 | 3 |
| Типы врагов | 3 | 5 |
| Маски | 5 | 12 |
| Оружие | 4 | 6 |
| Биомы | 3 | 6 |
| Daily | да | да + weekly ranked |

---

## 11. Audio / Juice

- Саундтрек: darksynth / neon pulse, loop на миссию.
- SFX: выстрелы, melee, death stinger, door, pickup, UI click.
- Juice: hitstop 40–80 ms, screen shake, muzzle flash, blood VFX (стилизованный), combo popup.

---

## 12. Technical Constraints

- Phaser 3 + TS + Vite, static `dist/`.
- Yandex Games SDK: adv, rewarded, payments, leaderboard, player, cloud.
- Mobile-first + desktop; target 60 fps на mid mobile.
- Туториал ≤90 сек.
- Без серверной логики.

---

## 13. Risks & Mitigations

| Риск | Митигация |
|------|-----------|
| Слишком хардкор → отток | маски Armor/Continue RV; мягче первые 3 миссии |
| Цензура насилия | стилизованная кровь, без расчленёнки, маски скрывают лица |
| «Клон Hotline» | уникальный неон-IP, маски, рейтинги, свой саунд |
| Touch aim плохой | auto-aim soft assist (опционально в настройках), крупные hitbox |
| Scope creep комнат | строгий бюджет 12 миссий MVP |

---

## 14. KPIs & Success Metrics

| Метрика | Цель closed test |
|---------|------------------|
| Tutorial completion | ≥70% |
| D1 retention | ≥25% |
| Avg session | ≥8 мин |
| Missions cleared / user D1 | ≥3 |
| RV CTR (continue) | ≥15% impressions→start |
| Crash-free 30 мин | ≥99% |
| Store rating | ≥4.2 после 100 отзывов |

---

## 15. Open Questions

1. Soft auto-aim по умолчанию на mobile — on/off?
2. Stealth как опциональный слой или только «тише шаги»?
3. Season pass в MVP или сразу после soft launch?

---

## 16. Gate

**Код (`games/neon-bullet/src/`) не пишется, пока статус дизайна в portfolio-dashboard = `CONFIRMED`.**

Связанные файлы: `DESIGN_LLM.md`, `prompts/*`, концепт `docs/concepts/01-neon-bullet.md`.
