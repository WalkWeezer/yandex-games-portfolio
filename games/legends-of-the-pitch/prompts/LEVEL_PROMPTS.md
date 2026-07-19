# LEVEL_PROMPTS — Легенды Поля

> Для контент-агента (матчи, сезон, туториал, баланс).  
> Канон: `docs/DESIGN_LLM.md` §3, §10.  
> Выход: JSON в `public/assets/data/` (+ черновики в `refs/levels/`).  
> Код не писать. Физический футбол не придумывать.

## Grammar reminder

Матч = `match_recipe` (seed, opponent_tier, synergy_bias, layout, rewards).  
Поле = слоты 5–8, не клетки match-3.

---

## Prompt — сгенерировать season calendar

```text
Сгенерируй JSON season-calendar.json для football CCG autochess игры Легенды Поля.
8 скриптовых матчей сезона + meta.
Поля: id, week, mode, opponent_tier, opponent_synergy_bias[], board_layout, rewards.soft[min,max], rewards.xp_pass, notes.
Кривая сложности: W1 easy→normal, W2 normal, W3 normal+bias, W4 hard derby/boss.
Каждый 3-й матч derby с бонусом soft.
Только вымышленные имена соперников-клубов.
Без физики мяча.
```

### Expected shape

```json
{
  "seasonId": "arena_s1",
  "durationDays": 42,
  "matches": [
    {
      "id": "s1_m1",
      "week": 1,
      "mode": "quick",
      "opponent_tier": "easy",
      "opponent_synergy_bias": ["Wall"],
      "board_layout": "layout_732_gk",
      "opponent_club_ru": "Неон Юнайтед",
      "rewards": { "soft": [80, 100], "xp_pass": 15 }
    }
  ]
}
```

---

## Prompt — tutorial match

```text
Опиши tutorial match JSON + step script для онбординга:
T1 Hub→Play, T2 place FWD into FWD slot, T3 show synergy 2, T4 use intervention, T5 collect reward.
Opponent easy fixed deck with 1 weak synergy.
Max duration 4 minutes.
Include tip strings in Russian ≤ 60 chars each.
```

---

## Prompt — AI decks by tier

```text
Сгенерируй 30 opponent decks (10 easy / 10 normal / 10 hard) referencing card ids pattern card_{role}_{name}_{rarity}.
Constraints: cost ≤ 18 easy, ≤ 20 normal, ≤ 22 hard; always 1 GK; prefer one synergy cluster.
Output JSON array.
```

---

## Prompt — balance table week1 F2P

```text
Построй таблицу симуляции F2P первой недели:
matches/day=5, winrate=0.55, soft income/spend on upgrades, pack progress.
Verify no hard wall before ranked unlock week3.
Return markdown table + verdict PASS/FAIL.
```

---

## Prompt — pack contents

```text
Сгенерируй packs.json:
daily_rv, starter, premium, mega.
Fields: id, priceType, priceAmount, cardCount, rarityWeights, pityProgress, copy_ru (без азартных слов).
UR pity guarantee at 40 premium-equivalent points.
```

---

## Layout definitions to author

### `layout_732_gk`
```json
{
  "id": "layout_732_gk",
  "slots": [
    { "id": "gk", "zone": "GK", "allowedRoles": ["GK"], "x": 0.5, "y": 0.82 },
    { "id": "def1", "zone": "DEF", "allowedRoles": ["DEF", "FLEX"], "x": 0.35, "y": 0.68 },
    { "id": "def2", "zone": "DEF", "allowedRoles": ["DEF", "FLEX"], "x": 0.65, "y": 0.68 },
    { "id": "mid1", "zone": "MID", "allowedRoles": ["MID", "FLEX"], "x": 0.25, "y": 0.48 },
    { "id": "mid2", "zone": "MID", "allowedRoles": ["MID", "FLEX"], "x": 0.5, "y": 0.48 },
    { "id": "mid3", "zone": "MID", "allowedRoles": ["MID", "FLEX"], "x": 0.75, "y": 0.48 },
    { "id": "fwd1", "zone": "FWD", "allowedRoles": ["FWD", "FLEX"], "x": 0.38, "y": 0.28 },
    { "id": "fwd2", "zone": "FWD", "allowedRoles": ["FWD", "FLEX"], "x": 0.62, "y": 0.28 }
  ]
}
```

### `layout_532`
5 слотов без лишних MID — для туториала/быстрых матчей (упрощение).

---

## Content acceptance

- [ ] 8 season matches  
- [ ] 1 tutorial  
- [ ] 30 AI decks  
- [ ] packs.json + pity  
- [ ] 2 layouts  
- [ ] F2P week1 PASS  
- [ ] Все имена вымышленные  

## Delivery paths

```text
refs/levels/season-calendar.draft.json
refs/levels/tutorial.draft.json
refs/levels/ai-decks.draft.json
refs/levels/packs.draft.json
refs/levels/layouts.draft.json
→ после аппрува: public/assets/data/*.json
```
