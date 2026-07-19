# Море Реликвий (Tide of Relics) — Game Design Document

| Поле | Значение |
|------|----------|
| **Slug** | `tide-of-relics` |
| **Рабочее название** | Море Реликвий |
| **EN** | Tide of Relics |
| **Жанр** | Roguelike-стратегия (FTL-like), naval fantasy |
| **Платформа** | Яндекс Игры (HTML5) |
| **Стек** | Phaser 3 + TypeScript + Vite |
| **Сегмент ЦА** | C — стратегия / midcore 20–40 |
| **Приоритет** | P1 |
| **Статус дизайна** | `DRAFT` — **не кодировать до `CONFIRMED`** |
| **Версия** | 1.0 |
| **Дата** | 2026-07-17 |

---

## 1. Vision

**One-liner:** Проведи эскадру через опасный архипелаг: управляй системами корабля, выбирай маршруты и активируй фэнтезийные скиллы — как FTL, но на море.

**Fantasy:** Мир островов и проклятых течений. Корабли: бриг, галеон, драккар, арканоносец. Враги: пираты, морская нечисть, имперский флот. Реликвии — активные скиллы (шторм, щупальца, огненные ядра).

**Эмоциональный хук:** «Ещё один узел — и босс акта», напряжённый бой с паузой и распределением энергии, последствия выборов в событиях.

**Роль в портфеле:** midcore IAP-heavy LTV-двигатель сегмента C.

---

## 2. Design Pillars

1. **Systems under fire** — бой = распределение энергии по подсистемам под давлением.
2. **Meaningful routes** — карта узлов с tradeoff risk/reward.
3. **Relics as identity** — билды через реликвии, не через сырой DPS paywall.
4. **Pause-friendly mobile** — pause-any-time; крупные hit targets систем.
5. **Fair premium** — платные корабли = другой стиль, не строго сильнее.

---

## 3. Audience

| | |
|--|--|
| **Primary** | 22–38, любят FTL/Slay the Spire/roguelike strategy |
| **Secondary** | казуалы на Easy + сильный туториал |
| **Дифференциатор** | naval fantasy + relic skills + Yandex weekly seeded run |

---

## 4. Core Loop (8–15 мин ран MVP)

```
Меню → выбор корабля/капитана → карта акта
  → узел: бой / событие / магазин / элита / босс
  → бой (realtime + pause): энергия → щиты/пушки/паруса/аркана
  → лут, ремонт, найм
Смерть рана → мета-анлоки → новый ран
```

---

## 5. Systems Overview

### 5.1 Ship systems

| System | Функция | Энергия |
|--------|---------|---------|
| Hull | HP корабля | — |
| Sails | скорость / побег | 1–3 |
| Guns | урон | 1–4 |
| Shield | поглощение | 1–3 |
| Arcana | заряд реликвий / магия | 1–3 |

Игрок кликает систему, чтобы ± энергию из общего пула `reactorPower`.

### 5.2 Combat

- Realtime с паузой (кнопка / hold).
- Вражеские корабли стреляют по системам / корпусу.
- Победа: враг hull≤0. Поражение: player hull≤0.
- Побег: если sails powered и progress bar escape заполнен.

### 5.3 Map

Узлы: `combat`, `elite`, `event`, `shop`, `treasure`, `boss`.  
MVP: 1 акт, 12–16 узлов + босс. Live цель: 3 акта.

### 5.4 Events

Текст + 2–3 выбора с рисками (урон / реликвия / монеты / проклятие).

### 5.5 Relics

Активные скиллы на CD + пассивы. Примеры: Storm Call, Tentacles, Fire Cores, Fog Veil, Tide Mend.

### 5.6 Ships (MVP)

| Ship | Style |
|------|-------|
| Brig (start) | сбалансированный |
| Longship | скорость/побег |
| Galleon | танки/пушки |
| Arcanist (unlock/IAP alt) | магия |

---

## 6. Meta

- Анлок кораблей и стартовых реликвий.  
- Древо капитана (minor perks).  
- Achievements.  
- Weekly seeded run + leaderboard.  
- Cloud save обязателен.

---

## 7. Monetization (IAP-heavy hybrid)

| | |
|--|--|
| Interstitial | между ранами / после поражения (редко) |
| Rewarded | +1 heal, shop reroll, second chance event |
| IAP | premium ship (alt style), battle pass, meta currency, sail cosmetics |
| Soft | дублоны / обломки за раны |

**Fair rule:** платный корабль winrate ≈ стартовому ±5% на skilled play.

---

## 8. Content MVP → Store

| | MVP | Store |
|--|-----|-------|
| Акты | 1 | 2–3 |
| Узлы/акт | 12–16 | 16–20 |
| Корабли | 1 полный + 2 урезанных | 4 |
| Враги | 6 | 10+ |
| Босс | 1 | 1/акт |
| События | 15 | 30 |
| Реликвии | 8 | 20 |

---

## 9. Risks

| Риск | Митигация |
|------|-----------|
| FTL слишком сложен | Easy mode, pause default hint, туториал 3 боя |
| UI боя перегружен | max 5 systems, large buttons, color code |
| Scope creep | жёсткий 1 акт MVP |
| Softlock events | все ветки закрываемы |

---

## 10. KPIs

| Метрика | Цель |
|---------|------|
| First run completion (death or boss) | ≥40% |
| Boss reach rate D1 | ≥15% |
| D1 / D7 | ≥30% / ≥12% |
| IAP conversion | ≥3% |
| Avg run length | 10–18 мин |
| Cloud save success | ≥99% |

---

## 11. Gate

**Код не начинается до `CONFIRMED`.** Детали: `DESIGN_LLM.md`.
