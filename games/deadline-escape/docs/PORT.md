# Работник месяца — PORT freeze (перенос в билд)

> Цель: перенести в игру **только канон**, без багов/инструментов разработки.  
> SoT геймплея: `management/demos/demos-01-02.js` → `FEEL_DEMOS["deadline-escape"]`  
> Чистый вход билда: `games/deadline-escape/play/`  
> `src/` (Phaser/Vite) — после формального `CONFIRMED`; этот пакет — **pre-src freeze**.

---

## 1. Режим

| Режим | Как | DEV∞ / эт± / GOD HUD |
|-------|-----|----------------------|
| **Production** | `play/` (`DEADLINE_PROD=true`) или демка без `?dev=1` | **выкл** |
| **Dev** | дашборд / демка с `?dev=1` | вкл |

Правило: в билд и в Яндекс-превью — только production.

---

## 2. ALLOW — переносить

| Слой | Источник | Примечание |
|------|----------|------------|
| Feel numbers | DESIGN.md §3 + FEEL `TIME_SCALE/minutesPerSecond/totalMin/moveDur/phases` | Не менять при порте |
| Grid / fog / walls | FEEL `buildMap`, `wallGeomOf`, `FOG_BORDER=1` | Как в демке |
| Threats 12 kinds | FEEL `KINDS` + spawn fairness | Без DEV floor scrub |
| Bonuses | coffee world slow-mo · badge 1-hit · coins | Не скорость игрока |
| Copy RU | ЗАСТАВИЛИ РАБОТАТЬ · ПОВЫШЕНИЕ! · tutorial | UI_PROMPTS |
| UI flow | mock-ui / wireframes: Boot→Menu→Hub→Daily→Run→Pause→Caught→Result→Shop | |
| SFX keys | `DEADLINE_SFX` procedural MVP | До wav/mp3 |
| Art in active refs | style-seed, hero sheets/frames, env tiles, layout-feel walls, tone-ui | Только `refs/` |
| SDK hooks | LoadingAPI.ready · GameplayAPI start/stop · RV revive · interstitial 1–2 runs | DEV_MOCK вне Яндекса |

---

## 3. DENY — не переносить

| Артефакт | Почему |
|----------|--------|
| `DEV∞` / immortal / ghostDeath / GOD outline | Читы разработки |
| `эт−` / `эт+` floor scrub | Dev-only |
| `ART_BUST` в HUD игроку | Cache-bust метка |
| Кнопки «кофе/бейдж/удар» в UI | Удалены; баффы только с поля |
| Virtual stick в Beta mock | Скрыт; управление = тап / WASD |
| `archive/**` | Не SoT |
| Boss sheets только в archive | В билде — fallback фигуры, пока нет active refs |
| cutup R&D / `rig/rows/debug_*` | Не SoT |
| `test_deadline_mobs.js` console harness | Только CI/dev |
| Neon Bullet / другие FEEL_DEMOS | Чужой slug |
| Dual-truth hide/chase из pre-feel archive | Запрещено INV |

---

## 4. Структура clean play

```
games/deadline-escape/play/
  index.html          # Yandex HTML5 entry (portrait)
  css/play.css
  js/boot.js          # DEADLINE_PROD + SDK facade
```

Подключает management demos **только** как runtime feel (тот же код), но с `DEADLINE_PROD=true`.  
Мета-экраны (menu/hub) — минимальный shell в `index.html` / boot; полный UI kit остаётся в дашборде Beta для сверки.

---

## 5. Порядок переноса (не прыгать)

1. Freeze feel numbers (уже в DESIGN)  
2. Production-mode feel (без DEV) ✅ этот PR  
3. `play/` вход для стора/модерации  
4. Human CONFIRM → `src/` Phaser по CODE_AGENT_PROMPT  
5. Подключить payments/leaderboard только после G4  

---

## 6. Smoke AC (play)

- [ ] Нет кнопок DEV∞ / эт± на экране  
- [ ] Стены блокируют  
- [ ] Боссы с краёв  
- [ ] 18:00 → ПОВЫШЕНИЕ  
- [ ] Удар → ЗАСТАВИЛИ  
- [ ] Кофе замедляет мир; бейдж — 1 удар  
- [ ] LoadingAPI.ready один раз до меню/рана  
